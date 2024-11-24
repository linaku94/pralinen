<script>
import gruppenfoto23 from '$lib/assets/2023/gruppenfoto.png';
import makingof2 from '$lib/assets/2023/makingof2.png';
import makingof from '$lib/assets/2023/makingof.png';
import gruppenfoto22 from '$lib/assets/2022/gruppenfoto.png';
import schokolade from '$lib/assets/2023/schokolade.png';

let pictures = [
	{
		alt: 'gruppenfoto',
		src: gruppenfoto23,
	},
	{
		alt: 'schokolade',
		src: schokolade,
	},
	{
		alt: 'gruppenfoto',
		src: gruppenfoto22
	}
	// {
	// 	alt: 'makingof',
	// 	src: makingof,
	// },
	// {
	// 	alt: 'makingof',
	// 	src: makingof2,
	// }
];
</script>

<div class="left-0 flex justify-center rounded-box w-full">
	{#each pictures as picture}
	<img class="image_band_class" alt={picture.alt} src={picture.src}/>
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

  /* CSS Code */
  .swiper-wrapper {
      width: 100%;
      height: max-content !important;
      padding-bottom: 64px !important;
      -webkit-transition-timing-function: linear !important;
      transition-timing-function: linear !important;
      position: relative;
  }
  .swiper-pagination-bullet {
      background: #4F46E5;
  }
  .swiper-pagination-bullet-active {
      background: #4F46E5 !important;
  }


</style>