<script module>
	// MapLibre can't find its worker script once Vite has bundled it, so point it at the bundled copy
	// before any map is created (see the @onsvisual/svelte-maps README)
	import { setWorkerUrl } from "maplibre-gl";
	import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
	setWorkerUrl(maplibreWorkerUrl);
</script>

<script>
	import { asset, resolve } from "$app/paths";

	let { data } = $props();
	let { geojson, mapbounds, places, selected, content, place, siblings } = $derived(data);

	// CORE IMPORTS
	import { getMotion } from "$lib/utils";
	import bbox from "@turf/bbox";

	import {
		Hero,
		Highlight,
		Section,
		Scroller,
		ScrollerSection,
		Select,
		Checkbox,
		Icon,
		Container,
		Details,
		Grid,
		GridCell
	} from "@onsvisual/svelte-components";

	// DEMO-SPECIFIC IMPORTS
	import { goto } from "$app/navigation";
	import { regions } from "$lib/config";
	import { app_url } from "../../app.config.js";
	import { ScatterChart } from "@onsvisual/svelte-charts";
	import { Map, MapSource, MapLayer } from "@onsvisual/svelte-maps";

	// CONFIG FOR SCROLLER COMPONENTS
	// Config
	const threshold = 0.65;
	// State
	let animation = $state(getMotion()); // Set animation preference depending on browser preference

	// DEMO-SPECIFIC CONFIG
	// Constants
	const mapstyle = asset("/data/mapstyle.json");

	// Element bindings
	let map = $state({ map1: null, map2: null });

	// State
	// Props for interactive charts/maps
	let props = $state({
		scatter: {
			xKey: "long_term_illness_2011_pc",
			yKey: null,
			highlighted: []
		},
		map1: {
			colorKey: "long_term_illness_2011_pc_color",
			highlighted: []
		},
		map2: {
			colorKey: "unpaid_care_20_plus_2011_pc_color",
			highlighted: []
		}
	});

	// FUNCTIONS (INCL. SCROLLER ACTIONS)

	// Functions for chart and map on:select and on:hover events
	// Select dispatches "change" with the chosen place, or null when it's cleared
	function doSelect(e) {
		if (!e.detail) return doClear();
		goto(resolve(`/${e.detail.areacd}/`), { noScroll: true, keepFocus: true });
	}
	function doClear() {
		goto(resolve("/"), { noScroll: true, keepFocus: true });
	}

	// Functions for map component
	function fitBounds(bounds, map) {
		if (map) {
			map.fitBounds(bounds, { animate: animation, padding: 50 });
		}
	}

	function fitById(id, geojson, map) {
		if (geojson && id) {
			let feature = geojson.features.find((d) => d.properties.AREACD == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds, map);
		}
	}

	// Actions for Scroller components
	// Note that they are nested as {scrollerId: {sectionId: FUNCTION}}
	const actions = {
		scatter: {
			scatter_a: (id) => {
				props[id].xKey = "long_term_illness_2011_pc";
				props[id].highlighted = [];
			},
			scatter_b: (id) => {
				props[id].xKey = "limited_lot_2011_pc";
				props[id].highlighted = [];
			},
			scatter_c: (id) => {
				props[id].xKey = "limited_lot_2011_pc";
				props[id].highlighted = siblings;
			}
		},
		map1: {
			map1_a: (id) => {
				props[id].highlighted = [];
				fitBounds(mapbounds, map["map1"]);
			},
			map1_b: (id) => {
				let areacd = [...places].sort(
					(a, b) => b.long_term_illness_2011_pc - a.long_term_illness_2011_pc
				)[0].areacd; // ID of place with highest rate
				props[id].highlighted = [areacd]; // Highlight this place
				fitById(areacd, geojson, map["map1"]); // Fit the map to this place
			},
			map1_c: (id) => {
				let areacd = [...places].sort(
					(a, b) => a.long_term_illness_2011_pc - b.long_term_illness_2011_pc
				)[0].areacd; // ID of place with lowest rate
				props[id].highlighted = [areacd]; // Highlight this place
				fitById(areacd, geojson, map["map1"]); // Fit the map to this place
			}
		},
		map2: {
			map2_a: (id) => {
				props[id].highlighted = [];
				fitBounds(mapbounds, map["map2"]);
			},
			map2_b: (id) => {
				let areacd = [...places].sort(
					(a, b) => b.unpaid_care_20_plus_2011_pc - a.unpaid_care_20_plus_2011_pc
				)[0].areacd; // ID of place with highest rate
				props[id].highlighted = [areacd]; // Highlight this place
				fitById(areacd, geojson, map["map2"]); // Fit the map to this place
			},
			map2_c: (id) => {
				let areacd = [...places].sort(
					(a, b) => a.unpaid_care_20_plus_2011_pc - b.unpaid_care_20_plus_2011_pc
				)[0].areacd; // ID of place with lowest rate
				props[id].highlighted = [areacd];
				fitById(areacd, geojson, map["map2"]);
			}
		}
	};

	// Code to run Scroller actions
	// Triggered by a "change" event on any Scroller component
	function runAction(e) {
		let id = e.detail.id;
		let sectionId = e.detail.sectionId;
		if (id && sectionId && actions[id][sectionId]) {
			console.log("running action " + sectionId);
			actions[id][sectionId](id);
		}
	}
