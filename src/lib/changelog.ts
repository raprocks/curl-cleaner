import pkg from '../../package.json';

export const version = pkg.version;

export type Release = {
	version: string;
	date: string;
	changes: string[];
};

// ponytail: hand-maintained; add a block when you bump package.json
export const changelog: Release[] = [
	{
		version: '0.2.0',
		date: '2026-06-26',
		changes: [
			'SEO landing pages: copy-as-curl guide, LLM token guide, remove-headers guide',
			'curl to fetch and curl to Python converters',
			'Per-page meta tags, HowTo/Breadcrumb/Organization schema, raster OG image',
			'Site footer with internal links; sitemap lastmod for all routes'
		]
	},
	{
		version: '0.1.0',
		date: '2026-06-26',
		changes: [
			'Version badge in header and changelog page',
			'Fix curl bodies truncated when DevTools uses $\'...\' quoting'
		]
	},
	{
		version: '0.0.4',
		date: '2026-06-24',
		changes: [
			'Fix Cloudflare build with production env defaults',
			'Fix GA4 by inlining PUBLIC_GA_MEASUREMENT_ID at build time',
			'GitHub Actions workflow for CI builds',
			'SEO meta tags, sitemap, FAQ schema, Google Analytics, custom favicon'
		]
	},
	{
		version: '0.0.3',
		date: '2026-06-03',
		changes: ['Fix GraphQL curl bodies losing literal \\n escapes in JSON']
	},
	{
		version: '0.0.2',
		date: '2026-05-30',
		changes: [
			'Cloudflare Pages Git builds and Wrangler config',
			'Wrangler CLI and static deploy setup'
		]
	},
	{
		version: '0.0.1',
		date: '2026-05-30',
		changes: [
			'Initial release: strip browser headers from DevTools curl commands',
			'Settings for Cookie, X-* headers, allow/deny lists',
			'Curl validation, explainer, and token estimate'
		]
	}
];
