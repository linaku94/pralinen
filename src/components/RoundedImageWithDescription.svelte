<script>
	let {image = '', alt = '', description = '', imagePosition = 'left' } = $props()
</script>
<div class="flex md:flex-row flex-col items-center justify-center gap-10 pb-5">
	{#if imagePosition === 'left'}
		<p class="oder-first md:order-first">{description}</p>
	{/if}
	<img class="object-cover rounded-lg w-4/5 md:h-auto hover-zoom" src={image} alt={alt}>
	{#if imagePosition === 'right'}
		<p class="order-first md:order-last">{description}</p>
	{/if}
</div>