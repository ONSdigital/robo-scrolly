<script>
	import "@onsvisual/svelte-components/css/main.css";
	import "../../app.css";
	import { page } from "$app/stores";
	import { AnalyticsBanner, Header, Main, Footer } from "@onsvisual/svelte-components";

	let { children } = $props();

	// Analytics props from the template's Meta section, which +page.js returns as data.meta
	let data = $derived($page.data);
	let analyticsProps = $derived.by(() => {
		const props = {};
		for (const key of ["contentTitle", "releaseDate", "outputSeries", "contentType"]) {
			if (data?.meta?.[key])
				props[key] =
					key === "releaseDate" ? data.meta[key].replaceAll("-", "") : data.meta[key];
		}
		return props;
	});
</script>

<AnalyticsBanner {analyticsProps} {page} />
<Header />

<Main>
	{@render children?.()}
</Main>

<Footer />
