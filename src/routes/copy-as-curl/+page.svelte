<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidePage from '$lib/components/GuidePage.svelte';
	import { breadcrumbSchema, howToSchema, subpageBreadcrumbs } from '$lib/seo/schema';

	const path = '/copy-as-curl';
	const title = 'How to Copy as cURL — Chrome, Firefox, Edge & Safari';
	const description =
		'Step-by-step guide to copy a request as cURL from Chrome DevTools, Firefox, Edge, and Safari. Paste the result into Curl Cleaner to strip browser headers.';

	const jsonLd = [
		breadcrumbSchema(subpageBreadcrumbs('Copy as cURL', path)),
		howToSchema(
			'Copy a network request as cURL from your browser',
			description,
			[
				'Open your browser developer tools and go to the Network tab.',
				'Reload the page or trigger the API request you want to capture.',
				'Right-click the request and choose Copy as cURL (or Copy as cURL (bash) in Chrome).',
				'Paste the command into Curl Cleaner to remove browser-only headers.'
			]
		)
	];
</script>

<SeoHead {path} {title} {description} {jsonLd} />

<GuidePage>
	<h1>How to copy as cURL in every browser</h1>
	<p class="lead">
		Every major browser can export a network request as a curl command. The exact menu label
		varies — here is how to find it in Chrome, Firefox, Edge, and Safari, then clean the
		output with <a href="/">Curl Cleaner</a>.
	</p>

	<section class="browser-section" id="chrome">
		<h2>Chrome — Copy as cURL (bash)</h2>
		<ol>
			<li>Open DevTools with <kbd>F12</kbd> or <kbd>Cmd+Option+I</kbd> (Mac).</li>
			<li>Go to the <strong>Network</strong> tab and trigger the request.</li>
			<li>Right-click the request row → <strong>Copy</strong> → <strong>Copy as cURL (bash)</strong>.</li>
			<li>Paste into Curl Cleaner to remove <code>User-Agent</code>, <code>Sec-Fetch-*</code>, and other browser noise.</li>
		</ol>
	</section>

	<section class="browser-section" id="firefox">
		<h2>Firefox — Copy as cURL</h2>
		<ol>
			<li>Open DevTools with <kbd>F12</kbd>.</li>
			<li>Select the <strong>Network</strong> tab and reproduce the request.</li>
			<li>Right-click the request → <strong>Copy</strong> → <strong>Copy as cURL</strong>.</li>
			<li>Firefox includes fewer <code>sec-ch-ua</code> headers than Chrome, but still adds <code>User-Agent</code> and <code>Accept</code> you may want to strip.</li>
		</ol>
	</section>

	<section class="browser-section" id="edge">
		<h2>Microsoft Edge — Copy as cURL (bash)</h2>
		<ol>
			<li>Edge uses Chromium DevTools — open with <kbd>F12</kbd>.</li>
			<li>Go to <strong>Network</strong>, find your request.</li>
			<li>Right-click → <strong>Copy</strong> → <strong>Copy as cURL (bash)</strong> (same as Chrome).</li>
			<li>Edge curl exports look nearly identical to Chrome; Curl Cleaner handles both.</li>
		</ol>
	</section>

	<section class="browser-section" id="safari">
		<h2>Safari — Copy as cURL</h2>
		<ol>
			<li>Enable the Develop menu: Safari → Settings → Advanced → “Show features for web developers”.</li>
			<li>Open Web Inspector (<kbd>Cmd+Option+I</kbd>) → <strong>Network</strong> tab.</li>
			<li>Control-click the request → <strong>Copy as cURL</strong>.</li>
			<li>Safari exports are often shorter but still include browser headers worth removing before sharing.</li>
		</ol>
	</section>

	<h2>What to do after copying</h2>
	<p>
		DevTools curl commands are verbose — they include headers your script or API client does not
		need. Paste the command into Curl Cleaner to keep <code>Authorization</code>,
		<code>Content-Type</code>, and your request body while dropping browser metadata.
	</p>
	<a class="cta" href="/">Open Curl Cleaner</a>
</GuidePage>
