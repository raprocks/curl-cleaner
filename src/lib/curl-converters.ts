import { normalizeCurl, tokenizeCurl } from '$lib/curl-cleaner';

export type CurlParse = {
	url: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
	bodyFlag?: string;
};

function parseHeader(raw: string): { name: string; value: string } | null {
	const colon = raw.indexOf(':');
	if (colon <= 0) return null;
	const name = raw.slice(0, colon).trim();
	if (!name) return null;
	return { name, value: raw.slice(colon + 1).trim() };
}

function nextTokenIsValue(tokens: string[], index: number): boolean {
	const next = tokens[index + 1];
	return Boolean(next && !next.startsWith('-'));
}

export function parseCurl(raw: string): CurlParse | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	const tokens = tokenizeCurl(normalizeCurl(trimmed));
	if (tokens.length === 0 || tokens[0].toLowerCase() !== 'curl') return null;

	let url = '';
	let method = 'GET';
	const headers: Record<string, string> = {};
	let body: string | undefined;
	let bodyFlag: string | undefined;

	for (let i = 1; i < tokens.length; i++) {
		const token = tokens[i];
		const lower = token.toLowerCase();

		if (token.startsWith('-')) {
			if (lower === '-h' || lower === '--header') {
				const rawHeader = tokens[++i];
				if (!rawHeader) continue;
				const parsed = parseHeader(rawHeader);
				if (parsed) headers[parsed.name] = parsed.value;
				continue;
			}

			if (lower === '-x' || lower === '--request') {
				method = (tokens[++i] ?? 'GET').toUpperCase();
				continue;
			}

			if (
				lower === '-d' ||
				lower === '--data' ||
				lower === '--data-raw' ||
				lower === '--data-binary' ||
				lower === '--data-urlencode'
			) {
				body = tokens[++i] ?? '';
				bodyFlag = lower;
				continue;
			}

			if (lower === '--url') {
				url = tokens[++i] ?? url;
				continue;
			}

			if (nextTokenIsValue(tokens, i)) i++;
			continue;
		}

		if (!url) url = token;
	}

	if (!url) return null;
	if (body && method === 'GET') method = 'POST';

	return { url, method, headers, body, bodyFlag };
}

function jsString(value: string): string {
	return JSON.stringify(value);
}

function pythonString(value: string): string {
	if (!value.includes("'") || value.includes('"')) {
		return JSON.stringify(value);
	}
	return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function curlToFetch(raw: string): { output: string; error?: string } {
	const parsed = parseCurl(raw);
	if (!parsed) return { output: '', error: 'Paste a valid curl command first.' };

	const lines: string[] = [];
	const opts: string[] = [];

	opts.push(`method: ${jsString(parsed.method)}`);

	const headerEntries = Object.entries(parsed.headers);
	if (headerEntries.length > 0) {
		const headerLines = headerEntries
			.map(([key, value]) => `    ${jsString(key)}: ${jsString(value)}`)
			.join(',\n');
		opts.push(`headers: {\n${headerLines}\n  }`);
	}

	if (parsed.body !== undefined) {
		opts.push(`body: ${jsString(parsed.body)}`);
	}

	const optsBlock = opts.length > 0 ? `, {\n  ${opts.join(',\n  ')}\n}` : '';
	lines.push(`const response = await fetch(${jsString(parsed.url)}${optsBlock});`);
	lines.push('const data = await response.json();');
	lines.push('console.log(data);');

	return { output: lines.join('\n') };
}

export function curlToPython(raw: string): { output: string; error?: string } {
	const parsed = parseCurl(raw);
	if (!parsed) return { output: '', error: 'Paste a valid curl command first.' };

	const lines: string[] = ['import requests', ''];
	const args: string[] = [];

	args.push(pythonString(parsed.url));

	const headerEntries = Object.entries(parsed.headers);
	if (headerEntries.length > 0) {
		const headerLines = headerEntries
			.map(([key, value]) => `    ${pythonString(key)}: ${pythonString(value)}`)
			.join(',\n');
		args.push(`headers={\n${headerLines}\n}`);
	}

	if (parsed.body !== undefined) {
		args.push(`data=${pythonString(parsed.body)}`);
	}

	const method = parsed.method.toLowerCase();
	if (method !== 'get') {
		args.push(`method=${pythonString(method)}`);
	}

	lines.push(`response = requests.request(${args.join(', ')})`);
	lines.push('print(response.json())');

	return { output: lines.join('\n') };
}
