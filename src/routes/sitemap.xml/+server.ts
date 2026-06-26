import { changelog } from '$lib/changelog';
import { seoRoutes } from '$lib/seo/routes';
import { site } from '$lib/site';

export const prerender = true;

function formatLastmod(date?: string): string {
	return date ?? changelog[0]?.date ?? new Date().toISOString().slice(0, 10);
}

export function GET() {
	const urls = seoRoutes
		.map((route) => {
			const loc = new URL(route.path, site.url).href;
			const lastmod = formatLastmod(route.lastmod);
			return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
