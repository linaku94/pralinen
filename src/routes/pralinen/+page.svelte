<script>
	import Praline from '../../components/Praline.svelte';
	import Himbeer from '$lib/assets/2023/himbeer.png';
	import Zitrone from '$lib/assets/2023/zitrone.png';
	import Karamell from '$lib/assets/2023/karamell.png';
	import Mango from '$lib/assets/2023/mango.png';
	import Eierlikoer from '$lib/assets/2023/eierlikoer.png';
	import Kokos from '$lib/assets/2023/kokos.png';
</script>
<div class="bg-karamell23 bg-cover bg-opacity-90">
	<div class="bg-white bg-opacity-30 flex flex-col fit-content">
		<div class="text-lg font-bold">
			<h1 class="great-vibes-regular">Kollektion 2024</h1>
		</div>
		<div class="px-20 py-20 flex flex-col items-center ">
			<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
			<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
			<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
			<Praline picture={Eierlikoer} name='Eierlikoer' description='Genuss mit Schuss' />
			<Praline picture={Mango} name='Mango' description='Tango Mango' />
			<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhuellt von zarten Flocken' />
		</div>
	</div>

</div>

<style>
    .great-vibes-regular {
        padding-top: 100px;
        text-align: center;
        font-size: xxx-large;
    }
</style>