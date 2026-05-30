import type { CleanerConfig } from '$lib/settings';
import { DEFAULT_CONFIG } from '$lib/settings';

/** Browser / DevTools headers that are not needed for reproducing the request. */
const DEFAULT_STRIP_HEADERS = new Set([
	'accept',
	'accept-language',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'cache-control',
	'connection',
	'content-length',
	'host',
	'origin',
	'pragma',
	'referer',
	'sec-fetch-dest',
	'sec-fetch-mode',
	'sec-fetch-site',
	'sec-fetch-user',
	'sec-gpc',
	'upgrade-insecure-requests',
	'user-agent',
	'dnt',
	'priority',
	'te',
	'if-none-match',
	'if-modified-since'
]);

const BASE_STRIP_FLAGS = new Set([
	'--compressed',
	'-A',
	'--user-agent',
	'-e',
	'--referer',
	'--http1.1',
	'--http2',
	'-s',
	'-S',
	'-sS',
	'-v',
	'--verbose',
	'-i',
	'--include',
	'-L',
	'--location'
]);

const COOKIE_FLAGS = new Set(['-b', '--cookie', '--cookie-jar']);

export type CleanResult = {
	output: string;
	error?: string;
	headersRemoved: number;
	bytesBefore: number;
	bytesAfter: number;
};

function normalizeHeaderName(name: string): string {
	return name.toLowerCase().trim();
}

function listHas(headers: string[], name: string): boolean {
	const lower = normalizeHeaderName(name);
	return headers.some((h) => normalizeHeaderName(h) === lower);
}

export function shouldStripHeader(name: string, config: CleanerConfig = DEFAULT_CONFIG): boolean {
	const lower = normalizeHeaderName(name);

	if (listHas(config.allowHeaders, lower)) return false;
	if (listHas(config.denyHeaders, lower)) return true;

	if (config.keepCookie && lower === 'cookie') return false;

	if (config.stripXHeaders && lower.startsWith('x-')) return true;

	if (DEFAULT_STRIP_HEADERS.has(lower)) return true;
	if (lower.startsWith('sec-ch-ua')) return true;
	if (lower.startsWith('sec-fetch-')) return true;

	return false;
}

function shouldStripFlag(flag: string, config: CleanerConfig): boolean {
	const lower = flag.toLowerCase();
	if (BASE_STRIP_FLAGS.has(lower)) return true;
	if (!config.keepCookie && COOKIE_FLAGS.has(lower)) return true;
	return false;
}

function flagConsumesNextArg(flag: string): boolean {
	const lower = flag.toLowerCase();
	return ['-b', '--cookie', '-A', '--user-agent', '-e', '--referer'].includes(lower);
}

