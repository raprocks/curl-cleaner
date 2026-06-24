import { site } from '$lib/site';

export const prerender = true;

export function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
