<script>
	import CollectionOverview from '../../components/CollectionOverview.svelte';
</script>

<div class="text-lg font-bold">
	<h1 class="great-vibes-regular p-5">Vergangene Kollektionen</h1>
	<div class="flex justify-center flex-row p-20 gap-32">
		<CollectionOverview year="2021" bgvalue="bg-himbeer"/>
		<CollectionOverview year="2022" bgvalue="bg-zitrone22"/>
		<CollectionOverview year="2023" bgvalue="bg-karamell23"/>
	</div>
</div>

<style>
    .great-vibes-regular {
        padding-top: 100px;
        text-align: center;
        font-size: xxx-large;
    }
</style>