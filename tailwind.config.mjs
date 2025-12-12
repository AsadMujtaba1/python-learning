import plugin from './styles/blogTypographyPlugin.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './cost-saver-app/app/**/*.{js,ts,jsx,tsx}',
    './cost-saver-app/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [plugin],
};
