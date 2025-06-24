<script>
  import "../../app.css";
  import { page } from '$app/stores';
	import { setContext } from "svelte";
  import { analyticsId, analyticsProps } from "$lib/config";
  import AnalyticsBanner from "$lib/layout/AnalyticsBanner.svelte";
	import ONSHeader from "$lib/layout/ONSHeader.svelte";
	import ONSFooter from "$lib/layout/ONSFooter.svelte";
	//import Warning from "$lib/ui/Warning.svelte";

  // STYLE CONFIG
  // Set theme globally (options are 'light' or 'dark')
  let theme = "light";
  setContext("theme", theme);

  // GOOGLE ANALYTICS
  // Settings for page analytics. Values must be shared with <AnalyticsBanner> component
  // 'analyticsId' and 'analyticsProps' are defined in config.js
  let gtag;
</script>

<!-- <Warning/> -->
<AnalyticsBanner {analyticsId} {analyticsProps} {page} bind:gtag/>
<ONSHeader {theme} census/>

<main>
  <slot {theme} {gtag}/>
</main>

<ONSFooter {theme}/>
