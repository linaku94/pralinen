<script>
	import Praline from '../../components/Praline.svelte';
	import Himbeer from '$lib/assets/2024/himbeer.png';
	import Zitrone from '$lib/assets/2024/zitrone.png';
	import Karamell from '$lib/assets/2024/karamell.png';
	import Kaktus from '$lib/assets/2024/kaktus.png';
	import Karlsruhe from '$lib/assets/2024/karlsruhe.png';
	import Eierlikoer from '$lib/assets/2024/eierlikoer.png';
	import Kokos from '$lib/assets/2024/kokos.png';
</script>
<div class="bg-karlsruhe24 bg-cover bg-center bg-opacity-90">
		<div class="text-lg font-bold">
			<h1 class="great-vibes-regular text-3xl text-center pt-10">Kollektion 2024</h1>
		</div>
		<div class="px-10 py-10 flex flex-col items-center ">
			<Praline picture={Karlsruhe} name='Karlsruhe' description='Cremige Pistazie, mit Echtgold veredelt' />
			<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
			<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
			<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
			<Praline picture={Eierlikoer} name='Eierlikör' description='Genuss mit Schuss' />
			<Praline picture={Kaktus} name='Kaktus' description='Unser diesjähriges Special - prickelndes Kaktuseis' />
			<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhüllt von zarten Flocken' />
		</div>

</div>

<style>
</style>