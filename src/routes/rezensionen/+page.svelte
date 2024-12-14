<script>
	import Quote from '../../components/Quote.svelte';

	let quotes = [
		{
			quote: 'Jede gute Praline hat ihre Wuerdigung verdient! Diese Seite gibt jeder Praline eine einzigartige Wuerdigung',
			author: 'Nicholas',
			profession: 'Kenner'
		},
		{
			quote: 'Hallo ihr Drei,  einfach sensationell. Mir haben alle hervorragend geschmeckt. Ich schwebe in Geschmacksträumen. Weiter so!',
			author: 'Anonym',
			profession: 'Verkostet jaehrlich unsere Pralinen'
		}
	];

</script>
<div class="p-7 flex flex-col items-center gap-10 bg-himbeer bg-center bg-cover min-h-screen">
	<h1 class="great-vibes-regular text-3xl pt-5 dark:text-chocolate-dark">Was Freunde ueber unsere Pralinen sagen</h1>
	{#each quotes as quote}
		<div class="p-5 bg-white bg-opacity-60 rounded-lg">
			<div class="px-5 py-5">
			<Quote quote={quote.quote} author={quote.author} profession={quote.profession} />
			</div>
		</div>
	{/each}
</div>

<style>
</style>