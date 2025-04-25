<script>
	let { description = 'Abschicken' } = $props();
</script>

<div class="py-5">
	<button type="submit"
					class="bg-white/50 text-black focus:ring-2 focus:outline-hidden font-medium rounded-lg text-sm px-5 py-2.5 text-center">
		{description}
	</button>
</div>