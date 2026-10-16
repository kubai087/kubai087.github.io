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
  works: { label: string; lumno: Row };
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
      title: "枯白啃设计 Kubai 087 · App 图标设计师，Lumno 作者",
      description:
        "枯白啃设计（Kubai 087），App 图标设计师，也在做自己的产品，比如开源浏览器命令栏 Lumno。小红书上有我的 App 图标作品和教程，也可以在 X、微信、Bonjour! 和 Vibe Cafe 找到我。",
      keywords: ["枯白啃设计", "枯白", "Kubai 087", "kubai087", "App 图标设计", "图标设计师", "图标设计教程", "Lumno"],
    },
    skip: "跳到正文",
    home: "枯白啃设计主页",
    language: { switchTo: "EN", switchLabel: "Switch to English" },
    hero: {
      name: "枯白啃设计",
      latin: "Kubai 087",
      role: "Icon Designer · Builder",
      line: "图标设计师，也在做自己的产品。",
      avatarAlt: "枯白啃设计的头像：一只头戴红花的黑猫",
    },
    works: {
      label: "作品",
      lumno: { title: "Lumno", meta: "开源浏览器命令栏", note: "一个快捷键，找到标签页、书签和历史记录" },
    },
    contact: {
      label: "联系",
      items: {
        email: { name: "邮箱", note: "i@kubai.design", action: "复制邮箱" },
        wechat: { name: "微信", note: "扫码添加", action: "显示微信二维码" },
        xiaohongshu: { name: "小红书", note: "App 图标作品和教程", action: "打开小红书主页" },
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
      title: "Kubai 087 (枯白啃设计) · App icon designer, maker of Lumno",
      description:
        "I'm Kubai 087, an app icon designer who also builds my own products, like Lumno, an open-source command bar for your browser. My app icon work and tutorials live on Xiaohongshu; you can also find me on X, WeChat, Bonjour! and Vibe Cafe.",
      keywords: ["Kubai 087", "kubai087", "枯白啃设计", "app icon designer", "app icon design", "icon design tutorials", "Lumno"],
    },
    skip: "Skip to content",
    home: "Kubai 087 home",
    language: { switchTo: "中文", switchLabel: "切换到简体中文" },
    hero: {
      name: "Kubai 087",
      latin: "枯白啃设计",
      role: "Icon Designer · Builder",
      line: "An icon designer, also building my own products.",
      avatarAlt: "Kubai 087's avatar: a black cat wearing a red flower",
    },
    works: {
      label: "Work",
      lumno: { title: "Lumno", meta: "Open-source browser command bar", note: "Tabs, bookmarks and history, one shortcut away" },
    },
    contact: {
      label: "Contact",
      items: {
        email: { name: "Email", note: "i@kubai.design", action: "Copy email address" },
        wechat: { name: "WeChat", note: "Scan to add", action: "Show WeChat QR code" },
        xiaohongshu: { name: "Xiaohongshu", note: "App icon work and tutorials", action: "Open Xiaohongshu profile" },
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
