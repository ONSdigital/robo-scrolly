<script>
	import { themes } from '$lib/config';
	import { getContext } from 'svelte';

  export let theme = getContext('theme');
  export let hr = true;

  let colors = theme ? themes[theme] : {};
</script>

<section style:--text={colors.text} style:--background={colors.background} style:--muted={colors.muted}>
	<div class="col-medium">
    <hr style:border={hr ? null : 'none'}/>
	</div>
</section>

<style>
  section {
    color: var(--text, #222);
    background-color: var(--background, #fff);
  }
  hr {
    width: 75px;
    border: none;
    border-top: 2px solid;
    margin: 40px auto -10px auto;
    color: var(--muted, #777);
  }
</style>

