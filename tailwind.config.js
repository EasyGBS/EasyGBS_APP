/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./pages/**/*.{vue,js}', 'App.vue', './components/**/*.{vue,js}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#1aac19',
					light: '#38b64a', // 可选：更浅
					dark: '#168e13', // 可选：更深
				}
			}
		},
	},
	plugins: [],
	important: true,
}