<script lang="ts">
	import type { Snippet } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidePage from '$lib/components/GuidePage.svelte';
	import { breadcrumbSchema, subpageBreadcrumbs } from '$lib/seo/schema';

	type Props = {
		path: string;
		title: string;
		description: string;
		pageName: string;
		heading: string;
		lead: string;
		placeholder: string;
		convert: (input: string) => { output: string; error?: string };
		outputLabel: string;
		children?: Snippet;
	};

	let {
		path,
		title,
		description,
		pageName,
		heading,
		lead,
		placeholder,
		convert,
		outputLabel,
		children
	}: Props = $props();

	let input = $state('');
	let copied = $state(false);

	const result = $derived(convert(input));
	const jsonLd = $derived.by(() => [
		breadcrumbSchema(subpageBreadcrumbs(pageName, path))
	]);

	async function copyOutput() {
		if (!result.output) return;
		await navigator.clipboard.writeText(result.output);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<SeoHead {path} {title} {description} {jsonLd} />

<GuidePage>
	<h1>{heading}</h1>
	<p class="lead">{@html lead}</p>

	<div class="converter">
		<label for="curl-input">curl command</label>
		<textarea
			id="curl-input"
			bind:value={input}
			{placeholder}
			spellcheck="false"
			autocapitalize="off"
			autocomplete="off"
		></textarea>

		<div class="output-head">
			<span>{outputLabel}</span>
			<button type="button" class="primary" onclick={copyOutput} disabled={!result.output}>
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
		{#if result.error}
			<p class="error" role="alert">{result.error}</p>
		{/if}
		<pre class="output" aria-live="polite"><code>{result.output || `# ${outputLabel.toLowerCase()} appears here`}</code></pre>
	</div>

	{#if children}
		{@render children()}
	{/if}

	<p>
		Tip: run your curl through <a href="/">Curl Cleaner</a> first to remove browser headers
		before converting.
	</p>
</GuidePage>

<style>
	.converter {
		margin: 1.5rem 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.625rem;
		overflow: hidden;
	}

	label {
		display: block;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	textarea {
		width: 100%;
		min-height: 140px;
		margin: 0;
		padding: 1rem;
		font-family: inherit;
		font-size: 0.8125rem;
		line-height: 1.55;
		background: transparent;
		color: var(--text);
		border: none;
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		box-shadow: inset 0 0 0 1px var(--accent-dim);
	}

	.output-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		border-top: 1px solid var(--border);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	button {
		font-family: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		padding: 0.35rem 0.75rem;
		background: var(--bg);
		color: var(--text);
		text-transform: none;
		letter-spacing: 0;
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

	.error {
		margin: 0;
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
		color: var(--danger);
		border-top: 1px solid var(--border);
	}

	.output {
		margin: 0;
		padding: 1rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-all;
		border-top: 1px solid var(--border);
	}

	.output code {
		color: var(--accent);
	}
</style>
