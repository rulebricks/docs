/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,jsx,ts,tsx,md,mdx}',
    './pages/*.{js,jsx,ts,tsx,md,mdx}',
    './components/**/*.{js,jsx,ts,tsx,md,mdx}',
    './components/*.{js,jsx,ts,tsx,md,mdx}',
    './pages/_app.{js,jsx,ts,tsx,md,mdx}',
    './theme.config.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
