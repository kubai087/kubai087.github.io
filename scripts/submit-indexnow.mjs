// Pings IndexNow (Bing, Yandex, Naver, Seznam) with every URL in the built
// sitemap. The site is two pages and only deploys when it changes, so each
// deploy resubmits both.
//
// Usage: node scripts/submit-indexnow.mjs dist/sitemap-0.xml
import fs from "node:fs";

const SITE_URL = "https://www.kubai.design";
const INDEXNOW_KEY = "4869cb80b6de576eb88f2159a2b4f48a"; // public/<key>.txt
const ENDPOINT = "https://api.indexnow.org/indexnow";

const xml = fs.readFileSync(process.argv[2], "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc.trim());
if (!urls.length) throw new Error(`No URLs found in ${process.argv[2]}`);

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }),
});

// 200 = accepted, 202 = accepted while the key is still being verified.
if (response.status !== 200 && response.status !== 202) {
  throw new Error(`IndexNow responded ${response.status}: ${await response.text()}`);
}
console.log(`Submitted ${urls.length} URL(s) to IndexNow (${response.status}):\n${urls.join("\n")}`);
