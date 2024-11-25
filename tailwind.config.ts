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
				'chocolate-light': '#d1bc8a',
				'chocolate-white': '#EDE6D6',
				'chocolate-caramel': '#FFD29A'
			},
			backgroundImage: {
				'mango': 'url("src/lib/assets/2021/mango.png")',
				'himbeer' : 'url("src/lib/assets/2021/himbeer.png")',
				'zitrone' : 'url("src/lib/assets/2021/zitrone.png")'
			}
		}
	},

	plugins: [forms, daisyui]
} satisfies Config;
