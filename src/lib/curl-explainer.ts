import { normalizeCurl, shouldStripHeader, tokenizeCurl } from '$lib/curl-cleaner';
import type { CleanerConfig } from '$lib/settings';
import { DEFAULT_CONFIG } from '$lib/settings';

export type ExplainPart = {
	kind: 'url' | 'method' | 'header' | 'body' | 'flag' | 'auth' | 'cookie';
	label: string;
	value?: string;
	description: string;
	note?: string;
};

export type CurlExplanation = {
	parts: ExplainPart[];
	method: string;
	url?: string;
};

const FLAG_DESCRIPTIONS: Record<string, string> = {
	'--compressed': 'Asks curl to decompress gzip/deflate responses automatically.',
	'-s': 'Silent mode — hides the progress meter.',
	'-S': 'Shows errors even in silent mode.',
	'-sS': 'Silent except errors.',
	'-v': 'Verbose — prints request and response headers to stderr.',
	'--verbose': 'Verbose — prints request and response headers to stderr.',
	'-i': 'Includes response headers in the output.',
	'--include': 'Includes response headers in the output.',
	'-L': 'Follows HTTP redirects (3xx).',
	'--location': 'Follows HTTP redirects (3xx).',
	'-I': 'Sends a HEAD request (headers only, no body).',
	'--head': 'Sends a HEAD request (headers only, no body).',
	'-G': 'Appends -d data to the URL query string instead of the body.',
	'--get': 'Appends -d data to the URL query string instead of the body.',
	'-k': 'Skips TLS certificate verification (insecure).',
	'--insecure': 'Skips TLS certificate verification (insecure).',
	'--http1.1': 'Forces HTTP/1.1.',
	'--http2': 'Attempts HTTP/2.',
	'-b': 'Sends cookies from a string or file.',
	'--cookie': 'Sends cookies from a string or file.',
	'-A': 'Sets the User-Agent header.',
	'--user-agent': 'Sets the User-Agent header.',
	'-e': 'Sets the Referer header.',
	'--referer': 'Sets the Referer header.',
	'-u': 'HTTP basic authentication (username:password).',
	'--user': 'HTTP basic authentication (username:password).',
	'-f': 'Multipart form upload.',
	'--form': 'Multipart form upload.',
	'-o': 'Writes the response body to a file.',
	'--output': 'Writes the response body to a file.',
	'--url': 'Explicit request URL (alternative to positional URL).'
};

const HEADER_DESCRIPTIONS: Record<string, string> = {
	authorization: 'Authenticates the request — usually a Bearer token or API key.',
	'content-type': 'Declares the format of the request body (e.g. application/json).',
	accept: 'Browser tells the server which response formats it prefers.',
	'accept-language': 'Browser language preferences for localized responses.',
	'accept-encoding': 'Compression formats the client can decode (gzip, br, etc.).',
	cookie: 'Session or auth cookies stored by the browser for this site.',
	origin: 'Page origin that triggered the request — used for CORS checks.',
	referer: 'URL of the page that linked to this request.',
	'user-agent': 'Identifies the browser and OS — copied from DevTools.',
	'sec-fetch-dest': 'Browser hint: what the response will be used for (empty, document, etc.).',
	'sec-fetch-mode': 'Browser hint: how the request was made (cors, navigate, etc.).',
	'sec-fetch-site': 'Browser hint: relationship between origin and target (same-site, cross-site).',
	'sec-fetch-user': 'Browser hint: whether the request was user-initiated.',
	'sec-gpc': 'Global Privacy Control signal from the browser.',
	connection: 'HTTP connection management — curl sets this automatically.',
	host: 'Target hostname — curl derives this from the URL.',
	'content-length': 'Body size in bytes — usually computed by curl.',
	'cache-control': 'Caching directives for the request.',
	priority: 'Browser request priority hint.',
	'x-requested-with': 'Often XMLHttpRequest — indicates an AJAX call from a web app.'
};

function parseHeader(raw: string): { name: string; value: string } | null {
	const colon = raw.indexOf(':');
	if (colon <= 0) return null;
	const name = raw.slice(0, colon).trim();
	if (!name) return null;
	return { name, value: raw.slice(colon + 1).trim() };
}

function truncate(value: string, max = 56): string {
	if (value.length <= max) return value;
	return `${value.slice(0, max - 1)}…`;
}

function headerDescription(name: string): string {
	const lower = name.toLowerCase();
	if (HEADER_DESCRIPTIONS[lower]) return HEADER_DESCRIPTIONS[lower];
	if (lower.startsWith('sec-ch-ua')) {
		return 'Client hints about browser brand, version, and platform.';
	}
	if (lower.startsWith('sec-fetch-')) {
		return 'Browser security metadata — not needed to replay the API call.';
	}
	if (lower.startsWith('x-')) {
		return 'Custom application header (API-specific).';
	}
	return 'HTTP request header.';
}

