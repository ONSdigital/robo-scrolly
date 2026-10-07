<script>
	import "@onsvisual/svelte-components/css/main.css";
	import "../../app.css";
	import { page } from "$app/stores";
	import { setContext } from "svelte";
	import { AnalyticsBanner, Header, Main, Footer } from "@onsvisual/svelte-components";
	import { analyticsId, analyticsProps } from "$lib/config";

	let { children } = $props();

	// Theme name, read by +page.svelte (options are "light" or "dark")
	setContext("theme", "light");
</script>

<!-- 'analyticsId' and 'analyticsProps' are defined in config.js -->
<AnalyticsBanner {analyticsId} {analyticsProps} {page} />
<Header />

<Main>
	{@render children?.()}
</Main>

<Footer />
