import type { SocialId } from "./links";

export type Locale = "zh-CN" | "en";

export const LOCALES: Locale[] = ["zh-CN", "en"];

export function localePath(locale: Locale) {
  return locale === "en" ? "/en/" : "/";
}

type Row = { title: string; meta: string; note: string };

type Copy = {
  htmlLang: string;
  ogLocale: string;
  seo: { title: string; description: string; keywords: string[] };
  skip: string;
  home: string;
  language: { switchTo: string; switchLabel: string };
  hero: { name: string; latin: string; role: string; line: string; avatarAlt: string };
  works: { label: string; lumno: Row; x: Row; xiaohongshu: Row };
  contact: {
    label: string;
    items: Record<SocialId, { name: string; note: string; action: string }>;
    copied: string;
    wechatTitle: string;
    wechatNote: string;
    wechatAlt: string;
    close: string;
  };
  footer: { source: string };
};

export const COPY: Record<Locale, Copy> = {
  "zh-CN": {
    htmlLang: "zh-CN",
    ogLocale: "zh_CN",
    seo: {
      title: "枯白啃设计 Kubai 087 · 设计师，Lumno 作者",
      description:
        "枯白啃设计（Kubai 087），UX 设计师，也是动手做产品的 Builder，开源浏览器命令栏 Lumno 的作者。在这里找到我的作品，以及小红书、X、微信、Bonjour! 和 Vibe Cafe 上的我。",
      keywords: ["枯白啃设计", "枯白", "Kubai 087", "kubai087", "UX 设计师", "Builder", "Lumno", "浏览器命令栏"],
    },
    skip: "跳到正文",
    home: "枯白啃设计主页",
    language: { switchTo: "EN", switchLabel: "Switch to English" },
    hero: {
      name: "枯白啃设计",
      latin: "Kubai 087",
      role: "设计师 · Builder",
      line: "设计界面，也亲手把它做出来。",
      avatarAlt: "枯白啃设计的头像：一只头戴红花的黑猫",
    },
    works: {
      label: "作品",
      lumno: { title: "Lumno", meta: "开源浏览器命令栏", note: "一个快捷键，找到标签页、书签和历史记录" },
      x: { title: "X", meta: "@kubai087", note: "Lumno 的开发进度与产品设计随笔" },
      xiaohongshu: { title: "小红书", meta: "枯白啃设计", note: "数码好物、效率工具和设计心得" },
    },
    contact: {
      label: "联系",
      items: {
        email: { name: "邮箱", note: "i@kubai.design", action: "复制邮箱" },
        wechat: { name: "微信", note: "扫码添加", action: "显示微信二维码" },
        xiaohongshu: { name: "小红书", note: "枯白啃设计", action: "打开小红书主页" },
        x: { name: "X", note: "@kubai087", action: "打开 X 主页" },
        bonjour: { name: "Bonjour!", note: "名片页", action: "打开 Bonjour! 主页" },
        vibecafe: { name: "Vibe Cafe", note: "@kubai087", action: "打开 Vibe Cafe 主页" },
      },
      copied: "已复制",
      wechatTitle: "微信扫一扫",
      wechatNote: "加好友时请备注来意",
      wechatAlt: "枯白啃设计的微信二维码",
      close: "关闭",
    },
    footer: { source: "本站源码" },
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    seo: {
      title: "Kubai 087 (枯白啃设计) · Designer and builder of Lumno",
      description:
        "Kubai 087 is a UX designer and builder, and the maker of Lumno, an open-source command bar for your browser. Find my work here, and me on X, Xiaohongshu, WeChat, Bonjour! and Vibe Cafe.",
      keywords: ["Kubai 087", "kubai087", "枯白啃设计", "UX designer", "builder", "Lumno", "browser command bar"],
    },
    skip: "Skip to content",
    home: "Kubai 087 home",
    language: { switchTo: "中文", switchLabel: "切换到简体中文" },
    hero: {
      name: "Kubai 087",
      latin: "枯白啃设计",
      role: "Designer · Builder",
      line: "I design interfaces, then build them myself.",
      avatarAlt: "Kubai 087's avatar: a black cat wearing a red flower",
    },
    works: {
      label: "Work",
      lumno: { title: "Lumno", meta: "Open-source browser command bar", note: "Tabs, bookmarks and history, one shortcut away" },
      x: { title: "X", meta: "@kubai087", note: "Building Lumno in public, plus notes on product design" },
      xiaohongshu: { title: "Xiaohongshu", meta: "枯白啃设计", note: "Gadgets, productivity tools and design notes, in Chinese" },
    },
    contact: {
      label: "Contact",
      items: {
        email: { name: "Email", note: "i@kubai.design", action: "Copy email address" },
        wechat: { name: "WeChat", note: "Scan to add", action: "Show WeChat QR code" },
        xiaohongshu: { name: "Xiaohongshu", note: "枯白啃设计", action: "Open Xiaohongshu profile" },
        x: { name: "X", note: "@kubai087", action: "Open X profile" },
        bonjour: { name: "Bonjour!", note: "Profile card", action: "Open Bonjour! profile" },
        vibecafe: { name: "Vibe Cafe", note: "@kubai087", action: "Open Vibe Cafe profile" },
      },
      copied: "Copied",
      wechatTitle: "Scan with WeChat",
      wechatNote: "Add a note about who you are",
      wechatAlt: "Kubai 087's WeChat QR code",
      close: "Close",
    },
    footer: { source: "Source" },
  },
};
