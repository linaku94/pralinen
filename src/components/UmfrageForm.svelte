<script>
	import SelectField from './SelectField.svelte';
	import TextField from './TextField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { addFeedback } from '$lib/firebase.js';
	import PasswordField from './PasswordField.svelte';
	import Modal from './Modal.svelte';

	const sorten = ['Karamell', 'Mango', 'Eierlikoer', 'Zitrone', 'Kokos', 'Himbeer'];

	let showModal = $state(false);

	let bestePraline = $state('');
	let schlechtestePraline = $state('');
	let freitext = $state('');
	let password = $state('');

	let modalMessage = $state('');

	const onSubmit = async () => {
		try {
			let feedback = {
				bestePraline: bestePraline,
				schlechtestePraline: schlechtestePraline,
				freitext: freitext,
				password: password
			}

			await addFeedback(feedback);

			bestePraline = '';
			schlechtestePraline = '';
			freitext = '';

			modalMessage = 'Danke fuer deine Nachricht. Frohe Weihnachten :)'

		} catch {
			modalMessage = 'Ups, da ist etwas schiefgelaufen. Hast du das richtige Passwort eingegeben? Bitte versuche es spaeter nochmal.';
		}
		showModal = true;
	};

</script>
<div class="pb-5 pt-10 px-5">
	<form onsubmit={onSubmit} class="max-w-sm mx-auto text:chocolate-dark">
		<SelectField description="Welche Praline hat dir am besten geschmeckt?" placeholder="Waehle eine Pralinensorte aus"
								 options={sorten} label="leckerste-praline" bind:selected={bestePraline} />
		<SelectField description="Welche Praline koennte noch besser werden?" placeholder="Waehle eine Pralinensorte aus"
								 options={sorten} label="schlechteste-praline" bind:selected={schlechtestePraline} />
		<TextField description="Was ich euch noch sagen moechte" label="freitextfeld" bind:inputText={freitext} />
		<PasswordField description="Geheimes Pralinen Passwort" label="passwort" bind:password={password} />
		<SubmitButton description="Abschicken" />
	</form>
	<Modal  bind:showModal message={modalMessage}/>
</div>