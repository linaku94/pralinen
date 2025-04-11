<script>
	import SelectField from './SelectField.svelte';
	import TextField from './TextField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { addFeedback } from '$lib/firebase.js';
	import Modal from '../Modal.svelte';
	import { pralinenSorten } from '$lib/common/types.ts';

	let showModal = $state(false);

	let bestePraline = $state('');
	let schlechtestePraline = $state('');
	let freitext = $state('');
	let password = $state('');
	let name = $state('');

	let modalMessage = $state('');

	const onSubmit = async () => {
		try {
			let feedback = {
				name: name,
				bestePraline: bestePraline,
				schlechtestePraline: schlechtestePraline,
				freitext: freitext,
				password: password
			}

			await addFeedback(feedback);

			bestePraline = '';
			schlechtestePraline = '';
			freitext = '';

			modalMessage = 'Danke für deine Nachricht. 🎄 Frohe Weihnachten :)'

		} catch {
			modalMessage = 'Ups, da ist etwas schiefgelaufen. Hast du das richtige Passwort eingegeben? Bitte versuche es später nochmal.';
		}
		showModal = true;
	};

</script>
<div class="pb-5 pt-10 px-5">
	<form onsubmit={onSubmit} class="max-w-sm mx-auto text:chocolate-dark">
		<TextField description="Wie heißt du?" label="name" bind:inputText={name} />
		<SelectField description="Welche Praline hat dir am besten geschmeckt?" placeholder="Wähle eine Pralinensorte aus"
								 options={pralinenSorten} label="leckerste-praline" bind:selected={bestePraline} />
		<SelectField description="Welche Praline könnte noch besser werden?" placeholder="Wähle eine Pralinensorte aus"
								 options={pralinenSorten} label="schlechteste-praline" bind:selected={schlechtestePraline} />
		<TextField description="Was ich euch noch sagen möchte" label="freitextfeld" bind:inputText={freitext} />
		<TextField description="Geheimes Pralinen Passwort" label="passwort" bind:inputText={password} />
		<SubmitButton description="Abschicken" />
	</form>
	<Modal  bind:showModal message={modalMessage}/>
</div>