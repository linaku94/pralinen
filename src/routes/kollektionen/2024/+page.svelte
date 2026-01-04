<script>
	import Himbeer from '$lib/assets/2024/himbeer.png';
	import Zitrone from '$lib/assets/2024/zitrone.png';
	import Karamell from '$lib/assets/2024/karamell.png';
	import Kaktus from '$lib/assets/2024/kaktus.png';
	import Eierlikoer from '$lib/assets/2024/eierlikoer.png';
	import Kokos from '$lib/assets/2024/kokos.png';
	import Karlsruhe from '$lib/assets/2024/karlsruhe.png';
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="bg-karlsruhe24 bg-cover bg-center">
<div class="bg-white bg-cover bg-opacity-30">

	<div class="text-lg font-bold">
		<h1 class="great-vibes-regular text-center text-2xl pt-10">Kollektion 2025</h1>
	</div>
	<div class="px-10 py-10 flex flex-col items-center">
		<Praline picture={Karlsruhe} name='Karlsruhe' description='Pistazie mit Echtgold' />
		<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
		<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
		<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
		<Praline picture={Eierlikoer} name='Eierlikör' description='Genuss mit Schuss' />
		<Praline picture={Kaktus} name='Mango' description='Prickelndes Kaktus Eis' />
		<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhüllt von zarten Flocken' />
	</div>
</div>
</div>

<style>
</style>