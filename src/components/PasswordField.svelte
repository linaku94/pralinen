<script>
	let { description = '', label = '', password = $bindable() } = $props()
</script>

<label for={label} class="block mb-2 text-sm font-medium pt-5">{description}</label>
<input type="password" id={label} bind:value={password}
			 class="bg-gray-50 border dark:bg-chocolate border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5">