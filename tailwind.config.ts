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
				'mango': 'url($lib/assets/2021/mango.png)',
				'himbeer' : 'url($lib/assets/2021/himbeer.png)',
				'zitrone' : 'url($lib/assets/2021/zitrone.png)',
				'karamell23' : 'url($lib/assets/2023/karamell.png)',
				'zitrone22' : 'url($lib/assets/2022/zitrone.png)',
			}
		}
	},

	plugins: [forms, daisyui]
} satisfies Config;
