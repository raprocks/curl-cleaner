<script lang="ts">
	import { site } from '$lib/site';
	import { faq } from '$lib/seo/faq';

	type Props = {
		path?: string;
	};

	let { path = '/' }: Props = $props();

	const canonical = $derived(new URL(path, site.url).href);
	const ogImage = `${site.url}/og.svg`;

	const jsonLd = $derived(
		JSON.stringify([
		{
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: site.name,
			url: site.url,
			description: site.description,
			applicationCategory: 'DeveloperApplication',
			operatingSystem: 'Any',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD'
			},
			browserRequirements: 'Requires JavaScript'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faq.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer
				}
			}))
		}
		])
	);
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={site.title} />
	<meta name="twitter:description" content={site.description} />
	<meta name="twitter:image" content={ogImage} />

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
