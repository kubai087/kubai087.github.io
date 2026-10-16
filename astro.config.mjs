import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.kubai.design",
  trailingSlash: "ignore",
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN", "en"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Pages only deploy when they change, so the build time is their last edit.
      lastmod: new Date(),
      filter: (page) => !page.includes("/404"),
      i18n: {
        defaultLocale: "zh-CN",
        locales: { "zh-CN": "zh-CN", en: "en" },
      },
    }),
  ],
});
