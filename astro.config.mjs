import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	integrations: [mdx()],
	site: 'https://stephanvs.com',
	vite: {
		plugins: [tailwindcss()]
	}
});
