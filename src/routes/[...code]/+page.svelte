<script>
  import { base } from "$app/paths";

  export let data;
  let { geojson, mapbounds, places, lookup, selected, content, place, region, ctry, siblings } = data;
	$: ({ geojson, mapbounds, places, lookup, selected, content, place, region, ctry, siblings } = data);

	// CORE IMPORTS
	import { getContext, onMount } from "svelte";
	import { getMotion } from "$lib/utils";
  import bbox from "@turf/bbox";

	import Header from "$lib/layout/Header.svelte";
	import Section from "$lib/layout/Section.svelte";
	import Media from "$lib/layout/Media.svelte";
	import Scroller from "$lib/layout/Scroller.svelte";
	import Filler from "$lib/layout/Filler.svelte";
	// import Divider from "$lib/layout/Divider.svelte";
	import Toggle from "$lib/ui/Toggle.svelte";
	import Arrow from "$lib/ui/Arrow.svelte";
	import Icon from "$lib/ui/Icon.svelte";
	import Select from "$lib/ui/Select.svelte";

	// DEMO-SPECIFIC IMPORTS
	import { goto } from "$app/navigation";
	import { setColors } from "$lib/utils";
	import { units, themes, regions } from "$lib/config";
	import { ScatterChart, LineChart, BarChart } from "@onsvisual/svelte-charts";
	import { Map, MapSource, MapLayer, MapTooltip } from "@onsvisual/svelte-maps";

	// CORE CONFIG (COLOUR THEMES)
	let theme = getContext('theme');
	onMount(() => setColors(themes, theme.name));

	// CONFIG FOR SCROLLER COMPONENTS
	// Config
	const threshold = 0.65;
	// State
	let animation = getMotion(); // Set animation preference depending on browser preference
	let showList = false; // Show/hide list of local authorities at end of article

	// DEMO-SPECIFIC CONFIG
	// Constants
	const mapstyle = `${base}/data/mapstyle.json`;

	// Element bindings
	let map = {map1: null, map2: null};

	// State
	// Props for interactive charts/maps
	let props = {
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
	};

	// FUNCTIONS (INCL. SCROLLER ACTIONS)

	// Functions for chart and map on:select and on:hover events
	function doSelect(e) {
		let selected_new = e.detail.areacd ? e.detail.areacd : e.detail.id;
		if (e.detail.feature) fitById(selected); // Fit map if select event comes from map
		goto(`${base}/${selected_new}/`, {noscroll: true, keepfocus: true});
	}
	function doClear() {
		goto(`${base}/`, {noscroll: true, keepfocus: true});
	}
	function doHover(e) {
		hovered = e.detail.id;
	}

	// Functions for map component
	export function fitBounds(bounds, map) {
		if (map) {
			map.fitBounds(bounds, {animate: animation, padding: 50});
		}
	}

	export function fitById(id, geojson, map) {
		if (geojson && id) {
			let feature = geojson.features.find(d => d.properties.AREACD == id);
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
				let areacd = [...places].sort((a, b) => b.long_term_illness_2011_pc - a.long_term_illness_2011_pc)[0].areacd; // ID of place with highest rate
				props[id].highlighted = [areacd]; // Highlight this place
				fitById(areacd, geojson, map["map1"]); // Fit the map to this place
			},
			map1_c: (id) => {
				let areacd = [...places].sort((a, b) => a.long_term_illness_2011_pc - b.long_term_illness_2011_pc)[0].areacd; // ID of place with lowest rate
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
				let areacd = [...places].sort((a, b) => b.long_term_illness_2011_pc - a.long_term_illness_2011_pc)[0].areacd; // ID of place with highest rate
				props[id].highlighted = [areacd]; // Highlight this place
				fitById(areacd, geojson, map["map2"]); // Fit the map to this place
			},
			map2_c: (id) => {
				let areacd = [...places].sort((a, b) => a.long_term_illness_2011_pc - b.long_term_illness_2011_pc)[0].areacd; // ID of place with lowest rate
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
	<title>{place ? `Localised article for ${place.areacd}` : 'Localised article example'}</title>
  <link rel="icon" href="https://www.ons.gov.uk/favicon.ico" />
  <link rel="canonical" href="https://www.ons.gov.uk{base}{selected ? '/' + selected : ''}">
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.ons.gov.uk{base}{selected ? '/' + selected : ''}" />
	<meta property="og:title" content="{place ? `Localised article for ${place.areacd}` : 'Localised article example'}" />
	<meta property="og:image" content="https://www.ons.gov.uk{base}/img/og.png" />
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
<Header theme="dark" bgcolor="#206095" bgfixed={true} center={false} short={true}>
	{@html section.content}
	<p>
		<Toggle mono={true} bind:checked={animation}>Animation {animation ? 'on' : 'off'}</Toggle>
	</p>
	<div style="margin-top: 55px;">
		{#if section.sections}
		<label for="intro-select">
			{@html section.sections[0].content}
		</label>
		{/if}
		<Select id="intro-select" idKey="areacd" labelKey="areanm" items={places} value={place} on:select={doSelect} on:clear={doClear} placeholder="Select a local authority..." darkMode/>
	</div>
	<div style="margin-top: 25px; height: 80px;">
		{#if place}
		<Arrow color="white" {animation}>Scroll to begin</Arrow>
		{/if}
	</div>
</Header>

{:else if section.type == "Filler"}
<Filler id={section.id ? section.id : null} theme="lightblue" wide={true} center={false}>
	{@html section.content}
</Filler>

{:else if section.type == "Section"}
<Section id={section.id ? section.id : null}>
	{@html section.content}
</Section>

{:else if section.type == "Scroller"}
<Scroller id={section.id} {threshold} splitscreen={true} on:change={runAction}>
	<div slot="background">
		{#if section.id == "scatter"}
		<div class="col-full height-full">
			<div class="chart">
				<ScatterChart
					data={places} {animation}
					color="lightgrey" colorSelect="#206095" colorHighlight="#999"
					xKey={props[section.id].xKey} yKey={props[section.id].yKey}
					xSuffix="%" idKey="areacd" labelKey="areanm"
					selected="{place.areacd}" highlighted={props[section.id].highlighted}
					hover labels overlayFill
					xMin={5} xMax={30}
					height="calc(100vh - 100px)" padding={{top: 0, bottom: 20, left: 35, right: 20}}/>
			</div>
		</div>

		{:else if section.id == "map1" || section.id == "map2"}
		<div class="col-full height-full">
			<Map style={mapstyle} bind:map={map[section.id]} interactive={false} location={{bounds: mapbounds}}>
				<MapSource
					id="lad" type="geojson"
					data={geojson} promoteId="AREACD">
					<MapLayer
						id="lad-fill" type="fill"
						idKey="areacd" colorKey={props[section.id].colorKey}
						data={places} highlight highlighted={props[section.id].highlighted}
						paint={{
							'fill-color': ['case',
								['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
								'rgba(255, 255, 255, 0)'
							],
							'fill-opacity': 0.7
						}}
            order="place_other"/>
					<MapLayer
            id="lad-line" type="line"
            paint={{
              'line-color': ['case',
                ['==', ['feature-state', 'highlighted'], true], 'black',
                'rgba(255,255,255,0)'
              ],
              'line-width': 2
            }}/>
				</MapSource>
			</Map>
		</div>
		{/if}
	</div>
	<div slot="foreground">
		{#each section.sections as sub}
		<section data-id="{sub.id}">
			<div class="col-medium">
				{@html sub.content}
			</div>
		</section>
		{/each}
	</div>
</Scroller>
{/if}
{/each}

<Section>
	<h2>{place ? 'Other versions of this article' : 'All versions of this article'}</h2>
	<p><Icon type="arrow" rotation={showList ? 90 : 0}/> <button class="btn-text" on:click={() => showList = !showList}>{showList ? 'Hide' : 'Show'} list of local authorities</button></p>
</Section>

<div class:visually-hidden="{!showList}">
<Media col="wide" grid="narrow">
	{#each regions as region}
	<div class="text-small">
		<strong>{region.nm}</strong><br/>
		{#each places.filter(d => d.regioncd ? d.regioncd == region.cd : d.ctrycd == region.cd) as place}
		<a href="{base}/{place.areacd}/">{place.areanm}</a><br/>
		{/each}
	</div>
	{/each}
</Media>
</div>

<style>
	/* Styles specific to elements within the demo */
	:global(svelte-scroller-foreground) {
		pointer-events: none !important;
	}
	:global(svelte-scroller-foreground section div) {
		pointer-events: all !important;
	}
	:global(mark) {
		background-color: lightgrey;
		font-weight: bold;
		padding: 0 4px;
	}
	button {
		cursor: pointer;
	}
	.chart {
		margin-top: 45px;
		width: calc(100% - 5px);
	}
	.chart-full {
		margin: 0 20px;
	}
	.chart-sml {
		font-size: 0.85em;
	}
	.btn-text {
		border: none;
		background: none;
		margin: 0;
		padding: 0;
		text-decoration: underline;
		color: #206095;
	}
	.btn-text:hover {
		color: black;
	}
</style>
