import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mauritsajournal.github.io',
  base: '/artemis-dashboard',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
