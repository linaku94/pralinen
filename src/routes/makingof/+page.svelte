<script>
	import schokolade from'$lib/assets/makingof/schokolade_small.png';
	import arbeiten2 from '$lib/assets/makingof/arbeiten2.png';
	import arbeiten from '$lib/assets/makingof/arbeiten.png';
	import gruppenbild from '$lib/assets/makingof/karamell_gruppenbild.png';
	import ergebnis from '$lib/assets/makingof/ergebnis.png';
	import RoundedImageWithDescription from '../../components/RoundedImageWithDescription.svelte';
</script>


<div class="flex flex-col items-center justify-center gap-16 md:gap-32">
	<h1 class="great-vibes-regular text-3xl pt-10">Making Of</h1>
		<RoundedImageWithDescription image={schokolade} alt={'schokolade'} imagePosition={'left'} description="Hier beginnt alles mit 5kg feinster Schokolade..." />
		<RoundedImageWithDescription image={gruppenbild} alt={'gruppenbild'} imagePosition={'right'} description="... die zu köstlichen Füllungen verarbeitet wird ..." />
		<RoundedImageWithDescription image={arbeiten2} alt={'arbeiten'} imagePosition={'left'} description="... die Pralinen werden befüllt, versiegelt ..." />
		<RoundedImageWithDescription image={arbeiten} alt={'arbeiten2'} imagePosition={'right'} description="... ummantelt und verziert ..." />
		<RoundedImageWithDescription image={ergebnis} alt={'ergebnis'} imagePosition={'left'} description="... bis alle fertig sind." />
</div>

<style>
</style>