<script>
	let { description = 'Abschicken' } = $props();
</script>

<div class="py-5">
	<button type="submit"
					class="text-chocolate-white dark:hover:text-chocolate-dark bg-chocolate-dark dark:bg-chocolate hover:bg-chocolate-light focus:ring-4 focus:outline-none focus:ring-chocolate-light font-medium rounded-lg text-sm px-5 py-2.5 text-center">
		{description}
	</button>
</div>