function headerKind(name: string): ExplainPart['kind'] {
	const lower = name.toLowerCase();
	if (lower === 'authorization') return 'auth';
	if (lower === 'cookie') return 'cookie';
	return 'header';
}

function bodyDescription(flag: string): string {
	if (flag === '--data-raw') {
		return 'Request body sent as-is (typical for JSON from DevTools).';
	}
	if (flag === '--data') {
		return 'Request body; curl may add a Content-Type if missing.';
	}
	if (flag === '--data-binary') {
		return 'Request body sent without URL-encoding.';
	}
	if (flag === '--data-urlencode') {
		return 'Request body URL-encoded (common for form fields).';
	}
	return 'Request body payload.';
}

function nextTokenIsValue(tokens: string[], index: number): boolean {
	const next = tokens[index + 1];
	return Boolean(next && !next.startsWith('-'));
}

export function explainCurl(raw: string, config: CleanerConfig = DEFAULT_CONFIG): CurlExplanation {
	const trimmed = raw.trim();
	if (!trimmed) return { parts: [], method: 'GET' };

	const tokens = tokenizeCurl(normalizeCurl(trimmed));
	if (tokens.length === 0 || tokens[0].toLowerCase() !== 'curl') {
		return { parts: [], method: 'GET' };
	}

	const parts: ExplainPart[] = [];
	let url = '';
	let method = 'GET';

	for (let i = 1; i < tokens.length; i++) {
		const token = tokens[i];
		const lower = token.toLowerCase();

		if (token.startsWith('-')) {
			if (lower === '-h' || lower === '--header') {
				const rawHeader = tokens[++i];
				if (!rawHeader) continue;
				const parsed = parseHeader(rawHeader);
				if (!parsed) continue;

				const stripped = shouldStripHeader(parsed.name, config);
				parts.push({
					kind: headerKind(parsed.name),
					label: parsed.name,
					value: truncate(parsed.value),
					description: headerDescription(parsed.name),
					note: stripped ? 'Removed when cleaning (browser noise).' : undefined
				});
				continue;
			}

			if (lower === '-x' || lower === '--request') {
				method = (tokens[++i] ?? 'GET').toUpperCase();
				parts.push({
					kind: 'method',
					label: '-X',
					value: method,
					description: `HTTP method override — sends a ${method} request instead of the default.`
				});
				continue;
			}

			if (
				lower === '-d' ||
				lower === '--data' ||
				lower === '--data-raw' ||
				lower === '--data-binary' ||
				lower === '--data-urlencode'
			) {
				const body = tokens[++i] ?? '';
				parts.push({
					kind: 'body',
					label: lower,
					value: truncate(body),
					description: bodyDescription(lower)
				});
				continue;
			}

			if (lower === '-b' || lower === '--cookie') {
				parts.push({
					kind: 'cookie',
					label: lower,
					value: truncate(tokens[++i] ?? ''),
					description: FLAG_DESCRIPTIONS[lower] ?? 'Sends cookies with the request.',
					note: config.keepCookie ? undefined : 'Removed when cleaning.'
				});
				continue;
			}

			if (lower === '-u' || lower === '--user') {
				parts.push({
					kind: 'auth',
					label: lower,
					value: '••••••',
					description: FLAG_DESCRIPTIONS[lower] ?? 'Basic authentication credentials.'
				});
				continue;
			}

			if (lower === '--url') {
				url = tokens[++i] ?? url;
				continue;
			}

			if (FLAG_DESCRIPTIONS[lower]) {
				parts.push({
					kind: 'flag',
					label: lower,
					description: FLAG_DESCRIPTIONS[lower]
				});
				continue;
			}

			if (nextTokenIsValue(tokens, i)) {
				const value = tokens[++i];
				parts.push({
					kind: 'flag',
					label: lower,
					value: truncate(value),
					description: 'curl option with a value.'
				});
			} else {
				parts.push({
					kind: 'flag',
					label: lower,
					description: 'curl command-line flag.'
				});
			}
			continue;
		}

		if (!url) url = token;
	}

	if (url) {
		let host = '';
		try {
			host = new URL(url).host;
		} catch {
			/* ignore */
		}
		parts.unshift({
			kind: 'url',
			label: 'URL',
			value: truncate(url, 72),
			description: host
				? `Request target — sends the HTTP request to ${host}.`
				: 'Request target URL.'
		});
	}

	return { parts, method, url: url || undefined };
}
