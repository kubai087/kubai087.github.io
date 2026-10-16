# kubai.design

Kubai (枯白)'s personal site: https://www.kubai.design

Built with Astro and three.js, deployed to GitHub Pages by `.github/workflows/deploy.yml`.

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # static site in dist/
```

- Copy for both languages lives in `src/lib/content.ts`; Chinese is at `/`, English at `/en/`.
- Social links are in `src/lib/links.ts`.
- The hero's particle cat is drawn by `src/scripts/hero-particles.ts`, loaded after first paint and skipped under `prefers-reduced-motion`. It samples `public/img/avatar-mask.png`.
- After changing the avatar (`src/assets/avatar-source.webp`), run `node scripts/make-avatar-assets.mjs` to rebuild the mask, favicon, touch icon and `public/avatar.png`.
