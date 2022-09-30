<script>
  import { themes } from '$lib/config';
	import { getContext } from 'svelte';

	export let theme = getContext('theme');
  export let bgimage = null;
  export let bgcolor = null;
  export let bgfixed = false;
  export let center = true;
  export let short = false;

  let colors = theme ? themes[theme] : {};
</script>

<header
  style:--text={colors.text} style:--background={bgcolor ? bgcolor : colors.background}
  style:background-image={bgimage ? `url(${bgimage})` : null} style:background-attachment={bgfixed ? 'fixed' : null}
  class:short>
	<div class="v-padded col-wide middle" style="position: relative" class:short class:height-full={!short}>
		<div class:center>
			<slot></slot>
    </div>
	</div>
</header>

<style>
  header {
    color: var(--text, #222);
    background-color: var(--background, #fff);
  }
  .short {
    min-height: 85vh;
  }
  .v-padded {
    box-sizing: border-box;
    padding: 40px 0;
  }
</style>