// @ts-check
import { defineConfig, envField } from "astro/config";
import vue from "@astrojs/vue";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  adapter: netlify(),
  output: "server",
  env: {
    schema: {
      BASE_URL: envField.string({ context: "server", access: "public" }),
      MOCK_URL: envField.string({ context: "server", access: "public" }),
    },
  },
});