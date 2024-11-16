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
			<li><a href="/" class="nav-element">Home</a></li>
			<li><a href="/about" class="nav-element">About</a></li>
			<li><a href="/contact" class="nav-element">Contact</a></li>
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
      font-family: "Great Vibes", cursive;
      font-weight: 400;
      font-style: normal;
			font-size: xxx-large;
  }

</style>

{@render children()}
