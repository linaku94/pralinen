<script>
import { Carousel } from 'flowbite-svelte';
import gruppenfoto from '$lib/assets/2023/gruppenfoto.png';
import schokolade from '$lib/assets/2023/schokolade.png';

let images = [
	{
		alt: 'gruppenfoto',
		src: gruppenfoto,
		title: 'gruppenfoto'
	},
	{
		alt: 'schokolade',
		src: schokolade,
		title: 'schokolade'
	}
];
</script>

<!--<div class="container mx-auto flex justify-between items-center pb-10">-->
<!--	{#each pictures as picture}-->
<!--	<img class="image_band_class" alt="pralinen bild 1" src={picture}/>-->
<!--	{/each}-->
<!--</div>-->

<div class="max-w-4xl justify-center flex flex-wrap">
	<Carousel {images} let:Controls>
		<Controls />
	</Carousel>
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