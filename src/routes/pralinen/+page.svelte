<script>
	import Praline from '../../components/Praline.svelte';
	import Himbeer from '$lib/assets/2025/himbeer.jpg';
	import Zitrone from '$lib/assets/2025/zitrone.jpg';
	import Karamell from '$lib/assets/2025/karamell.jpg';
	import Kaktus from '$lib/assets/2025/kaktus.jpg';
	import Matcha from '$lib/assets/2025/matcha.jpg';
	import Kokos from '$lib/assets/2025/kokos.jpg';
</script>
<div class="bg-himbeer25 bg-cover bg-center bg-opacity-90">
		<div class="text-lg font-bold">
			<h1 class="great-vibes-regular text-3xl text-center pt-10">Kollektion 2025</h1>
		</div>
		<div class="px-10 py-10 flex flex-col items-center ">
			<Praline picture={Himbeer} name='Himbeer' description='Unser zeitloser Superstar' />
			<Praline picture={Zitrone} name='Zitrone' description='Goldene Zitrone, spritzig und frisch' />
			<Praline picture={Karamell} name='Karamell' description='Ein Traum aus Karamell und Meersalz' />
			<Praline picture={Matcha} name='Matcha' description='Unser Exot' />
			<Praline picture={Kaktus} name='Kaktus' description='Unser diesjähriges Special - prickelndes Kaktuseis' />
			<Praline picture={Kokos} name='Kokos' description='Cremiges Kokos umhüllt von zarten Flocken' />
		</div>

</div>

<style>
</style>