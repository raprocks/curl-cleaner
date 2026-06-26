<script lang="ts">
	import { onMount } from 'svelte';
	import { cleanCurl } from '$lib/curl-cleaner';
	import { explainCurl } from '$lib/curl-explainer';
	import { validateCurl } from '$lib/curl-validator';
	import { estimateTokens } from '$lib/estimate-tokens';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { faq } from '$lib/seo/faq';
	import { version } from '$lib/changelog';
	import { loadConfig, saveConfig, type CleanerConfig } from '$lib/settings';
	import { getResolvedTheme, toggleTheme } from '$lib/theme';

	let input = $state('');
	let copied = $state(false);
	let settingsOpen = $state(false);
	let config = $state<CleanerConfig>(loadConfig());
	let resolvedTheme = $state<'light' | 'dark'>('light');

	onMount(() => {
		config = loadConfig();
		resolvedTheme = getResolvedTheme();
	});

	function handleToggleTheme() {
		toggleTheme();
		resolvedTheme = getResolvedTheme();
	}

	const result = $derived(cleanCurl(input, config));
	const validation = $derived(validateCurl(input));
	const explanation = $derived(explainCurl(input, config));
	const savings = $derived(
		result.bytesBefore > 0
			? Math.round((1 - result.bytesAfter / result.bytesBefore) * 100)
			: 0
	);
	const tokensBefore = $derived(estimateTokens(input));
	const tokensAfter = $derived(estimateTokens(result.output));
	const tokensSaved = $derived(Math.max(0, tokensBefore - tokensAfter));

	async function copyOutput() {
		if (!result.output) return;
		await navigator.clipboard.writeText(result.output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function clearAll() {
		input = '';
	}

	function handleConfigChange(next: CleanerConfig) {
		config = next;
		saveConfig(next);
	}
</script>

<SeoHead />

<main>
	<header>
		<div class="logo" aria-hidden="true">⌘</div>
		<div class="header-text">
			<h1>
				Curl Cleaner
				<a href="/changelog" class="version" title="Changelog">v{version}</a>
			</h1>
			<p>Paste a curl command from Chrome DevTools. Get a minimal version you can share or paste into an agent.</p>
		</div>
		<div class="header-actions">
			<button
				type="button"
				class="icon-action"
				aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
				onclick={handleToggleTheme}
			>
				{#if resolvedTheme === 'dark'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" />
						<path
							d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
					</svg>
				{/if}
			</button>
			<button
				type="button"
				class="icon-action"
				aria-label="Settings"
				title="Settings"
				onclick={() => (settingsOpen = true)}
			>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
					stroke="currentColor"
					stroke-width="1.5"
				/>
				<path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
			</button>
		</div>
	</header>

	<div class="panels">
		<section class="panel" class:panel-invalid={validation.status === 'invalid'}>
			<div class="panel-head">
				<label for="input">Raw curl</label>
				<div class="panel-head-actions">
					{#if validation.status !== 'idle'}
						<span
							class="validation-badge validation-{validation.status}"
							title={validation.errors.concat(validation.warnings).join('\n') || undefined}
						>
							{validation.status === 'valid'
								? 'Valid'
								: validation.status === 'warning'
									? 'Warning'
									: 'Invalid'}
						</span>
					{/if}
					<button type="button" class="ghost" onclick={clearAll} disabled={!input}>Clear</button>
				</div>
			</div>
			{#if validation.errors.length > 0 || validation.warnings.length > 0}
				<ul class="validation-messages" aria-live="polite">
					{#each validation.errors as message (message)}
						<li class="validation-error">{message}</li>
					{/each}
					{#each validation.warnings as message (message)}
						<li class="validation-warning">{message}</li>
					{/each}
				</ul>
			{/if}
			{#if validation.summary}
				<p class="validation-summary">
					<span>{validation.summary.method}</span>
					<span class="summary-url" title={validation.summary.url}>{validation.summary.url}</span>
					<span>{validation.summary.headerCount} headers</span>
					{#if validation.summary.hasBody}<span>has body</span>{/if}
				</p>
			{/if}
			<textarea
				id="input"
				bind:value={input}
				placeholder={"curl 'https://api.example.com/...' \\\n  -H 'Accept: */*' \\\n  -H 'Authorization: Bearer ...' \\\n  ..."}
				spellcheck="false"
				autocapitalize="off"
				autocomplete="off"
			></textarea>
		</section>

		<section class="panel output-panel">
			<div class="panel-head">
				<span>Cleaned curl</span>
				<button type="button" class="primary" onclick={copyOutput} disabled={!result.output}>
					{copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
			{#if result.error}
				<p class="error" role="alert">{result.error}</p>
			{/if}
			<pre class="output" aria-live="polite"><code>{result.output || '# cleaned curl appears here'}</code></pre>
		</section>
	</div>

	{#if input && explanation.parts.length > 0}
		<details class="explainer">
			<summary>Explain this curl</summary>
			<ul class="explain-list">
				{#each explanation.parts as part (part.label + (part.value ?? '') + part.kind)}
					<li class="explain-item explain-{part.kind}">
						<div class="explain-head">
							<span class="explain-label">{part.label}</span>
							{#if part.value}<code class="explain-value">{part.value}</code>{/if}
						</div>
						<p class="explain-desc">{part.description}</p>
						{#if part.note}<p class="explain-note">{part.note}</p>{/if}
					</li>
				{/each}
			</ul>
		</details>
	{/if}

	{#if input}
		<footer class="stats">
			<span>{result.headersRemoved} header{result.headersRemoved === 1 ? '' : 's'} removed</span>
			<span>{result.bytesBefore.toLocaleString()} → {result.bytesAfter.toLocaleString()} chars</span>
			<span title="Rough LLM token estimate (chars÷4 and words×1.3, averaged)">
				~{tokensBefore.toLocaleString()} → ~{tokensAfter.toLocaleString()} tokens
			</span>
			{#if tokensSaved > 0}
				<span class="highlight" title="Approximate tokens saved">~{tokensSaved.toLocaleString()} saved</span>
			{:else if savings > 0}
				<span class="highlight">{savings}% smaller</span>
			{/if}
		</footer>
	{/if}

	<section class="seo-content" aria-labelledby="how-it-works">
		<h2 id="how-it-works">How to clean a curl command from Chrome DevTools</h2>
		<ol>
			<li>Open Chrome DevTools → Network, right-click a request, and choose <strong>Copy → Copy as cURL (bash)</strong>.</li>
			<li>Paste the command into the <strong>Raw curl</strong> panel above.</li>
			<li>Copy the cleaned curl from the right — ready to share, replay, or paste into an agent.</li>
		</ol>

		<div class="seo-grid">
			<div>
				<h3>Headers removed by default</h3>
				<p>
					Accept, Accept-Language, Origin, Referer, User-Agent, sec-ch-ua*, Sec-Fetch-*,
					and most custom X-* headers.
				</p>
			</div>
			<div>
				<h3>What stays</h3>
				<p>
					URL, method, Authorization, Cookie, Content-Type, other useful headers,
					request body, and auth or upload flags.
				</p>
			</div>
		</div>
	</section>

	<section class="faq" aria-labelledby="faq">
		<h2 id="faq">Frequently asked questions</h2>
		<dl>
			{#each faq as item (item.question)}
				<div class="faq-item">
					<dt>{item.question}</dt>
					<dd>{item.answer}</dd>
				</div>
			{/each}
		</dl>
	</section>
</main>

<SettingsDialog
	open={settingsOpen}
	{config}
	onclose={() => (settingsOpen = false)}
	onchange={handleConfigChange}
/>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1.25rem 3rem;
	}

	header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 2rem;
		position: relative;
	}

	.header-text {
		flex: 1;
		min-width: 0;
	}

	.logo {
		width: 2.75rem;
		height: 2.75rem;
		display: grid;
		place-items: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-size: 1.25rem;
		color: var(--accent);
		flex-shrink: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.25rem;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.icon-action {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
	}

	.icon-action:hover {
		color: var(--text);
		border-color: var(--border);
		background: var(--surface);
	}

	h1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin: 0 0 0.35rem;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.version {
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: inherit;
		color: var(--muted);
		text-decoration: none;
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		letter-spacing: 0;
		vertical-align: middle;
	}

	.version:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	header p {
		margin: 0;
		color: var(--muted);
		font-size: 0.875rem;
		line-height: 1.5;
		font-family: system-ui, -apple-system, sans-serif;
		max-width: 52ch;
	}

	.panels {
		display: grid;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.panels {
			grid-template-columns: 1fr 1fr;
			align-items: stretch;
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		min-height: 320px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		overflow: hidden;
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	.panel-head-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-invalid {
		border-color: color-mix(in srgb, var(--danger) 50%, var(--border));
	}

	.validation-badge {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		font-family: system-ui, sans-serif;
	}

	.validation-valid {
		color: var(--accent);
		border-color: var(--accent-dim);
	}

	.validation-warning {
		color: var(--warning);
		border-color: var(--warning-border);
	}

	.validation-invalid {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 60%, var(--border));
	}

	.validation-messages {
		margin: 0;
		padding: 0.5rem 0.875rem;
		list-style: none;
		border-bottom: 1px solid var(--border);
		font-family: system-ui, sans-serif;
		font-size: 0.8125rem;
		line-height: 1.45;
	}

	.validation-messages li + li {
		margin-top: 0.25rem;
	}

	.validation-error {
		color: var(--danger);
	}

	.validation-messages .validation-warning {
		color: var(--warning);
	}

	.validation-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.75rem;
		margin: 0;
		padding: 0.4rem 0.875rem;
		border-bottom: 1px solid var(--border);
		font-family: system-ui, sans-serif;
		font-size: 0.75rem;
		color: var(--muted);
	}

	.summary-url {
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	label {
		cursor: pointer;
	}

	textarea,
	.output {
		flex: 1;
		margin: 0;
		padding: 1rem;
		font: inherit;
		font-size: 0.8125rem;
		line-height: 1.55;
		background: transparent;
		color: var(--text);
		border: none;
		resize: vertical;
		min-height: 260px;
		tab-size: 2;
	}

	textarea:focus {
		outline: none;
		box-shadow: inset 0 0 0 1px var(--accent-dim);
	}

	.output {
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.output code {
		color: var(--accent);
	}

	.output-panel .output code {
		color: var(--text);
	}

	.error {
		margin: 0;
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
		color: var(--danger);
		border-bottom: 1px solid var(--border);
		font-family: system-ui, sans-serif;
	}

	button {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 0.8125rem;
		cursor: pointer;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		padding: 0.35rem 0.75rem;
		background: var(--bg);
		color: var(--text);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	button.primary {
		background: var(--accent-dim);
		border-color: var(--accent);
		color: #fff;
	}

	button.primary:not(:disabled):hover {
		background: var(--accent);
	}

	button.ghost:not(:disabled):hover {
		border-color: var(--muted);
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		margin-top: 1rem;
		font-size: 0.8125rem;
		color: var(--muted);
		font-family: system-ui, sans-serif;
	}

	.highlight {
		color: var(--accent);
	}

	.seo-content,
	.faq {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		font-family: system-ui, -apple-system, sans-serif;
	}

	.seo-content h2,
	.faq h2 {
		margin: 0 0 1rem;
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.seo-content ol {
		margin: 0 0 1.5rem;
		padding-left: 1.25rem;
		color: var(--text);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.seo-content li + li {
		margin-top: 0.5rem;
	}

	.seo-grid {
		display: grid;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.seo-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.seo-grid h3 {
		margin: 0 0 0.35rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.seo-grid p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.faq dl {
		margin: 0;
	}

	.faq-item + .faq-item {
		margin-top: 1.25rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border);
	}

	.faq dt {
		margin: 0 0 0.35rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text);
	}

	.faq dd {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.explainer {
		margin-top: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		overflow: hidden;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.explainer summary {
		padding: 0.625rem 0.875rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted);
		cursor: pointer;
		user-select: none;
		list-style: none;
	}

	.explainer summary::-webkit-details-marker {
		display: none;
	}

	.explainer summary::before {
		content: '▸ ';
		display: inline-block;
		transition: transform 0.15s ease;
	}

	.explainer[open] summary::before {
		transform: rotate(90deg);
	}

	.explainer[open] summary {
		border-bottom: 1px solid var(--border);
		color: var(--text);
	}

	.explain-list {
		margin: 0;
		padding: 0.5rem 0;
		list-style: none;
	}

	.explain-item {
		padding: 0.5rem 0.875rem;
		border-bottom: 1px solid var(--border);
	}

	.explain-item:last-child {
		border-bottom: none;
	}

	.explain-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 0.5rem;
		margin-bottom: 0.2rem;
	}

	.explain-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text);
	}

	.explain-value {
		font-family: inherit;
		font-size: 0.75rem;
		color: var(--muted);
		background: var(--bg);
		padding: 0.1em 0.4em;
		border-radius: 0.25rem;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.explain-desc {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--text);
	}

	.explain-note {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: var(--warning);
	}

	.explain-url .explain-label,
	.explain-method .explain-label {
		color: var(--accent);
	}
</style>
