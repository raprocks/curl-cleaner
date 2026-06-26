<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidePage from '$lib/components/GuidePage.svelte';
	import { breadcrumbSchema, howToSchema, subpageBreadcrumbs } from '$lib/seo/schema';

	const path = '/guide/remove-headers-from-curl';
	const title = 'Remove Headers from a curl Command — User-Agent, Origin & More';
	const description =
		'Learn which headers DevTools adds to curl commands and how to remove User-Agent, Origin, Sec-Fetch-*, and custom X-* headers automatically with Curl Cleaner.';

	const jsonLd = [
		breadcrumbSchema(subpageBreadcrumbs('Remove headers from curl', path)),
		howToSchema(
			'Remove unnecessary headers from a curl command',
			description,
			[
				'Paste your DevTools curl command into Curl Cleaner.',
				'Review which headers are removed by default (User-Agent, Accept, Sec-Fetch-*, etc.).',
				'Use Settings to keep Cookie, strip X-* headers, or customize allow/deny lists.',
				'Copy the cleaned curl with only the headers your API needs.'
			]
		)
	];
</script>

<SeoHead {path} {title} {description} {jsonLd} />

<GuidePage>
	<h1>Remove headers from a curl command</h1>
	<p class="lead">
		Chrome DevTools copies every header the browser sent — including ones curl adds automatically
		or that only matter inside the browser. Curl Cleaner removes them by default so you get a
		minimal, replayable command.
	</p>

	<h2>Headers removed by default</h2>
	<ul>
		<li><code>User-Agent</code> — browser and OS identification.</li>
		<li><code>Accept</code>, <code>Accept-Language</code>, <code>Accept-Encoding</code> — content negotiation hints.</li>
		<li><code>Origin</code>, <code>Referer</code> — page context for CORS (not needed in scripts).</li>
		<li><code>Sec-Fetch-*</code>, <code>sec-ch-ua*</code> — browser security and client hints.</li>
		<li><code>Connection</code>, <code>Host</code>, <code>Content-Length</code> — curl sets these automatically.</li>
		<li>Most <code>X-*</code> custom headers (configurable in Settings).</li>
	</ul>

	<h2>Headers kept by default</h2>
	<ul>
		<li><code>Authorization</code> — API keys and Bearer tokens.</li>
		<li><code>Content-Type</code> — request body format.</li>
		<li><code>Cookie</code> — session cookies (can be toggled off in Settings).</li>
		<li>Other application-specific headers not on the strip list.</li>
	</ul>

	<h2>Customize with Settings</h2>
	<p>
		Open the gear icon on the <a href="/">home page</a> to fine-tune behavior:
	</p>
	<ul>
		<li><strong>Keep Cookie</strong> — retain or drop <code>Cookie</code> and <code>-b</code> flags.</li>
		<li><strong>Strip X-*</strong> — remove custom headers like <code>X-Request-Id</code> (add exceptions under “Always keep”).</li>
		<li><strong>Always strip / Always keep</strong> — per-header allow and deny lists; keep wins over strip.</li>
		<li><strong>Compress output</strong> — single-line curl with no line continuations.</li>
	</ul>

	<h2>Manual vs automatic removal</h2>
	<p>
		You can hand-edit a curl command to delete <code>-H</code> lines, but DevTools exports often
		have 15–25 headers. Curl Cleaner applies consistent rules every time and shows how many
		headers were removed and how much smaller the output is.
	</p>

	<a class="cta" href="/">Remove headers from your curl</a>
</GuidePage>
