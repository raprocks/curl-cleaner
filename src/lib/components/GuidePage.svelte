<script lang="ts">
	import type { Snippet } from 'svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<main class="guide">
	<nav>
		<a href="/">← Curl Cleaner</a>
	</nav>
	{@render children()}
	<SiteFooter />
</main>

<style>
	.guide {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 3rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	nav {
		margin-bottom: 1.5rem;
	}

	nav a {
		color: var(--muted);
		text-decoration: none;
		font-size: 0.875rem;
	}

	nav a:hover {
		color: var(--accent);
	}

	:global(.guide h1) {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	:global(.guide .lead) {
		margin: 0 0 2rem;
		color: var(--muted);
		font-size: 1rem;
		line-height: 1.6;
	}

	:global(.guide h2) {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	:global(.guide h3) {
		margin: 1.5rem 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}

	:global(.guide p),
	:global(.guide li) {
		font-size: 0.9375rem;
		line-height: 1.65;
		color: var(--text);
	}

	:global(.guide p) {
		margin: 0 0 1rem;
	}

	:global(.guide ol),
	:global(.guide ul) {
		margin: 0 0 1.25rem;
		padding-left: 1.25rem;
	}

	:global(.guide li + li) {
		margin-top: 0.4rem;
	}

	:global(.guide .cta) {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		background: var(--accent-dim);
		border: 1px solid var(--accent);
		color: #fff;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global(.guide .cta:hover) {
		background: var(--accent);
	}

	:global(.guide .browser-section) {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}
</style>
