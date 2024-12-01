<script>
	export let description = '';
	export let label='';
</script>

<label for="textfield" class="block mb-2 text-sm font-medium">{description}</label>
<input type="text" id={label}
			 class="bg-gray-50 border dark:bg-chocolate-light border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5">