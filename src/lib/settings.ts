export type CleanerConfig = {
	/** Keep `Cookie` header and `-b` / `--cookie` flags. */
	keepCookie: boolean;
	/** Remove headers whose names start with `X-`. */
	stripXHeaders: boolean;
	/** Header names to always remove (one per line in UI, case-insensitive). */
	denyHeaders: string[];
	/** Header names to always keep; overrides deny and default rules. */
	allowHeaders: string[];
	/** Collapse output to a single line (no line continuations or extra whitespace). */
	compress: boolean;
};

export const STORAGE_KEY = 'curl-cleaner-settings';

export const DEFAULT_CONFIG: CleanerConfig = {
	keepCookie: true,
	stripXHeaders: true,
	denyHeaders: [],
	allowHeaders: [],
	compress: false
};

export function parseHeaderList(text: string): string[] {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

export function formatHeaderList(headers: string[]): string {
	return headers.join('\n');
}

export function loadConfig(): CleanerConfig {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_CONFIG };

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT_CONFIG };
		const parsed = JSON.parse(raw) as Partial<CleanerConfig>;
		return {
			keepCookie: parsed.keepCookie ?? DEFAULT_CONFIG.keepCookie,
			stripXHeaders: parsed.stripXHeaders ?? DEFAULT_CONFIG.stripXHeaders,
			denyHeaders: Array.isArray(parsed.denyHeaders) ? parsed.denyHeaders : [],
			allowHeaders: Array.isArray(parsed.allowHeaders) ? parsed.allowHeaders : [],
			compress: parsed.compress ?? DEFAULT_CONFIG.compress
		};
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

export function saveConfig(config: CleanerConfig): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
