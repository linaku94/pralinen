<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav class="bg-slate-300 text-slate-700 p-10">
	<div class="container mx-auto flex justify-between items-center">
		<div class="text-lg font-bold">
			<a href="/" class="great-vibes-regular">Pralinen aus Karlsruhe</a>
		</div>
		<ul class="flex space-x-4">
			<li><a href="/pralinen" class="nav-element">Pralinen 2024</a></li>
			<li><a href="/feedback" class="nav-element">Feedback</a></li>
			<li><a href="/kollektionen" class="nav-element">Kollektionen</a></li>
		</ul>
	</div>
</nav>

{@render children()}

<footer class="bg-slate-300 shadow p-4 dark:bg-gray-800 bottom-0 absolute w-full">
	<div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
		<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">Pralinen aus Karlsruhe</span>
		<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
			<li>
				<a href="/" class="hover:underline">Kontakt</a>
			</li>
		</ul>
	</div>
</footer>

<style>
    .nav-element {
        color: rgb(51 65 85);
    }

    .nav-element:hover {
        color: rgb(156 163 175);
    }

    .great-vibes-regular {
        font-size: xxx-large;
    }

</style>
