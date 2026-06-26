<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidePage from '$lib/components/GuidePage.svelte';
	import { breadcrumbSchema, howToSchema, subpageBreadcrumbs } from '$lib/seo/schema';

	const path = '/guide/clean-curl-for-llms';
	const title = 'Clean curl Commands for LLMs & AI Agents — Reduce Tokens';
	const description =
		'Shorten DevTools curl commands before pasting into ChatGPT, Claude, or coding agents. Remove browser headers to cut token usage and keep only the API call that matters.';

	const jsonLd = [
		breadcrumbSchema(subpageBreadcrumbs('Curl for LLMs', path)),
		howToSchema(
			'Clean a curl command for LLM prompts',
			description,
			[
				'Copy the curl command from Chrome DevTools Network tab.',
				'Paste it into Curl Cleaner to strip browser headers and noise.',
				'Copy the cleaned output and paste it into your LLM or agent prompt.',
				'Check the token estimate to see how much you saved.'
			]
		)
	];
</script>

<SeoHead {path} {title} {description} {jsonLd} />

<GuidePage>
	<h1>Clean curl commands for LLMs and AI agents</h1>
	<p class="lead">
		When you paste a raw DevTools curl into ChatGPT, Claude, Cursor, or another agent, you pay
		for every character — including <code>User-Agent</code>, <code>Sec-Fetch-*</code>, and
		dozens of headers the model does not need. Curl Cleaner shrinks the command so your prompt
		focuses on the actual API call.
	</p>

	<h2>Why browser curl commands waste tokens</h2>
	<p>
		A typical Chrome “Copy as cURL” export is 1,500–3,000 characters. Roughly half is browser
		metadata: client hints, fetch metadata, accept headers, and encoding preferences. None of
		that helps an LLM understand or replay your API request.
	</p>
	<p>
		Curl Cleaner removes that noise client-side — nothing is uploaded — and shows an approximate
		token count before and after so you can see the savings immediately.
	</p>

	<h2>What to keep for agent prompts</h2>
	<ul>
		<li><strong>URL and HTTP method</strong> — the endpoint being called.</li>
		<li><strong>Authorization</strong> — Bearer tokens, API keys (redact before sharing publicly).</li>
		<li><strong>Content-Type</strong> — tells the agent the body format.</li>
		<li><strong>Request body</strong> — JSON, form data, or GraphQL payload.</li>
		<li><strong>Cookie</strong> — only if the session matters (toggle in Settings).</li>
	</ul>

	<h2>Workflow for coding agents</h2>
	<ol>
		<li>Reproduce the API call in your browser and copy as cURL.</li>
		<li>Paste into <a href="/">Curl Cleaner</a> — cleaned output appears instantly.</li>
		<li>Copy the minimal curl and paste into your agent with a prompt like “convert this to a Python script” or “debug this 401”.</li>
		<li>Use the token estimate in the footer to confirm you trimmed enough context.</li>
	</ol>

	<h2>Related tools</h2>
	<p>
		Need code instead of curl? Try the <a href="/curl-to-fetch">curl to fetch converter</a> or
		<a href="/curl-to-python">curl to Python requests converter</a> after cleaning your command.
	</p>

	<a class="cta" href="/">Clean a curl command now</a>
</GuidePage>
