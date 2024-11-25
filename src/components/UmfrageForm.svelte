<script>
	const sorten = ['Karamell', 'Mango', 'Eierlikoer', 'Zitrone', 'Kokos', 'Himbeer'];
	const auswahltext = 'Waehle eine Pralinensorte aus'
</script>
<div class="pb-5 pt-10">
	<form class="max-w-sm mx-auto text:chocolate-dark">
		<label for="leckerste-praline" class="block mb-2 text-sm font-medium">Welche Praline hat dir am
			besten geschmeckt?</label>
		<select id="leckerste-praline"
						class="bg-gray-50 dark:bg-chocolate-light border border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5 mb-5">
			<option selected>{auswahltext}</option>
			{#each sorten as sorte}
				<option value={sorte}>{sorte}</option>
			{/each}
		</select>
		<div class="mb-5">
			<label for="schlechteste-praline" class="block mb-2 text-sm font-medium">Welche Praline hat dir am
				wenigsten geschmeckt?</label>
			<select id="schlechteste-praline"
							class="bg-gray-50 border dark:bg-chocolate-light border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5 mb-5">
				<option selected>{auswahltext}</option>
				{#each sorten as sorte}
					<option value={sorte}>{sorte}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="zusatz" class="block mb-2 text-sm font-medium">Was ich euch noch sagen moechte</label>
			<input type="text" id="zusatz"
						 class="bg-gray-50 border dark:bg-chocolate-light border-gray-300text-sm rounded-lg focus:ring-chocolate-dark focus:border-chocolate-dark block w-full p-2.5">
		</div>
		<div class="py-5">
			<button type="submit"
							class="text-chocolate-white bg-chocolate-dark dark:bg-chocolate hover:bg-chocolate-light focus:ring-4 focus:outline-none focus:ring-chocolate-light font-medium rounded-lg text-sm px-5 py-2.5 text-center">
				Abschicken
			</button>
		</div>
	</form>
</div>