<script>
export let picture = '';
export let name = 'Praline';
export let description = 'Lecker Praline mhmmmm'
</script>
<div class="px-10 py-10 text-chocolate-dark">
	<div class="hover-zoom flex flex-row items-center bg-chocolate-light rounded-lg shadow md:flex-row">
		<img class="object-cover self-center rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-s-lg" src={picture} alt="praline demo 1">
		<div class="flex flex-col justify-between p-4 leading-normal">
			<h5 class="mb-2 text-2xl font-bold tracking-tight">{name}</h5>
			<p class="mb-3 font-normal">{description}</p>
		</div>
	</div>
</div>

<style>
</style>