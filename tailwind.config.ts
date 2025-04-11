import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/layerchart/**/*.{svelte,js}'],

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
				mango: 'url($lib/assets/2021/mango_medium.png)',
				himbeer: 'url($lib/assets/2021/himbeer_medium.png)',
				zitrone: 'url($lib/assets/2021/zitrone_medium.png)',
				karamell23: 'url($lib/assets/2023/karamell_medium.png)',
				zitrone22: 'url($lib/assets/2022/zitrone_medium.png)',
				karlsruhe24: 'url($lib/assets/2024/karlsruhe_hd.png)'
			}
		}
	}
} satisfies Config;
