<script>
  import "../../app.css";
	import { onMount, setContext } from "svelte";
	import { base } from "$app/paths";
	import { regions } from "$lib/config";
	import Section from "$lib/layout/Section.svelte";
	import Media from "$lib/layout/Media.svelte";
	import Select from "$lib/ui/Select.svelte";

  export let data;

  // STYLE CONFIG
  // Set theme globally (options are 'light' or 'dark')
  let theme = "light";
  setContext("theme", theme);

	function doSelect(e) {
		let selected = e.detail;
		window.top.location.href = `${base}/${selected.areacd}/`;
	}

	onMount(() => {
		const pymChild = new pym.Child({polling: 1000});
	});
</script>

<svelte:head>
	<script src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"></script>
</svelte:head>

<Section>
	<div class="dropdown-container">
		<label for="select">Select a local authority</label>
    <Select id="select" idKey="areacd" labelKey="areanm" items={data.places} on:select={doSelect} placeholder="Select a local authority..."/>
	</div>
</Section>

<Media col="wide" grid="narrow">
	{#each regions as region}
	<div class="text-small">
		<strong>{region.nm}</strong><br/>
		{#each data.places.filter(d => d.regioncd ? d.regioncd == region.cd : d.ctrycd == region.cd) as place}
		<a href="{base}/{place.areacd}/">{place.areanm}</a><br/>
		{/each}
	</div>
	{/each}
</Media>

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
</style>