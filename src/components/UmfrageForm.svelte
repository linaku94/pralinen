<script>
	import SelectField from './SelectField.svelte';
	import TextField from './TextField.svelte';
	import SubmitButton from './SubmitButton.svelte';

	const sorten = ['Karamell', 'Mango', 'Eierlikoer', 'Zitrone', 'Kokos', 'Himbeer'];

</script>
<div class="pb-5 pt-10">
	<form class="max-w-sm mx-auto text:chocolate-dark">
		<SelectField description="Welche Praline hat dir am besten geschmeckt?" placeholder="Waehle eine Pralinensorte aus" options={sorten} label="leckerste-praline"/>
		<SelectField description="Welche Praline koennte noch besser werden?" placeholder="Waehle eine Pralinensorte aus" options={sorten} label="schlechteste-praline"/>
		<TextField description="Was ich euch noch sagen moechte" label="freitextfeld"/>
		<SubmitButton description="Abschicken"/>
	</form>
</div>