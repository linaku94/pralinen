<script>
	import CollectionOverview from '../../components/CollectionOverview.svelte';
</script>

<div class="text-lg font-bold">
	<h1 class="great-vibes-regular text-center text-3xl pt-10">Vergangene Kollektionen</h1>
	<div class="flex justify-center md:flex-row flex-col p-7 md:gap-32 gap-16">
		<CollectionOverview year="2021" bgvalue="bg-himbeer"/>
		<CollectionOverview year="2022" bgvalue="bg-zitrone22"/>
		<CollectionOverview year="2023" bgvalue="bg-karamell23"/>
	</div>
</div>

<style>
</style>