/** Collapse line continuations and extra whitespace from DevTools copy-paste. */
export function normalizeCurl(input: string): string {
	return input
		.replace(/\\\s*\r?\n\s*/g, ' ')
		.replace(/\r?\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Tokenize a curl command respecting single- and double-quoted segments. */
export function tokenizeCurl(input: string): string[] {
	const tokens: string[] = [];
	let i = 0;

	while (i < input.length) {
		while (i < input.length && /\s/.test(input[i])) i++;
		if (i >= input.length) break;

		const quote = input[i] === "'" || input[i] === '"' ? input[i] : null;
		if (quote) {
			i++;
			let value = '';
			while (i < input.length) {
				if (input[i] === '\\' && i + 1 < input.length) {
					value += input[++i];
					i++;
					continue;
				}
				if (input[i] === quote) {
					i++;
					break;
				}
				value += input[i++];
			}
			tokens.push(value);
		} else {
			let value = '';
			while (i < input.length && !/\s/.test(input[i])) value += input[i++];
			tokens.push(value);
		}
	}

	return tokens;
}

function parseHeader(raw: string): { name: string; value: string } | null {
	const colon = raw.indexOf(':');
	if (colon === -1) return null;
	return {
		name: raw.slice(0, colon).trim(),
		value: raw.slice(colon + 1).trim()
	};
}

function quoteArg(value: string, force = false): string {
	if (!force && !/[\s'"\\$`]/.test(value)) return value;
	if (!value.includes("'")) return `'${value}'`;
	return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function formatCurl(parts: {
	url: string;
	method?: string;
	headers: Array<{ name: string; value: string }>;
	data?: { flag: string; body: string };
}): string {
	const lines: string[] = [`curl ${quoteArg(parts.url, true)} \\`];

	if (parts.method && parts.method.toUpperCase() !== 'GET') {
		lines.push(`  -X ${parts.method.toUpperCase()} \\`);
	}

	for (const h of parts.headers) {
		lines.push(`  -H ${quoteArg(`${h.name}: ${h.value}`, true)} \\`);
	}

	if (parts.data) {
		lines.push(`  ${parts.data.flag} ${quoteArg(parts.data.body, true)}`);
	} else {
		lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, '');
	}

	return lines.join('\n');
}

/** Collapse multiline curl (backslash continuations) into one line. */
export function compressCurlOutput(output: string): string {
	return output
		.replace(/\\\s*\r?\n\s*/g, ' ')
		.replace(/\r?\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function cleanCurl(raw: string, config: CleanerConfig = DEFAULT_CONFIG): CleanResult {
	const bytesBefore = raw.length;
	const normalized = normalizeCurl(raw);

	if (!normalized) {
		return { output: '', bytesBefore, bytesAfter: 0, headersRemoved: 0 };
	}

	const tokens = tokenizeCurl(normalized);
	if (tokens.length === 0 || tokens[0].toLowerCase() !== 'curl') {
		return {
			output: raw,
			error: 'Input does not look like a curl command (expected to start with "curl").',
			bytesBefore,
			bytesAfter: raw.length,
			headersRemoved: 0
		};
	}

	let url = '';
	let method: string | undefined;
	const keptHeaders: Array<{ name: string; value: string }> = [];
	let data: { flag: string; body: string } | undefined;
	let headersRemoved = 0;
	const passthrough: Array<{ flag: string; value?: string }> = [];

	for (let i = 1; i < tokens.length; i++) {
		const token = tokens[i];
		const lower = token.toLowerCase();

		if (token.startsWith('-')) {
			if (shouldStripFlag(lower, config)) {
				if (flagConsumesNextArg(lower)) i++;
				continue;
			}

			if (lower === '-h' || lower === '--header') {
				const rawHeader = tokens[++i];
				if (!rawHeader) continue;
				const parsed = parseHeader(rawHeader);
				if (!parsed) continue;
				if (shouldStripHeader(parsed.name, config)) {
					headersRemoved++;
				} else {
					keptHeaders.push(parsed);
				}
				continue;
			}

			if (lower === '-x' || lower === '--request') {
				method = tokens[++i];
				continue;
			}

			if (lower === '--data-raw' || lower === '--data' || lower === '-d') {
				data = { flag: lower === '-d' ? '-d' : lower, body: tokens[++i] ?? '' };
				continue;
			}

			if (lower === '-u' || lower === '--user' || lower === '-f' || lower === '--form') {
				passthrough.push({ flag: token, value: tokens[++i] });
				continue;
			}

			if (COOKIE_FLAGS.has(lower) && config.keepCookie) {
				passthrough.push({ flag: token, value: tokens[++i] });
				continue;
			}

			if (!shouldStripFlag(lower, config)) {
				passthrough.push({
					flag: token,
					value: tokens[i + 1]?.startsWith('-') ? undefined : tokens[++i]
				});
			}
			continue;
		}

		if (!url) url = token;
	}

	if (!url) {
		return {
			output: raw,
			error: 'Could not find a URL in the curl command.',
			bytesBefore,
			bytesAfter: raw.length,
			headersRemoved
		};
	}

	const seen = new Map<string, { name: string; value: string }>();
	for (const h of keptHeaders) {
		seen.set(h.name.toLowerCase(), h);
	}
	const uniqueHeaders = [...seen.values()];

	const priority = ['authorization', 'cookie', 'content-type'];
	uniqueHeaders.sort((a, b) => {
		const ai = priority.indexOf(a.name.toLowerCase());
		const bi = priority.indexOf(b.name.toLowerCase());
		return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
	});

	let output = formatCurl({ url, method, headers: uniqueHeaders, data });

	for (const p of passthrough) {
		output +=
			p.value !== undefined
				? ` \\\n  ${p.flag} ${quoteArg(p.value, true)}`
				: ` \\\n  ${p.flag}`;
	}

	if (config.compress) {
		output = compressCurlOutput(output);
	}

	return {
		output,
		bytesBefore,
		bytesAfter: output.length,
		headersRemoved
	};
}
