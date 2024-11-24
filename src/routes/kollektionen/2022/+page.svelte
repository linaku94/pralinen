<script>
	import Himbeer from '$lib/assets/2022/himbeer.png'
	import Zitrone from '$lib/assets/2022/zitrone.png'
	import Karamell from '$lib/assets/2022/karamell.png'
	import Mango from '$lib/assets/2022/mango.png'
	import Eierlikoer from '$lib/assets/2022/eierlikoer.png'
	import Kokos from '$lib/assets/2022/kokos.png'
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="text-lg font-bold">
	<h1 class="great-vibes-regular">Kollektion 2021</h1>
</div>
<div class="px-20 py-20 flex flex-wrap gap-4 justify-center">
		<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
		<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
		<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
		<Praline picture={Eierlikoer} name='Eierlikoer' description='Genuss mit Schuss' />
		<Praline picture={Mango} name='Mango' description='Tango Mango' />
		<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhuellt von zarten Flocken' />
</div>

<style>
    .great-vibes-regular {
        padding-top: 100px;
        text-align: center;
        font-size: xxx-large;
    }
</style>