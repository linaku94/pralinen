<script>
	import karamell from'$lib/assets/2025/karamell_warten.jpg';
	import fuellungen from '$lib/assets/2025/fuellungen.jpg';
	import fuellen from '$lib/assets/2025/fuellen.jpg';
	import ummanteln from '$lib/assets/2025/ummanteln.jpg';
	import verpacken from '$lib/assets/2025/verpacken.jpg';
	import shooting from '$lib/assets/2025/shooting.jpg';
	import gruppenbild from '$lib/assets/2025/gruppenbild.jpg';
	import RoundedImageWithDescription from '../../components/RoundedImageWithDescription.svelte';
</script>


<div class="flex flex-col items-center justify-center gap-16 md:gap-32">
	<h1 class="great-vibes-regular text-3xl pt-10">Making Of</h1>
		<RoundedImageWithDescription image={karamell} alt={'karamell'} imagePosition={'left'} description="Mit Karamell starten und geduldig warten ..." />
		<RoundedImageWithDescription image={fuellungen} alt={'fuellungen'} imagePosition={'right'} description="... und währenddessen alle anderen Füllungen vorbereiten." />
		<RoundedImageWithDescription image={fuellen} alt={'arbeiten'} imagePosition={'left'} description="... die Pralinen werden befüllt, versiegelt, ..." />
		<RoundedImageWithDescription image={ummanteln} alt={'arbeiten2'} imagePosition={'right'} description="... ummantelt und verziert ..." />
		<RoundedImageWithDescription image={verpacken} alt={'ergebnnis'} imagePosition={'left'} description="... und liebevoll verpackt ..." />
		<RoundedImageWithDescription image={shooting} alt={'shooting'} imagePosition={'right'} description="... und in Szene gesetzt." />
		<RoundedImageWithDescription image={gruppenbild} alt={'gruppenbild'} imagePosition={'left'} description="Frohe Weihnachten!" />
</div>

<style>
</style>