import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				chocolate: '#6B360F',
				'chocolate-dark': '#45220A',
				'chocolate-light': '#945E38',
				'chocolate-white' : '#EDE6D6',
				'chocolate-caramel' : '#FFD29A'
			}
		}
	},

	plugins: [forms, daisyui]
} satisfies Config;
