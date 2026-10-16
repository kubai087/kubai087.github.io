export const SITE_URL = "https://www.kubai.design";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const EMAIL = "i@kubai.design";

export const LUMNO = {
  siteZh: "https://lumno.kubai.design/",
  siteEn: "https://lumno.kubai.design/en/",
  appId: "https://lumno.kubai.design#app",
  github: "https://github.com/kubai087/lumno-extension",
  chrome:
    "https://chromewebstore.google.com/detail/lumno-%E5%85%A8%E5%B1%80%E5%BF%AB%E6%8D%B7%E5%91%BD%E4%BB%A4%E6%B5%AE%E5%B1%82/nggfkkbmogmadfoikakkfegkoilfcfao",
} as const;

export type SocialId = "email" | "wechat" | "xiaohongshu" | "x" | "bonjour" | "vibecafe";

export const SOCIAL = {
  x: { url: "https://x.com/kubai087", handle: "@kubai087" },
  xiaohongshu: {
    url: "https://www.xiaohongshu.com/user/profile/5f30130300000000010006eb",
    handle: "枯白啃设计",
  },
  bonjour: { url: "https://bonjour.bio/pvx7hk", handle: "Bonjour!" },
  vibecafe: { url: "https://vibecafe.ai/@kubai087", handle: "@kubai087" },
  github: { url: "https://github.com/kubai087", handle: "kubai087" },
} as const;

/** Profiles that are the same person, for the Person schema's sameAs. */
export const SAME_AS = [
  SOCIAL.x.url,
  SOCIAL.xiaohongshu.url,
  SOCIAL.bonjour.url,
  SOCIAL.vibecafe.url,
  SOCIAL.github.url,
];
