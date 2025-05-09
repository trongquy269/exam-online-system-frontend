/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				Montserrat: ['Montserrat'],
			},
			keyframes: {
				shake: {
					'10%, 90%': { transform: 'translateX(-1px)' },
					'20%, 80%': { transform: 'translateX(2px)' },
					'30%, 50%, 70%': { transform: 'translateX(-4px)' },
					'40%, 60%': { transform: 'translateX(4px)' },
				},
			},
			animation: {
				shake: 'shake 0.7s ease-in-out',
			},
		},
	},
	plugins: [],
};
