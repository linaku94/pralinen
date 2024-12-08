<script>
	let { description = '', label = '', inputText = $bindable() } = $props()
</script>

<label for={label} class="block mb-2 text-sm font-medium">{description}</label>
<input type="text" id={label} bind:value={inputText}
			 class="bg-gray-50 border dark:bg-chocolate border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5">