<script lang="ts">
	import ConverterPage from '$lib/components/ConverterPage.svelte';
	import { curlToPython } from '$lib/curl-converters';
</script>

<ConverterPage
	path="/curl-to-python"
	title="Convert curl to Python requests — Online Converter"
	description="Paste a curl command and get Python requests code instantly. Free online curl to Python converter — handles method, headers, and request body."
	pageName="curl to Python"
	heading="Convert curl to Python requests"
	lead="Paste a curl command below to generate equivalent <code>requests.request()</code> code with method, headers, and body. Runs entirely in your browser."
	placeholder={"curl 'https://api.example.com/users' \\\n  -H 'Authorization: Bearer ...' \\\n  -H 'Content-Type: application/json' \\\n  --data-raw '{\"name\":\"Ada\"}'"}
	convert={curlToPython}
	outputLabel="Python requests"
/>
