<script>
	import { themes } from '$lib/config.js';
	import { getContext } from 'svelte';

	export let theme = getContext('theme');
	export let center = true;
	export let wide = false;
	export let short = false;
	export let id = null;

  let colors = theme ? themes[theme] : {};
</script>

<section {id} style:--text={colors.text} style:background={colors.background}>
	<div class="middle" class:center class:col-medium={!wide} class:col-wide={wide} class:height-full={!short} class:short>
		<slot></slot>
	</div>
</section>

<style>
	section {
		padding: 36px 0;
    color: var(--text, #222);
    background-color: var(--background, #fff);
	}
	.short {
		min-height: 70vh;
	}
</style>