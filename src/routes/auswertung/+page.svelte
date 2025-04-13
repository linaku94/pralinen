<script lang='ts'>
	import { getFeedback } from '$lib/firebase.js';
	import { onMount } from 'svelte';
	import { type Feedback, pralinenSorten } from '$lib/common/types';
	import { PieChart } from 'layerchart';
	import { Paginate, Pagination, Table } from 'svelte-ux';

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
		<div class='flex md:flex-row flex-col justify-center pb-20 px-20'>
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
		<div class="min-w-[1000px] overflow-x-scroll">
		<Paginate data={feedbacks} perPage={10} let:pageData let:pagination>
			<Table
				data={pageData}
				columns={[
					{
						header: 'Name',
						name: 'name',
						align: 'left'
					},
					{
						header: 'Beste Praline',
						name: 'bestePraline',
						align: 'left'
					},
					{
						header: 'Schlechteste Praline',
						name: 'schlechtestePraline',
						align: 'left'
					},
					{
						header: 'Was ich euch noch sagen möchte',
						name: 'freitext',
						align: 'left'
					}
				]}
			/>
		<Pagination
			{pagination}
			perPageOptions={[5, 10, 25, 100]}
			show={["perPage", "pagination", "prevPage", "nextPage"]}
			classes={{
      root: "border-t py-1 mt-2",
      perPage: "flex-1 text-right",
      pagination: "px-8",
    }}
		/>
		</Paginate>
	</div>
	</div>
{/if}
