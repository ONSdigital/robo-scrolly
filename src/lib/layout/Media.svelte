<script>
	import { themes } from "$lib/config";
	import { getContext } from "svelte";

	export let theme = getContext("theme");
	export let col = "medium";
	export let grid = null;
	export let caption = null;
	export let height = 200;
	export let gap = 12;

  let colors = theme ? themes[theme] : {};
	let gridClass = grid ? ` grid-${grid}` : '';
	let rowHeight = !Number.isNaN(height) ? height + "px" : height;
	let gridGap = !Number.isNaN(gap) ? gap + "px" : gap;
</script>

<figure style:--text={colors.text} style:--background={colors.background}>
	<div class="col-{col}">
		<div class="grid{gridClass}" style:grid-gap={gridGap} style:min-height={rowHeight}>
			<slot></slot>
		</div>
  </div>
</figure>

{#if caption}
<caption style:--text={colors.text} style:--background={colors.background}>
  <div class="col-medium">
    <div class="caption">{@html caption}</div>
  </div>
</caption>
{/if}

<style>
  figure, caption {
    color: var(--text, #222);
    background-color: var(--background, #fff);
  }
	.grid-ms {
		display: grid;
		display: -ms-grid;
		-ms-grid-columns: 1fr;
		grid-template-columns: 1fr;
		margin-top: 40px;
	}
	.grid {
		display: -ms-grid;
		display: grid;
		grid-template-columns: repeat(auto-fill, 100%);
		margin: 40px 0 0 0;
	}
	.grid-narrow {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
	}
	.grid-medium {
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
	}
	.grid-wide {
		grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)) !important;
	}
	:global(.grid > div) {
		min-height: inherit;
	}
</style>
