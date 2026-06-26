<script lang="ts">
	import { site } from '$lib/site';
	import { faq } from '$lib/seo/faq';
	import {
		breadcrumbSchema,
		faqPageSchema,
		organizationSchema,
		webApplicationSchema
	} from '$lib/seo/schema';

	type Props = {
		path?: string;
		title?: string;
		description?: string;
		jsonLd?: object[];
		includeFaq?: boolean;
		includeWebApp?: boolean;
		includeOrganization?: boolean;
		ogImage?: string;
	};

	let {
		path = '/',
		title = site.title,
		description = site.description,
		jsonLd = [],
		includeFaq = false,
		includeWebApp = false,
		includeOrganization = false,
		ogImage = `${site.url}/og.png`
	}: Props = $props();

	const canonical = $derived(new URL(path, site.url).href);

	const structuredData = $derived(
		[
			...(includeWebApp ? [webApplicationSchema()] : []),
			...(includeOrganization ? [organizationSchema()] : []),
			...(includeFaq ? [faqPageSchema(faq)] : []),
			...jsonLd
		]
	);
	const hasStructuredData = $derived(structuredData.length > 0);
	const structuredDataJson = $derived(JSON.stringify(structuredData));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta name="theme-color" content="#166b2b" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{#if hasStructuredData}
		{@html `<script type="application/ld+json">${structuredDataJson}</script>`}
	{/if}
</svelte:head>
