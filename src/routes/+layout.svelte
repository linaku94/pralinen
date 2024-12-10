<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav class="bg-chocolate-light text-chocolate-dark p-5 dark:bg-chocolate dark:text-chocolate-white">
	<div class="container mx-auto flex flex-col md:flex-row justify-between items-center">
		<div class="text-lg font-bold py-5">
			<a href="/" class="great-vibes-regular hover:text-chocolate-white dark:hover:text-chocolate-light pb-3">Pralinen aus Karlsruhe</a>
		</div>
		<ul class="flex space-x-4">
			<li><a href="/pralinen" class="hover:text-chocolate-white dark:hover:text-chocolate-light">2024</a></li>
			<li><a href="/rezensionen" class="hover:text-chocolate-white dark:hover:text-chocolate-light">Rezensionen</a></li>
			<li><a href="/umfrage" class="hover:text-chocolate-white dark:hover:text-chocolate-light">Umfrage</a></li>
			<li><a href="/kollektionen" class="hover:text-chocolate-white dark:hover:text-chocolate-light">Kollektionen</a></li>
		</ul>
	</div>
</nav>

<main class="mb-auto min-h-screen bg-chocolate-white text-chocolate-dark dark:bg-chocolate-dark dark:text-chocolate-white">
{@render children()}
</main>

<footer class="bg-chocolate-light dark:bg-chocolate text-chocolate-dark dark:text-white w-full p-1">
	<div class="w-full mx-auto max-w-screen-xl p-4 flex flex-row justify-between items-center">
		<span>
		<a href="/" class="hover:text-chocolate-white">Pralinen aus Karlsruhe</a>
		</span>
		<span>
			<a href="/makingof" class="hover:text-chocolate-white">Making of</a>
		</span>
	</div>
</footer>

<style>

    .great-vibes-regular {
        font-size: xx-large;
    }

</style>
