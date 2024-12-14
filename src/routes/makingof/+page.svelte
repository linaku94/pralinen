<script>
	import schokolade from'$lib/assets/makingof/schokolade_small.png';
	import gruppenfoto_23 from '$lib/assets/makingof/gruppenfoto_23_small.png';
	import makingof_23 from '$lib/assets/makingof/makingof_23_small.png';
	import RoundedImageWithDescription from '../../components/RoundedImageWithDescription.svelte';
</script>


<div class="flex flex-col items-center justify-center gap-16 md:gap-32">
	<h1 class="great-vibes-regular text-2xl pt-5">Making Of</h1>
		<RoundedImageWithDescription image={schokolade} alt={'schokolade'} imagePosition={'left'} description="Hier beginnt alles mit 5kg feinster Schokolade..." />
		<RoundedImageWithDescription image={gruppenfoto_23} alt={'gruppenfoto 23'} imagePosition={'right'} description="... die zu köstlichen Füllungen verarbeitet wird ..." />
		<RoundedImageWithDescription image={makingof_23} alt={'makingof 23'} imagePosition={'left'} description="... die Pralinen werden befüllt, versiegelt ..." />
		<RoundedImageWithDescription image={makingof_23} alt={'makingof 23'} imagePosition={'left'} description="... ummantelt und verziert ..." />
</div>

<style>
</style>