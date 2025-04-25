<script>
	import Himbeer from '$lib/assets/2022/himbeer_small.png';
	import Zitrone from '$lib/assets/2022/zitrone_medium.png';
	import Karamell from '$lib/assets/2022/karamell_small.png';
	import Mango from '$lib/assets/2022/mango_small.png';
	import Eierlikoer from '$lib/assets/2022/eierlikoer_small.png';
	import Kokos from '$lib/assets/2022/kokos_small.png';
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="bg-zitrone22 bg-cover bg-center">
	<div class="bg-white/30 flex flex-col fit-content">
		<div class="text-lg font-bold">
			<h1 class="great-vibes-regular text-3xl text-center pt-10 text-black">Kollektion 2022</h1>
		</div>
		<div class="px-10 py-10 flex flex-col items-center ">
			<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
			<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
			<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
			<Praline picture={Eierlikoer} name='Eierlikör' description='Genuss mit Schuss' />
			<Praline picture={Mango} name='Mango' description='Tango Mango' />
			<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhüllt von zarten Flocken' />
		</div>
	</div>
</div>

<style>
    .great-vibes-regular {
        text-align: center;
        font-size: xx-large;
    }
</style>