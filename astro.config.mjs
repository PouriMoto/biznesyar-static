import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('./src/config/site.config.json', import.meta.url), 'utf-8'));

export default defineConfig({
  site: process.env.SITE_URL || site.brand.url,
  trailingSlash: 'always',
  compressHTML: true,
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [mdx(), sitemap({ filter: (page) => !/\/(login|panel|ops)\/?$/.test(page) })],
});
