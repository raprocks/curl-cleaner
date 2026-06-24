<script lang="ts">
	import { site } from '$lib/site';

	const id = site.gaId;
</script>

<svelte:head>
	{#if id}
		<script async src="https://www.googletagmanager.com/gtag/js?id={id}"></script>
		{@html `<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', '${id}', { anonymize_ip: true });
		</script>`}
	{/if}
</svelte:head>
