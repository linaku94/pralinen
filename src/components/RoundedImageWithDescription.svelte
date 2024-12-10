<script>
	let {image = '', alt = '', description = '', imagePosition = 'left' } = $props()
</script>
<div class="flex flex-row items-center justify-center gap-10 py-5">
	{#if imagePosition === 'left'}
		<p>{description}</p>
	{/if}
	<img class="object-cover rounded-lg md:h-auto w-3/4 hover-zoom" src={image} alt={alt}>
	{#if imagePosition === 'right'}
		<p>{description}</p>
	{/if}
</div>