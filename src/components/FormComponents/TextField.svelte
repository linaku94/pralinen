<script>
	let { description = '', label = '', inputText = $bindable() } = $props();
</script>

<label for={label} class="block mb-5 text-sm font-medium">{description}
	<input type="text" id={label} bind:value={inputText}
				 class="bg-gray-50 border border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5">
</label>