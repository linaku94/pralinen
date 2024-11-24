<script>
export let picture = '';
export let name = 'Praline';
export let description = 'Lecker Praline mhmmmm'
</script>
<div class="px-10 py-10 fle align-middle justify-items-center">
	<div class="flex flex-col items-center bg-slate-100 border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100">
		<img class="object-cover rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src={picture} alt="praline demo 1">
		<div class="flex flex-col justify-between p-4 leading-normal">
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-slate-700">{name}</h5>
			<p class="mb-3 font-normal text-gray-700">{description}</p>
		</div>
	</div>
</div>

<style>
</style>