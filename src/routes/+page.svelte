<script>
  import "../app.css";
	import { onMount, setContext } from "svelte";
  import { Chart } from "@onsvisual/svelte-charts";
	import { base } from "$app/paths";
  import { getPlace } from "$lib/utils";
	import Section from "$lib/layout/Section.svelte";
	import Media from "$lib/layout/Media.svelte";
	import Select from "$lib/ui/Select.svelte";

  export let data;

  // STYLE CONFIG
  // Set theme globally (options are 'light' or 'dark')
  let theme = "light";
  setContext("theme", theme);

	async function doSelect(e) {
		let selected = e.detail;
    data.place = await getPlace(`${base}/data/json/${selected.areacd}.json`);
	}

  async function doClear() {
    data.place = await getPlace(`${base}/data/json/default.json`);
  }

	onMount(() => {
		const pymChild = new pym.Child({polling: 1000});
	});
</script>

<svelte:head>
	<script src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"></script>
</svelte:head>


{#each data.place.sections as section}
{#if section.type === "Header"}
<Section>
	<div class="dropdown-container">
		{@html section.content}
    <Select id="select" idKey="areacd" labelKey="areanm" items={data.places} on:select={doSelect} on:clear={doClear} placeholder="Select a local authority..."/>
	</div>
</Section>
{:else if section.type === "Chart" && section.chartType}
<Section>
  <Chart section={section}/>
</Section>
{:else}
<Section>
  {@html section.content}
</Section>
{/if}
{/each}

<!-- <Media col="wide" grid="narrow">
	{#each regions as region}
	<div class="text-small">
		<strong>{region.nm}</strong><br/>
		{#each data.places.filter(d => d.regioncd ? d.regioncd == region.cd : d.ctrycd == region.cd) as place}
		<a href="{base}/{place.areacd}/">{place.areanm}</a><br/>
		{/each}
	</div>
	{/each}
</Media> -->

<style>
	.dropdown-container {
		color: #206095;
		background-color: rgb(188, 207, 222);
		padding: 12px;
		margin: 0 -24px;
		font-size: 1.1rem;
	}
	.dropdown-container > label {
		font-size: 1.1em;
		font-weight: bold;
	}
  :global(.dropdown-container > h2) {
    margin-top: 0;
  }
  :global(div.title:has(+div.chart-container)) {
    font-size: 1em;
  }
</style>