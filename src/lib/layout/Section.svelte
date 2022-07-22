<script>
	import { themes } from '$lib/config';
	import { getContext } from 'svelte';

	export let theme = getContext('theme');
	export let id = null;
</script>

<section {id} style="color: {themes[theme]['text']}; background-color: {themes[theme]['background']}">
	<div class="col-medium">
		<slot></slot>
	</div>
</section>

<style>
	section {
		margin-bottom: 40px;
	}
</style>