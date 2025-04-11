import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import layerstack from '@layerstack/tailwind/plugin'

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/svelte-ux/**/*.{svelte,js}',
		'./node_modules/layerchart/**/*.{svelte,js}'
	],

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
	},

	ux: {
		themes: {
			light: {
				primary: colors['orange']['500'],
				'primary-content': 'white',
				secondary: colors['blue']['500'],
				'surface-100': 'white',
				'surface-200': colors['gray']['100'],
				'surface-300': colors['gray']['300'],
				'surface-content': colors['gray']['900'],
				'color-scheme': 'light'
			},
			dark: {
				primary: colors['orange']['500'],
				'primary-content': 'white',
				secondary: colors['blue']['500'],
				'surface-100': colors['zinc']['800'],
				'surface-200': colors['zinc']['900'],
				'surface-300': colors['zinc']['950'],
				'surface-content': colors['zinc']['100'],
				'color-scheme': 'dark'
			}
		}
	},

	plugins: [
		layerstack,  // uses hsl() color space by default. To use oklch(), use: layerstack({ colorSpace: 'oklch' }),
	]
} satisfies Config;
