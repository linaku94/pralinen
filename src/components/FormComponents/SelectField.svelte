<script>
	let { description = '', placeholder = '', options = [''], label = '', selected = $bindable() } = $props();
</script>

<label for={label} class="block mb-5 text-sm font-medium text-black">{description}
	<select id={label} bind:value={selected}
					class="bg-gray-50 border border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5 mb-5">
		<option selected value="">{placeholder}</option>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>