<script>
	import schokolade from'$lib/assets/makingof/schokolade_small.png';
	import gruppenfoto_23 from '$lib/assets/makingof/gruppenfoto_23_small.png';
	import makingof_23 from '$lib/assets/makingof/makingof_23_small.png';
	import RoundedImageWithDescription from '../../components/RoundedImageWithDescription.svelte';
</script>


<div class="flex flex-col items-center p-5 gap-20">
	<h1 class="great-vibes-regular pb-5">Making Of</h1>
		<RoundedImageWithDescription image={schokolade} alt={'schokolade'} imagePosition={'left'} description="schokolade" />
		<RoundedImageWithDescription image={gruppenfoto_23} alt={'gruppenfoto 23'} imagePosition={'right'} description="gruppenfoto 23" />
		<RoundedImageWithDescription image={makingof_23} alt={'makingof 23'} imagePosition={'left'} description="making of" />
</div>

<style>
	.great-vibes-regular {
			font-size: xxx-large;
	}
</style>