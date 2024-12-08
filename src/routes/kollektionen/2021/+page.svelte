<script>
	import Himbeer from '$lib/assets/2021/himbeer.png';
	import Zitrone from '$lib/assets/2021/zitrone.png';
	import Karamell from '$lib/assets/2021/karamell.png';
	import Mango from '$lib/assets/2021/mango.png';
	import Eierlikoer from '$lib/assets/2021/eierlikoer.png';
	import Kokos from '$lib/assets/2021/kokos.png';
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="bg-mango bg-cover bg-center">
	<div class="text-lg font-bold">
		<h1 class="great-vibes-regular pt-10">Kollektion 2021</h1>
	</div>
	<div class="px-10 py-10 flex flex-col items-center">
		<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
		<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
		<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
		<Praline picture={Eierlikoer} name='Eierlikoer' description='Genuss mit Schuss' />
		<Praline picture={Mango} name='Mango' description='Tango Mango' />
		<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhuellt von zarten Flocken' />
	</div>
</div>

<style>
    .great-vibes-regular {
        text-align: center;
        font-size: xx-large;
    }
</style>