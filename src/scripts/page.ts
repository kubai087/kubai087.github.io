/*
 * Page behaviour: the sticky header's scrolled state, copy-to-clipboard,
 * the WeChat dialog, scroll reveals, and loading the hero particles once the
 * first paint is done.
 */

export function initPage() {
  initTopbar();
  initCopy();
  initDialogs();
  initReveal();
  scheduleHero();
}

function initTopbar() {
  const bar = document.querySelector<HTMLElement>("[data-topbar]");
  if (!bar) return;
  const update = () => bar.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initCopy() {
  const status = document.querySelector<HTMLElement>("[data-copy-status]");
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    let timer = 0;
    button.addEventListener("click", async () => {
      const text = button.dataset.copy ?? "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // No clipboard access (an old browser or an insecure context): fall back to mail.
        window.location.href = `mailto:${text}`;
        return;
      }
      button.classList.add("is-done");
      if (status) status.textContent = `${button.dataset.copiedLabel ?? ""} ${text}`;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove("is-done");
        if (status) status.textContent = "";
      }, 1800);
    });
  });
}

function initDialogs() {
  document.querySelectorAll<HTMLButtonElement>("[data-open-dialog]").forEach((button) => {
    const dialog = document.getElementById(button.dataset.openDialog ?? "");
    if (!(dialog instanceof HTMLDialogElement)) return;
    button.addEventListener("click", () => dialog.showModal());
    // A click on the backdrop lands on the dialog element itself.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll<HTMLElement>(".reveal");
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("can-reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  items.forEach((item) => observer.observe(item));
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function scheduleHero() {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const canvas = hero?.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  const target = hero?.querySelector<HTMLImageElement>("[data-hero-target]");
  if (!hero || !canvas || !target) return;
  // The avatar image already reads as the design; motion is an enhancement.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!supportsWebGL()) return;

  const start = () =>
    import("./hero-particles")
      .then(({ startHeroParticles }) => startHeroParticles({ hero, canvas, target }))
      .catch(() => hero.classList.remove("is-live"));

  // A busy page may never go idle, so the timeout caps the wait.
  const idle = () =>
    window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 200);
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}
