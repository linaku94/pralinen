<script>
	import Himbeer from '$lib/assets/2023/himbeer_small.png';
	import Zitrone from '$lib/assets/2023/zitrone_small.png';
	import Karamell from '$lib/assets/2023/karamell.png';
	import Mango from '$lib/assets/2023/mango_small.png';
	import Eierlikoer from '$lib/assets/2023/eierlikoer_small.png';
	import Kokos from '$lib/assets/2023/kokos_small.png';
	import Praline from '../../../components/Praline.svelte';
</script>

<div class="bg-karamell23 bg-cover bg-center">
<div class="bg-white bg-cover bg-opacity-30">

	<div class="text-lg font-bold">
		<h1 class="great-vibes-regular pt-10">Kollektion 2023</h1>
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
    .great-vibes-regular {
        text-align: center;
        font-size: xx-large;
    }
</style>

<!--<script>-->
<!--	import Himbeer from '$lib/assets/2023/himbeer.png';-->
<!--	import Zitrone from '$lib/assets/2023/zitrone.png';-->
<!--	import Karamell from '$lib/assets/2023/karamell.png';-->
<!--	import Mango from '$lib/assets/2023/mango.png';-->
<!--	import Eierlikoer from '$lib/assets/2023/eierlikoer.png';-->
<!--	import Kokos from '$lib/assets/2023/kokos.png';-->

<!--	let pictures = [-->
<!--		{-->
<!--			image: Himbeer,-->
<!--			alt: 'Himbeer',-->
<!--			id: 'himbeer'-->
<!--		},-->
<!--		{-->
<!--			image: Zitrone,-->
<!--			alt: 'Zitrone',-->
<!--			id: 'zitrone'-->
<!--		},-->
<!--		{-->
<!--			image: Karamell,-->
<!--			alt: 'Karamell',-->
<!--			id: 'karamell'-->
<!--		},-->
<!--		{-->
<!--			image: Kokos,-->
<!--			alt: 'Kokos',-->
<!--			id: 'kokos'-->
<!--		},-->
<!--		{-->
<!--			image: Mango,-->
<!--			alt: 'Mangos',-->
<!--			id: 'mangos'-->
<!--		},-->
<!--		{-->
<!--			image: Eierlikoer,-->
<!--			alt: 'Eierlikoer',-->
<!--			id: 'eierlikoer'-->
<!--		}-->
<!--	];-->
<!--</script>-->

<!--<div class="justify-center flex w-full pt-20">-->
<!--	<div class="carousel rounded-box carousel-center w-1/2">-->
<!--		{#each pictures as picture}-->
<!--			<div id={picture.id} class="carousel-item w-1/2">-->
<!--				<img src={picture.image} class="w-full" alt={picture.alt} />-->
<!--			</div>-->
<!--		{/each}-->
<!--	</div>-->
<!--</div>-->