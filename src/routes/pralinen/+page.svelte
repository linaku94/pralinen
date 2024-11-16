<script>
	import Praline from '../Praline.svelte';
	import praline_demo_1 from '$lib/assets/2023/praline_demo_1.jpeg'
</script>

<div class="text-lg font-bold">
	<h1 class="text-regular">Kollektion 2024</h1>
</div>
<div class="px-20 py-20 fle align-middle justify-items-center">
		<Praline picture={praline_demo_1} name='Karamell Meersalz' description='Ein Traum aus Karamell und Meersalz' />
		<Praline picture={praline_demo_1} name='Karamell Meersalz' description='Ein Traum aus Karamell und Meersalz' />
</div>

<style>
    .text-regular {
        padding-top: 100px;
        text-align: center;
        font-size: xx-large;
    }
</style>