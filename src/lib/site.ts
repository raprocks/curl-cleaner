import { env } from '$env/dynamic/public';

export const site = {
	url: env.PUBLIC_SITE_URL || 'https://curl-cleaner.rohitpatil.me',
	name: 'Curl Cleaner',
	title: 'Curl Cleaner — Strip Browser Headers from DevTools curl Commands',
	description:
		'Free online curl cleaner. Paste a curl copied from Chrome DevTools and instantly remove Accept, User-Agent, Sec-Fetch-*, Origin, and other browser noise. Keep Authorization, Cookie, Content-Type, and your request body.',
	tagline:
		'Paste a curl command from Chrome DevTools. Get a minimal version you can share or paste into an agent.',
	gaId: env.PUBLIC_GA_MEASUREMENT_ID || ''
} as const;
