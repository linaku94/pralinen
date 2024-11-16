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
			<li><a href="/about" class="nav-element">Pralinen 2024</a></li>
			<li><a href="/about" class="nav-element">Feedback</a></li>
			<li><a href="/contact" class="nav-element">Vergangene Kollektionen</a></li>
		</ul>
	</div>
</nav>

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

{@render children()}
