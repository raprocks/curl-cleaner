import { site } from '$lib/site';

export type BreadcrumbItem = {
	name: string;
	path: string;
};

export function breadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: new URL(item.path, site.url).href
		}))
	};
}

export function howToSchema(name: string, description: string, steps: string[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name,
		description,
		step: steps.map((text, index) => ({
			'@type': 'HowToStep',
			position: index + 1,
			text
		}))
	};
}

export function webApplicationSchema() {
	return {
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
	};
}

export function organizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: site.name,
		url: site.url,
		logo: `${site.url}/og.png`
	};
}

export function faqPageSchema(
	items: { question: string; answer: string }[]
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	};
}

export function subpageBreadcrumbs(pageName: string, path: string): BreadcrumbItem[] {
	return [
		{ name: site.name, path: '/' },
		{ name: pageName, path }
	];
}