</script>

<svelte:head>
	<title>{place ? `Localised article for ${place.areacd}` : "Localised article example"}</title>
	<link rel="icon" href="https://www.ons.gov.uk/favicon.ico" />
	<link rel="canonical" href="{app_url}/{selected ? `${selected}/` : ''}" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{app_url}/{selected ? `${selected}/` : ''}" />
	<meta
		property="og:title"
		content={place ? `Localised article for ${place.areacd}` : "Localised article example"}
	/>
	<meta property="og:image" content="{app_url}/img/og.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:description" content="This is a description of the page." />
	<meta name="description" content="This is a description of the page." />
</svelte:head>

{#if Array.isArray(content.notes)}
	{#each content.notes as note}
		{@html `<!-- ${note} -->`}
	{/each}
{/if}

{#each content.sections as section}
	{#if section.type == "Header"}
		<Hero theme="blue" title={section.title} lede={section.lede} censusLogo>
			{@html section.content}
			<Checkbox
				id="animate-checkbox"
				label="Enable animation"
				variant="ghost"
				bind:checked={animation}
				compact
			/>
			<div class="hero-select">
				<Select
					id="intro-select"
					label={section.label}
					labelKey="areanm"
					options={places}
					value={place}
					on:change={doSelect}
					on:clear={doClear}
					placeholder="Select a local authority..."
				/>
			</div>
			{#if place}
				<p class="scroll-cue">Scroll to begin <Icon type="arrow" rotation={90} /></p>
			{/if}
		</Hero>
	{:else if section.type == "Filler"}
		<Highlight id={section.id ? section.id : null} bigText>
			{@html section.content}
		</Highlight>
	{:else if section.type == "Section"}
		<Section id={section.id ? section.id : null} title={section.title}>
			{@html section.content}
		</Section>
	{:else if section.type == "Scroller"}
		<Scroller id={section.id} {threshold} splitscreen={true} on:change={runAction}>
			<div slot="background">
				{#if section.id == "scatter"}
					<div class="scroller-background">
						<div class="chart">
							<ScatterChart
								data={places}
								{animation}
								color="lightgrey"
								colorSelect="#206095"
								colorHighlight="#999"
								xKey={props[section.id].xKey}
								yKey={props[section.id].yKey}
								xSuffix="%"
								idKey="areacd"
								labelKey="areanm"
								selected={place.areacd}
								highlighted={props[section.id].highlighted}
								hover
								labels
								overlayFill
								xMin={5}
								xMax={30}
								height="calc(100vh - 100px)"
								padding={{ top: 0, bottom: 20, left: 35, right: 20 }}
							/>
						</div>
					</div>
				{:else if section.id == "map1" || section.id == "map2"}
					<div class="scroller-background">
						<Map
							style={mapstyle}
							bind:map={map[section.id]}
							interactive={false}
							location={{ bounds: mapbounds }}
						>
							<MapSource id="lad" type="geojson" data={geojson} promoteId="AREACD">
								<MapLayer
									id="lad-fill"
									type="fill"
									idKey="areacd"
									colorKey={props[section.id].colorKey}
									data={places}
									highlight
									highlighted={props[section.id].highlighted}
									paint={{
										"fill-color": [
											"case",
											["!=", ["feature-state", "color"], null],
											["feature-state", "color"],
											"rgba(255, 255, 255, 0)"
										],
										"fill-opacity": 0.7
									}}
									order="place_other"
								/>
								<MapLayer
									id="lad-line"
									type="line"
									paint={{
										"line-color": [
											"case",
											["==", ["feature-state", "highlighted"], true],
											"black",
											"rgba(255,255,255,0)"
										],
										"line-width": 2
									}}
								/>
							</MapSource>
						</Map>
					</div>
				{/if}
			</div>
			<div slot="foreground">
				{#each section.sections as sub}
					<ScrollerSection id={sub.id}>
						{@html sub.content}
					</ScrollerSection>
				{/each}
			</div>
		</Scroller>
	{/if}
{/each}

<Container marginTop marginBottom>
	<!-- The links are in the page even when the details are closed, so prerendering finds every area -->
	<Details title={place ? "Other versions of this article" : "All versions of this article"}>
		<Grid colWidth="narrow">
			{#each regions as region}
				<GridCell>
					<strong>{region.nm}</strong>
					<div style:font-size="smaller">
						{#each places.filter( (d) => (d.regioncd ? d.regioncd == region.cd : d.ctrycd == region.cd) ) as place}
							<a href={resolve(`/${place.areacd}/`)}>{place.areanm}</a><br />
						{/each}
					</div>
				</GridCell>
			{/each}
		</Grid>
	</Details>
</Container>

<style>
	.hero-select {
		margin-top: 32px;
	}
	.scroll-cue {
		margin-top: 24px;
	}
	.scroller-background {
		width: 100%;
		height: 100vh;
	}
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	:global(svelte-scroller-foreground section div) {
		pointer-events: all !important;
	}
	/* The template's marks set their own colours, so drop the ONS highlighter background and underline */
	:global(mark) {
		background-color: lightgrey;
		background-image: none;
		box-shadow: none;
		font-weight: bold;
		padding: 0 4px;
	}
	.chart {
		margin-top: 45px;
		width: calc(100% - 5px);
	}
</style>
