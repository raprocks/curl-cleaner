export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'curl-cleaner-theme';

export function loadTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'system';
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	return 'system';
}

export function saveTheme(theme: Theme): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return theme;
}

export function applyTheme(resolved: 'light' | 'dark'): void {
	document.documentElement.dataset.theme = resolved;
}

let preference: Theme = 'system';

export function initTheme(): () => void {
	preference = loadTheme();
	applyTheme(resolveTheme(preference));

	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const onChange = () => {
		if (preference === 'system') applyTheme(resolveTheme('system'));
	};
	mq.addEventListener('change', onChange);
	return () => mq.removeEventListener('change', onChange);
}

export function getThemePreference(): Theme {
	return preference;
}

export function getResolvedTheme(): 'light' | 'dark' {
	return resolveTheme(preference);
}

export function setTheme(theme: Theme): void {
	preference = theme;
	saveTheme(theme);
	applyTheme(resolveTheme(theme));
}

export function toggleTheme(): Theme {
	const next: Theme = getResolvedTheme() === 'dark' ? 'light' : 'dark';
	setTheme(next);
	return next;
}
