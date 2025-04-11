<script>
	import { getFeedback } from '$lib/firebase.js';
	import { onMount } from 'svelte';
	import type { Feedback } from '$lib/common/types';
	import { PieChart } from 'layerchart';

	let feedbacks = [];
	let loading = true;

	onMount(async () => {
		feedbacks = await getFeedback();
		loading = false;
	});

</script>

<div class="text-lg font-bold">
	<h1 class="great-vibes-regular text-center text-3xl pt-10">Umfrageergebnisse 2024</h1>
</div>
	{#if loading}
		<div class="text-center p-16 font-normal">
		<p>... Loading ...</p>
		</div>
	{:else}
		<div class="px-9 py-5 relative overflow-x-scroll shadow-md rounded-lg">
		<table class="w-full table-auto text-sm text-left rtl:text-right">
			<thead class="uppercae font-bold bg-chocolate-light rounded-lg">
			<tr>
				<th>Name</th>
				<th>Beste Praline</th>
				<th>Schlechteste Praline</th>
				<th>Freitext</th>
			</tr>
			</thead>
			<tbody>
			{#each feedbacks as feedback}
				<tr class="even:bg-chocolate-light bg-opacity-10">
					<td>{feedback.name}</td>
					<td>{feedback.bestePraline}</td>
					<td>{feedback.schlechtestePraline}</td>
					<td>{feedback.freitext}</td>
				</tr>
			{/each}
			</tbody>
		</table>
		</div>
	{/if}
