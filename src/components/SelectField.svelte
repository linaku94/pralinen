<script>
	export let description = '';
	export let placeholder = '';
	export let options = [''];
	export let label='';
</script>

<label for={label} class="block mb-2 text-sm font-medium">{description}</label>
<select id={label}
				class="bg-gray-50 dark:bg-chocolate-light border border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5 mb-5">
	<option selected>{placeholder}</option>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>