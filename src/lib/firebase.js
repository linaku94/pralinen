import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

const env = import.meta.env

const firebaseConfig = {
	apiKey: env.VITE_API_KEY,
	authDomain: env.VITE_AUTH_DOMAIN,
	projectId: env.VITE_PROJECT_ID,
	storageBucket: env.VITE_STORAGE_BUCKET,
	messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
	appId: env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addFeedback = async (feedback) => {
	try {
		await addDoc(collection(db, 'pralinen'), { ...feedback, timeStamp: new Date() });
	} catch (error) {
		console.log(`Error adding your feedback ${error}. Try again, if it does not work, ask Lina`)
		throw error
	}

};

export { db, addFeedback };
