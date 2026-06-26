<script lang="ts">
	import ConverterPage from '$lib/components/ConverterPage.svelte';
	import { curlToFetch } from '$lib/curl-converters';
</script>

<ConverterPage
	path="/curl-to-fetch"
	title="Convert curl to JavaScript fetch — Online Converter"
	description="Paste a curl command and get JavaScript fetch() code instantly. Free online curl to fetch converter — handles method, headers, and request body."
	pageName="curl to fetch"
	heading="Convert curl to JavaScript fetch"
	lead="Paste a curl command below to generate equivalent <code>fetch()</code> code with method, headers, and body. Works entirely in your browser — nothing is sent to a server."
	placeholder={"curl 'https://api.example.com/users' \\\n  -H 'Authorization: Bearer ...' \\\n  -H 'Content-Type: application/json' \\\n  --data-raw '{\"name\":\"Ada\"}'"}
	convert={curlToFetch}
	outputLabel="JavaScript fetch"
/>
