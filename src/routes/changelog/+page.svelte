<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { changelog, version } from '$lib/changelog';
</script>

<SeoHead path="/changelog" />

<main>
	<nav>
		<a href="/">← Curl Cleaner</a>
	</nav>

	<h1>Changelog</h1>
	<p class="lead">What shipped in each release. Current version: <strong>v{version}</strong></p>

	{#each changelog as release (release.version)}
		<section>
			<h2>
				<span class="ver">v{release.version}</span>
				<time datetime={release.date}>{release.date}</time>
			</h2>
			<ul>
				{#each release.changes as change (change)}
					<li>{change}</li>
				{/each}
			</ul>
		</section>
	{/each}
</main>

<style>
	main {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 3rem;
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

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.lead {
		margin: 0 0 2rem;
		color: var(--muted);
		font-size: 0.9375rem;
	}

	section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	h2 {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ver {
		color: var(--accent);
	}

	time {
		color: var(--muted);
		font-size: 0.875rem;
		font-weight: 400;
	}

	ul {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--text);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	li + li {
		margin-top: 0.35rem;
	}
</style>
