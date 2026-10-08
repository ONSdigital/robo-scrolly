<script>
	// An embeddable area picker, which opens the article for the selected area in the parent page
	import "@onsvisual/svelte-components/css/main.css";
	import { resolve } from "$app/paths";
	import { regions } from "$lib/config";
	import {
		Embed,
		AnalyticsBanner,
		Highlight,
		Select,
		Container,
		Details,
		Grid,
		GridCell
	} from "@onsvisual/svelte-components";

	let { data } = $props();

	const analyticsProps = (() => {
		const props = {};
		for (const key of ["contentTitle", "releaseDate", "outputSeries", "contentType"]) {
			if (data?.meta?.[key])
				props[key] =
					key === "releaseDate" ? data.meta[key].replaceAll("-", "") : data.meta[key];
		}
		return props;
	})();

	function doSelect(e) {
		if (e.detail) window.top.location.href = resolve(`/${e.detail.areacd}/`);
	}
</script>

<svelte:head>
	<title>{data?.meta?.title || ""}</title>
	<meta name="description" content={data?.meta?.description || ""} />
	<meta name="robots" content="noindex" />
	<meta name="googlebot" content="indexifembedded" />
</svelte:head>

<Embed>
	<AnalyticsBanner {analyticsProps} hideBanner />
	<Highlight cls="embed-select" height="auto" marginTop={false} marginBottom={false}>
		<Select
			id="select"
			label="Select a local authority"
			labelKey="areanm"
			options={data.places}
			on:change={doSelect}
			placeholder="Select a local authority..."
		/>
	</Highlight>

	<Container marginTop marginBottom>
		<Details title="All versions of this article" open>
			<Grid colWidth="narrow">
				{#each regions as region}
					<GridCell>
						<strong>{region.nm}</strong>
						<div style:font-size="smaller">
							{#each data.places.filter( (d) => (d.regioncd ? d.regioncd == region.cd : d.ctrycd == region.cd) ) as place}
								<a href={resolve(`/${place.areacd}/`)} target="_top"
									>{place.areanm}</a
								><br />
							{/each}
						</div>
					</GridCell>
				{/each}
			</Grid>
		</Details>
	</Container>
</Embed>

<style>
	/* Highlight lays out its content with flexbox, so let the select fill the width */
	:global(.embed-select .ons-section__highlight > div) {
		flex-grow: 1;
	}
</style>
