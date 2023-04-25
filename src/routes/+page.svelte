<script>
  import "../app.css";
  import { onMount, setContext } from "svelte";
  import { base } from "$app/paths";
  import { getPlace } from "$lib/utils";
  import Section from "$lib/layout/Section.svelte";
  import Header from "$lib/layout/Header.svelte";
  import Chart from "$lib/layout/Chart.svelte";
  import Select from "$lib/ui/Select.svelte";
  import Highlight from "../lib/layout/Highlight.svelte";

  export let data;

  let selected;

  // STYLE CONFIG
  // Set theme globally (options are 'light' or 'dark')
  let theme = "light";
  setContext("theme", theme);

  async function doSelect(e) {
    let code = typeof e === "string" ? e : e?.detail?.areacd;
    data.place = await getPlace(`${base}/data/json/${code}.json`);
    selected = data.places.find(d => d?.areacd === code);
  }

  async function doClear() {
    data.place = await getPlace(`${base}/data/json/default.json`);
  }

  onMount(() => {
    const pymChild = new pym.Child({ polling: 1000 });
    const parent = new URLSearchParams(document.location.search).get("parentUrl");
    const code = parent ? parent.split("#")[1] : null;
    console.log(document.location.search, parent, code);
    if (code && code.length === 9) {
      doSelect(code);
    }
  });
</script>

<svelte:head>
  <script src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.min.js"></script>
</svelte:head>

{#each data.place.sections as section}
  {#if section.type === "Header"}
    <Header {section}>
      {@html section.content}
      {#if section.label}<label for="select">{section.label}</label>{/if}
      <Select
        id="select"
        idKey="areacd"
        labelKey="areanm"
        items={data.places}
        value={selected}
        on:select={doSelect}
        on:clear={doClear}
        placeholder="Select a local authority..."
      />
    </Header>
  {:else if section.type === "Highlight"}
    <Highlight {section}>
      {@html section.content}
    </Highlight>
  {:else if section.type === "Chart" && section.chartType}
    <Chart {section} />
  {:else}
    <Section {section}>
      {@html section.content}
    </Section>
  {/if}
{/each}
