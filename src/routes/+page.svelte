<script>
  import { base } from "$app/paths";
  import { getPlace } from "$lib/utils";
  import { regions } from "$lib/config";
  import {
    Embed,
    AnalyticsBanner,
    analyticsEvent,
    Highlight,
    Section,
    Grid,
    Select,
    Notice,
    Twisty,
    Container
  } from "@onsvisual/svelte-components";
  import { Chart } from "@onsvisual/svelte-charts";
  import ChartActions from "$lib/layout/ChartActions.svelte";
  import SummaryItem from "$lib/layout/SummaryItem.svelte";

  export let data;

  let selected;

  async function doSelect(e, cd = null) {
    const code = cd || e?.detail?.areacd;
    data.place = await getPlace(`${base}/data/json/${code}.json`);
    selected = data.places.find(d => d?.areacd === code);
    // console.log(e);
    document.getElementById("select").blur()
    // e.currentTarget.blur();
    // window.scrollTo(0,0);
    analyticsEvent({
      event: cd ? "clickSelect" : "searchSelect",
      areaCode: data.place.place.areacd,
      areaName: data.place.place.areanm
    });
  }

  function init(e) {
    const parent = e.detail.parentUrl;
    const code = parent ? parent.split("#")[1] : null;
    // console.log(document.location.search, parent, code);
    if (code && code.length === 9) {
      doSelect(code);
    }
  }

  const analyticsProps = (() => {
    const props = {};
    for (const key in ["contentTitle", "releaseDate", "outputSeries", "contentType"]) {
      if (data?.meta?.[key]) props[key] = data.meta[key];
    }
    return props;
  })();
</script>

<svelte:head>
  <title>{data?.meta?.title || ''}</title>
	<meta name="description" content="{data?.meta?.description || ''}" />
  <meta name="robots" content="noindex" />
  <meta name="googlebot" content="indexifembedded" />
</svelte:head>

<Embed on:load={init}>
  <AnalyticsBanner {analyticsProps} hideBanner />
  {#each data.place.sections as section}
    {#if section.type === "Meta"}
        <!-- meta -->
    {:else if section.type === "Header"}
      <img src="{base}/img/header.png" alt=""/>
      <Highlight height="auto" marginBottom={false}>
        <div style:padding="12px 24px 0" style:margin-bottom="-22px">
          {#if section.title}<h2 aria-live="polite">{section.title}</h2>{/if}
          {#if section.label}<label for="select" style:font-size="1rem">{section.label}</label>{/if}
          <Select
            id="select"
            idKey="areacd"
            labelKey="areanm"
            options={data.places}
            mode="search"
            on:change={doSelect}
            placeholder="Type an area name..."
            floatingConfig="{{ strategy: 'fixed' }}"
          />
        </div>
      </Highlight>
    {:else if section.type === "Highlight"}
      <Highlight id={section.id} height="auto" marginTop={false} marginBottom={false} theme="light">
        {@html section.content || ""}
      </Highlight>
    {:else if section.type === "Chart" && section.chartType}
    <Grid width="narrow" colwidth="full">
      <div class="chart-outer">
        <Chart {section} />
        {#if section.note}
        <div class="chart-note">{section.note}</div>
        {/if}
      </div>
      <ChartActions {section} place="{data.place.place}" />
    </Grid>
    {:else if section.type === "Summary"}
      <Section id={section.id} title={section.title} marginTop marginBottom={false}/>
      <Grid width="narrow" colwidth="full" height={100}>
        {#each section.sections as sub}
        <SummaryItem section={sub}/>
        {/each}
      </Grid>
    {:else if section.type === "Warning"}
      <Section cls="section-warning">
        <Notice mode="warning" important>
          {@html section.content || ""}
        </Notice>
      </Section>
    {:else}
      <Section id={section.id} title={section.title}>
        {@html section.content || ""}
      </Section>
    {/if}
  {/each}

  <Container marginTop={!data.place.place ? true : false} marginBottom>
    <Twisty title="All versions of this article">
      <Grid colwidth="narrow">
        {#each regions as region}
          {#each [data.places.filter(p => p.parentcd === region.cd)] as places}
          {#if places[0]}
          <div>
            <strong>{region.nm}</strong>
            <div style:font-size="smaller">
              {#each places as place}
              <button class="btn-link" on:click={(e) => doSelect(e, place.areacd)}>{place.areanm}</button><br/>
              {/each}
            </div>
          </div>
          {/if}
          {/each}
        {/each}
      </Grid>
    </Twisty>
  </Container>
</Embed>

<style>
  :global(.ons-feature__filler label) {
    margin-top: 12px !important;
  }
  :global(.ons-feature__filler h2) {
    margin-bottom: 0 !important;
  }
</style>