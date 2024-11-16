<script>
import pralinen_1 from '$lib/assets/pralinen_1.jpg';
import pralinen_2 from '$lib/assets/pralinen_2.jpg';
import pralinen_3 from '$lib/assets/pralinen_3.jpg';
import pralinen_4 from '$lib/assets/pralinen_4.jpg';
const pictures = [pralinen_1, pralinen_2, pralinen_3, pralinen_4];
</script>

<div class="container mx-auto flex justify-between items-center">
	{#each pictures as picture}
	<img class="image_band_class" alt="pralinen bild 1" src={picture}/>
	{/each}
</div>

<style>
	.image_band_class {
			position: relative;
			width: auto;
			height: 300px;
	}
  .image_band_class:hover {
      position: relative;
      width: auto;
      height: 300px;
			transition: all;
			transition-duration: 500ms;
			cursor: pointer;
      transform: scale(1.1);
      z-index: 1000;
  }
</style>