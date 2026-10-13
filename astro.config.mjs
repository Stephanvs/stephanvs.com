import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	integrations: [mdx()],
	site: 'https://stephanvs.com',
	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark'
			},
			defaultColor: 'light'
		}
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
