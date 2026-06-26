<script lang="ts">
	const links = [
		{ href: '/copy-as-curl', label: 'Copy as cURL' },
		{ href: '/guide/clean-curl-for-llms', label: 'Curl for LLMs' },
		{ href: '/guide/remove-headers-from-curl', label: 'Remove headers' },
		{ href: '/curl-to-fetch', label: 'curl → fetch' },
		{ href: '/curl-to-python', label: 'curl → Python' },
		{ href: '/changelog', label: 'Changelog' }
	];
</script>

<footer class="site-footer">
	<nav aria-label="Site">
		<ul>
			{#each links as link (link.href)}
				<li><a href={link.href}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
</footer>

<style>
	.site-footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		font-family: system-ui, -apple-system, sans-serif;
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		font-size: 0.8125rem;
		color: var(--muted);
		text-decoration: none;
	}

	a:hover {
		color: var(--accent);
	}
</style>
