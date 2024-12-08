<script>
	import SelectField from './SelectField.svelte';
	import TextField from './TextField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { addFeedback } from '$lib/firebase.js';
	import PasswordField from './PasswordField.svelte';
	import * as crypto from 'crypto'

	const sorten = ['Karamell', 'Mango', 'Eierlikoer', 'Zitrone', 'Kokos', 'Himbeer'];

	let bestePraline = '';
	let schlechtestePraline = '';
	let freitext = '';
	let successMessage = '';
	let errorMessage = '';
	let password = '';

	const onSubmit = async () => {
		try {
			let feedback = {
				bestePraline: bestePraline,
				schlechtestePraline: schlechtestePraline,
				freitext: freitext,
				password: crypto.createHash('sha256').update(password)
			}

			await addFeedback(feedback);

			successMessage = 'Vielen Dank :)';
			bestePraline = '';
			schlechtestePraline = '';
			freitext = '';

		} catch (error) {
			console.error('failed to save data to firestore', error);
			errorMessage = 'Ups, da ist etwas schiefgelaufen. Bitte versuche es spaeter nochmal';
			successMessage = '';
		}
	};

</script>
<div class="pb-5 pt-10 px-5">
	<form on:submit={onSubmit} class="max-w-sm mx-auto text:chocolate-dark">
		<SelectField description="Welche Praline hat dir am besten geschmeckt?" placeholder="Waehle eine Pralinensorte aus"
								 options={sorten} label="leckerste-praline" bind:selected={bestePraline} />
		<SelectField description="Welche Praline koennte noch besser werden?" placeholder="Waehle eine Pralinensorte aus"
								 options={sorten} label="schlechteste-praline" bind:selected={schlechtestePraline} />
		<TextField description="Was ich euch noch sagen moechte" label="freitextfeld" bind:inputText={freitext} />
		<PasswordField description="Geheimes Pralinen Passwort" label="passwort" bind:password={password} />
		<SubmitButton description="Abschicken" />
	</form>
</div>