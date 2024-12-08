<script>
	export let quote = 'you are awesome'
	export let author = 'jesus'
	export let profession = 'chocolate-lover'
</script>

<figure class="max-w-screen-md mx-auto text-center">
	<svg class="w-5 h-5 mx-auto mb-3 dark:fill-chocolate-dark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
		<path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
	</svg>
	<blockquote>
		<p class="text-xl italic font-medium dark:text-chocolate-dark">
			{quote}
		</p>
	</blockquote>
	<figcaption class="flex items-center justify-center mt-6 space-x-3 rtl:space-x-reverse">
		<div class="flex items-center divide-x-2 rtl:divide-x-reverse divide-gray-500 dark:divide-gray-700">
			<cite class="pe-3 font-medium dark:text-chocolate-dark">{author}</cite>
			<cite class="ps-3 text-sm text-chocolate-dark">{profession}</cite>
		</div>
	</figcaption>
</figure>
