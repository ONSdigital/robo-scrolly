<script>
	import "@onsvisual/svelte-components/css/main.css";
	import { page } from "$app/stores";
	import { AnalyticsBanner, Header, Main, Footer } from "@onsvisual/svelte-components";
	import { analyticsId, analyticsProps } from "$lib/config";

	let { children } = $props();
</script>

<!-- 'analyticsId' and 'analyticsProps' are defined in config.js -->
<AnalyticsBanner {analyticsId} {analyticsProps} {page} />
<Header />

<Main>
	{@render children?.()}
</Main>

<Footer />
