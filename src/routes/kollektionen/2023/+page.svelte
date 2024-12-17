<script>
	import Himbeer from '$lib/assets/2023/himbeer_small.png';
	import Zitrone from '$lib/assets/2023/zitrone_small.png';
	import Karamell from '$lib/assets/2023/karamell_medium.png';
	import Mango from '$lib/assets/2023/mango_small.png';
	import Eierlikoer from '$lib/assets/2023/eierlikoer_small.png';
	import Kokos from '$lib/assets/2023/kokos_small.png';
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="bg-karamell23 bg-cover bg-center">
<div class="bg-white bg-cover bg-opacity-30">

	<div class="text-lg font-bold">
		<h1 class="great-vibes-regular text-center text-2xl pt-10">Kollektion 2023</h1>
	</div>
	<div class="px-10 py-10 flex flex-col items-center">
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
</style>