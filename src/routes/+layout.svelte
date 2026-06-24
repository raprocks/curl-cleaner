<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte';
	import { initTheme } from '$lib/theme';

	let { children } = $props();

	onMount(() => initTheme());
</script>

<GoogleAnalytics />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
