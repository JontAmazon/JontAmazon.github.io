// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://jontamazon.github.io',
  // base: 'my-repo' // JontAmazon.github.io?
  base: '/', // JontAmazon.github.io?
  vite: {
    plugins: [tailwindcss()],
  },
});
