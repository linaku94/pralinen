<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav class="bg-chocolate-light text-chocolate-dark p-5 ">
	<div class="container mx-auto flex flex-col md:flex-row justify-between items-center">
		<div class="text-lg font-bold py-5">
			<a href="/" class="great-vibes-regular text-3xl hover:text-chocolate-white pb-3">Pralinen aus Karlsruhe</a>
		</div>
		<ul class="flex space-x-4">
			<li><a href="/pralinen" class="hover:text-chocolate-white">2025</a></li>
<!--			<li><a href="/rezensionen" class="hover:text-chocolate-white">Rezensionen</a></li>-->
			<li><a href="/umfrage" class="hover:text-chocolate-white">Umfrage</a></li>
			<li><a href="/auswertung" class="hover:text-chocolate-white">Auswertung</a></li>
			<li><a href="/kollektionen" class="hover:text-chocolate-white">Kollektionen</a></li>
		</ul>
	</div>
</nav>

<main class="mb-auto min-h-screen bg-chocolate-white text-chocolate-dark">
{@render children()}
</main>

<footer class="bg-chocolate-light text-chocolate-dark w-full p-1">
	<div class="w-full mx-auto max-w-(--breakpoint-xl) p-4 flex flex-row justify-between items-center">
		<span>
		<a href="/" class="hover:text-chocolate-white">Pralinen aus Karlsruhe</a>
		</span>
		<span>
			<a href="/makingof" class="hover:text-chocolate-white">Making of</a>
		</span>
	</div>
</footer>

<style>
</style>
