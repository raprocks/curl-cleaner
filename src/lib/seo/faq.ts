export type FaqItem = {
	question: string;
	answer: string;
};

export const faq: FaqItem[] = [
	{
		question: 'What is Curl Cleaner?',
		answer:
			'Curl Cleaner is a free online tool that strips browser-specific noise from curl commands copied out of Chrome DevTools. It keeps the URL, method, auth, content type, body, and useful headers while removing values like User-Agent, Accept, Sec-Fetch-*, and Origin.'
	},
	{
		question: 'How do I copy a curl command from Chrome DevTools?',
		answer:
			'Open Chrome DevTools, go to the Network tab, right-click a request, and choose Copy → Copy as cURL (bash). Paste that command into Curl Cleaner to get a minimal version.'
	},
	{
		question: 'What headers does Curl Cleaner remove?',
		answer:
			'By default it removes common browser headers such as Accept, Accept-Language, Origin, Referer, User-Agent, sec-ch-ua*, Sec-Fetch-*, and most custom X-* headers. You can tune keep and strip lists in Settings.'
	},
	{
		question: 'What does Curl Cleaner keep?',
		answer:
			'It keeps the request URL, non-GET methods, Authorization, Cookie (optional), Content-Type, other non-browser headers, the request body, and flags like -u or -F when present.'
	},
	{
		question: 'Is my curl command sent to a server?',
		answer:
			'No. Cleaning runs entirely in your browser. Nothing you paste is uploaded or stored.'
	},
	{
		question: 'Why remove browser headers from a curl command?',
		answer:
			'DevTools curl commands include headers your script or API client does not need. Removing them makes commands shorter, easier to share, cheaper to paste into LLM prompts, and less likely to break when replayed outside the browser.'
	}
];
