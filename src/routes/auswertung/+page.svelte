<script lang='ts'>
	import { getFeedback } from '$lib/firebase.js';
	import { onMount } from 'svelte';
	import { type Feedback, pralinenSorten } from '$lib/common/types';
	import { PieChart } from 'layerchart';

	let feedbacks: Feedback[] = [];
	let loading = true;
	let bestePraline: { sorte: string; anzahl: number }[] = [];
	let schlechtestePraline: { sorte: string; anzahl: number }[] = [];

	onMount(async () => {
		feedbacks = await getFeedback() as Feedback[];
		pralinenSorten.forEach(sorte => {
			bestePraline.push({
				sorte: sorte, anzahl: feedbacks.filter(feedback => feedback.bestePraline === sorte).length
			});
			schlechtestePraline.push({
				sorte: sorte, anzahl: feedbacks.filter(feedback => feedback.schlechtestePraline === sorte).length
			});
		});
		loading = false;
	});

</script>

<div class='text-lg font-bold'>
	<h1 class='great-vibes-regular text-center text-3xl pt-10'>Umfrageergebnisse 2024</h1>
</div>
{#if loading}
	<div class='text-center p-16 font-normal'>
		<p>... Loading ...</p>
	</div>
{:else}
	<div class='px-9 py-5 relative overflow-x-scroll shadow-md rounded-lg'>
		<table class='w-full table-auto text-sm text-left rtl:text-right'>
			<thead class='uppercae font-bold bg-chocolate-light rounded-lg'>
			<tr>
				<th>Name</th>
				<th>Beste Praline</th>
				<th>Schlechteste Praline</th>
				<th>Freitext</th>
			</tr>
			</thead>
			<tbody>
			{#each feedbacks as feedback}
				<tr class='even:bg-chocolate-light bg-opacity-10'>
					<td>{feedback.name}</td>
					<td>{feedback.bestePraline}</td>
					<td>{feedback.schlechtestePraline}</td>
					<td>{feedback.freitext}</td>
				</tr>
			{/each}
			</tbody>
		</table>
		<div class='flex flex-row justify-center pb-5'>
			<div class='w-[300px] h-[300px] p-7 text-center'>
				<h2 class='pb-3'>Beste Praline</h2>
				<PieChart
					data={bestePraline}
					key='sorte'
					value='anzahl'
					innerRadius={-20}
					cornerRadius={5}
					padAngle={0.02}
					legend={{ placement: "center", orientation: "vertical"}}
				/>
			</div>
			<div class='w-[300px] h-[300px] p-7 text-center'>
				<h2 class='pb-3'>Schlechteste Praline</h2>
				<PieChart
					data={schlechtestePraline}
					key='sorte'
					value='anzahl'
					innerRadius={-20}
					cornerRadius={5}
					padAngle={0.02}
					legend={{ placement: "center", orientation: "vertical" }}
				/>
			</div>
		</div>
	</div>
{/if}
