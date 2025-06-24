<script>
	import { themes } from '$lib/config';
	import { getContext } from 'svelte';

	export let theme = getContext('theme');
	export let id = null;

  let colors = theme ? themes[theme] : {};
</script>

<section {id} style:--text={colors.text} style:--background={colors.background}>
	<div class="col-medium">
		<slot></slot>
	</div>
</section>

<style>
	section {
		margin-bottom: 40px;
    color: var(--text, #222);
    background-color: var(--background, #fff);
	}
</style>