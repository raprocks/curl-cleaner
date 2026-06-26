export type SeoRoute = {
	path: string;
	changefreq: 'weekly' | 'monthly';
	priority: number;
	lastmod?: string;
};

export const seoRoutes: SeoRoute[] = [
	{ path: '/', changefreq: 'weekly', priority: 1.0 },
	{ path: '/copy-as-curl', changefreq: 'monthly', priority: 0.9 },
	{ path: '/guide/clean-curl-for-llms', changefreq: 'monthly', priority: 0.8 },
	{ path: '/guide/remove-headers-from-curl', changefreq: 'monthly', priority: 0.8 },
	{ path: '/curl-to-fetch', changefreq: 'monthly', priority: 0.8 },
	{ path: '/curl-to-python', changefreq: 'monthly', priority: 0.8 },
	{ path: '/changelog', changefreq: 'monthly', priority: 0.5 }
];
