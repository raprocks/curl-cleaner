import { normalizeCurl, tokenizeCurl } from '$lib/curl-cleaner';

export type ValidationStatus = 'idle' | 'valid' | 'warning' | 'invalid';

export type CurlValidation = {
	status: ValidationStatus;
	errors: string[];
	warnings: string[];
	summary?: {
		method: string;
		url: string;
		headerCount: number;
		hasBody: boolean;
	};
};

const FLAGS_REQUIRING_VALUE = new Set([
	'-h',
	'--header',
	'-x',
	'--request',
	'-d',
	'--data',
	'--data-raw',
	'--data-binary',
	'--data-urlencode',
	'-b',
	'--cookie',
	'--cookie-jar',
	'-a',
	'--user-agent',
	'-e',
	'--referer',
	'-u',
	'--user',
	'-f',
	'--form',
	'-o',
	'--output',
	'--url',
	'-T',
	'--upload-file',
	'-m',
	'--max-time',
	'--connect-timeout',
	'-w',
	'--write-out',
	'-K',
	'--config'
]);

const BOOLEAN_FLAGS = new Set([
	'--compressed',
	'--http1.1',
	'--http2',
	'--http3',
	'-s',
	'-S',
	'-sS',
	'-v',
	'--verbose',
	'-i',
	'--include',
	'-L',
	'--location',
	'-I',
	'--head',
	'-G',
	'--get',
	'-k',
	'--insecure',
	'-n',
	'-N',
	'--path-as-is',
	'--ssl-no-revoke',
	'-0',
	'--http1.0',
	'-4',
	'-6',
	'-#',
	'--progress-bar'
]);

const KNOWN_FLAGS = new Set([...FLAGS_REQUIRING_VALUE, ...BOOLEAN_FLAGS]);

function parseHeader(raw: string): { name: string; value: string } | null {
	const colon = raw.indexOf(':');
	if (colon <= 0) return null;
	const name = raw.slice(0, colon).trim();
	if (!name) return null;
	return { name, value: raw.slice(colon + 1).trim() };
}

function findUnclosedQuote(input: string): string | null {
	for (let q = 0; q < input.length; q++) {
		const quote = input[q];
		if (quote !== "'" && quote !== '"') continue;
		let i = q + 1;
		while (i < input.length) {
			if (quote === '"' && input[i] === '\\') {
				i += 2;
				continue;
			}
			if (input[i] === quote) break;
			i++;
		}
		if (i >= input.length) return `Unclosed ${quote} quote`;
		q = i;
	}
	return null;
}

function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function nextTokenIsValue(tokens: string[], index: number): boolean {
	const next = tokens[index + 1];
	return Boolean(next && !next.startsWith('-'));
}

export function validateCurl(raw: string): CurlValidation {
	const trimmed = raw.trim();
	if (!trimmed) {
		return { status: 'idle', errors: [], warnings: [] };
	}

	const errors: string[] = [];
	const warnings: string[] = [];

	const quoteError = findUnclosedQuote(trimmed);
	if (quoteError) errors.push(quoteError);

	const normalized = normalizeCurl(trimmed);
	const tokens = tokenizeCurl(normalized);

	if (tokens.length === 0 || tokens[0].toLowerCase() !== 'curl') {
		errors.push('Command must start with "curl".');
		return { status: 'invalid', errors, warnings };
	}

	let url = '';
	let method = 'GET';
	let headerCount = 0;
	let hasBody = false;

	for (let i = 1; i < tokens.length; i++) {
		const token = tokens[i];
		const lower = token.toLowerCase();

		if (token.startsWith('-')) {
			if (FLAGS_REQUIRING_VALUE.has(lower)) {
				if (!nextTokenIsValue(tokens, i)) {
					errors.push(`Flag "${token}" is missing its value.`);
					continue;
				}
				const value = tokens[++i];

				if (lower === '-h' || lower === '--header') {
					if (!parseHeader(value)) {
						errors.push(`Invalid header format: expected "Name: value".`);
					} else {
						headerCount++;
					}
					continue;
				}

				if (lower === '-x' || lower === '--request') {
					method = value.toUpperCase();
					continue;
				}

				if (
					lower === '-d' ||
					lower === '--data' ||
					lower === '--data-raw' ||
					lower === '--data-binary' ||
					lower === '--data-urlencode'
				) {
					hasBody = true;
					if (!value) warnings.push(`"${token}" has an empty body.`);
					continue;
				}

				if (lower === '--url') {
					url = value;
					continue;
				}

				continue;
			}

			if (!KNOWN_FLAGS.has(lower)) {
				warnings.push(`Unrecognized flag "${token}" — may still work in your curl version.`);
			}

			continue;
		}

		if (!url) url = token;
	}

	if (!url) {
		errors.push('No URL found. Paste a full DevTools "Copy as cURL" command.');
	} else if (!isValidUrl(url)) {
		const preview = url.length > 48 ? `${url.slice(0, 45)}…` : url;
		warnings.push(`URL "${preview}" may not be a valid http(s) URL.`);
	}

	if (hasBody && method === 'GET') {
		warnings.push('Request has a body but method is GET — did you mean POST?');
	}

	const status: ValidationStatus =
		errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid';

	return {
		status,
		errors,
		warnings,
		summary: url ? { method, url, headerCount, hasBody } : undefined
	};
}
