/*
 * Hero particles: the avatar dissolves into a cloud of points that settles back
 * into the cat, scatters around the pointer, and drifts apart as the hero
 * scrolls away.
 *
 * Points are sampled from public/img/avatar-mask.png, where each pixel's flat
 * colour names a part of the cat (scripts/make-avatar-assets.mjs). The body
 * and eye whites take the page's --particle and --particle-paper colours (so a
 * dark page keeps a dark cat with lit eyes); the flower, ears and pupil rims
 * keep their own.
 * Each point is a damped spring toward its target, simulated on the CPU
 * (a few thousand points) and drawn as round sprites. The camera is orthographic in CSS
 * pixels, so targets come straight from the avatar image's box.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

type Options = { hero: HTMLElement; canvas: HTMLCanvasElement; target: HTMLImageElement };

const MASK_URL = "/img/avatar-mask.png";
const STIFFNESS = 34;
const DAMPING = 8;
const POINTER_RADIUS = 110;
const POINTER_FORCE = 5200;
const INTRO_SPREAD = 0.9; // seconds over which points start heading home
const SCATTER_DISTANCE = 300;

const INK = 0;
const PAPER = 5;
const PART_COLORS: Record<number, string> = {
  1: "#f2332e", // flower
  2: "#ffc83a", // flower centre
  3: "#12d3c4", // ears
  4: "#8a72e6", // pupils
};

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.38, d) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function random(seed: number) {
  // Mulberry32: a small seeded generator, so the cat samples the same way on every load.
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function partOf(r: number, g: number, b: number) {
  if (r < 60 && g < 60 && b < 60) return INK;
  if (r > 200 && g > 200 && b < 80) return 2;
  if (r > 200 && g < 80) return 1;
  if (r < 80 && g > 200 && b > 200) return 3;
  if (r < 80 && g < 80 && b > 200) return 4;
  if (r > 200 && g > 200 && b > 200) return PAPER;
  return -1;
}

async function readMask() {
  const img = new Image();
  img.src = MASK_URL;
  await img.decode();
  const size = img.naturalWidth;
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No 2D context");
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, size, size);
  const parts = new Int8Array(size * size).fill(-1);
  for (let i = 0; i < size * size; i++) {
    if (data[i * 4 + 3] >= 128) parts[i] = partOf(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }
  return { size, parts };
}

export async function startHeroParticles({ hero, canvas, target }: Options) {
  const mask = await readMask();
  const rand = random(260626);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  let width = hero.clientWidth;
  let height = hero.clientHeight;

  const targetBox = () => {
    const h = hero.getBoundingClientRect();
    const m = target.getBoundingClientRect();
    return { left: m.left - h.left, top: m.top - h.top, size: m.width };
  };

  // Points sit on a jittered grid over the mask, which reads as an even halftone
  // rather than random grain: a dot every ~3px, so ~2k points on a phone, ~4k on a desktop.
  const box0 = targetBox();
  const spacing = Math.min(3.6, Math.max(2.6, box0.size / 130));
  const cell = spacing / box0.size;
  const homes: number[] = [];
  const kinds: number[] = [];
  for (let gy = cell / 2; gy < 1; gy += cell) {
    for (let gx = cell / 2; gx < 1; gx += cell) {
      const x = gx + (rand() - 0.5) * cell * 0.3;
      const y = gy + (rand() - 0.5) * cell * 0.3;
      const kind = mask.parts[Math.floor(y * mask.size) * mask.size + Math.floor(x * mask.size)];
      if (kind === undefined || kind < 0) continue;
      homes.push(x, y);
      kinds.push(kind);
    }
  }
  const catCount = kinds.length;
  const dustCount = Math.round(catCount * 0.05);
  const count = catCount + dustCount;

  // Where each point lives: 0–1 across the avatar (or across the hero, for dust).
  const home = new Float32Array(count * 2);
  const part = new Int8Array(count);
  home.set(homes);
  part.set(kinds);
  for (let i = catCount; i < count; i++) {
    home[i * 2] = rand();
    home[i * 2 + 1] = rand();
    part[i] = INK;
  }

  const position = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 2);
  const targets = new Float32Array(count * 2);
  const seed = new Float32Array(count);
  const scatter = new Float32Array(count * 2);
  const size = new Float32Array(count);
  const alpha = new Float32Array(count);
  const color = new Float32Array(count * 3);

  // A dot a little smaller than its grid cell leaves a hairline of paper between neighbours.
  const baseSize = spacing * 0.8;
  for (let i = 0; i < count; i++) {
    const dust = i >= catCount;
    seed[i] = rand();
    const angle = rand() * Math.PI * 2;
    scatter[i * 2] = Math.cos(angle);
    scatter[i * 2 + 1] = Math.sin(angle);
    size[i] = dust ? baseSize * (0.5 + rand() * 0.6) : baseSize * (0.9 + rand() * 0.2);
    alpha[i] = dust ? 0.1 + rand() * 0.22 : 0.9 + rand() * 0.1;
  }

  const layoutTargets = () => {
    const box = targetBox();
    for (let i = 0; i < count; i++) {
      if (i < catCount) {
        targets[i * 2] = box.left + home[i * 2] * box.size - width / 2;
        targets[i * 2 + 1] = height / 2 - (box.top + home[i * 2 + 1] * box.size);
      } else {
        targets[i * 2] = (home[i * 2] - 0.5) * width;
        targets[i * 2 + 1] = (home[i * 2 + 1] - 0.5) * height;
      }
    }
  };

  const geometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(position, 3);
  positionAttr.setUsage(DynamicDrawUsage);
  const colorAttr = new BufferAttribute(color, 3);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("aSize", new BufferAttribute(size, 1));
  geometry.setAttribute("aAlpha", new BufferAttribute(alpha, 1));
  geometry.setAttribute("aColor", colorAttr);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uOpacity: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const renderOnce = () => renderer.render(scene, camera);

  const paint = () => {
    const style = getComputedStyle(hero);
    const fixed: Record<number, Color> = Object.fromEntries(
      Object.entries(PART_COLORS).map(([k, v]) => [k, new Color(v)]),
    );
    fixed[INK] = new Color(style.getPropertyValue("--particle").trim() || "#141414");
    fixed[PAPER] = new Color(style.getPropertyValue("--particle-paper").trim() || "#fbfbfb");
    for (let i = 0; i < count; i++) {
      const c = fixed[part[i]];
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }
    colorAttr.needsUpdate = true;
  };
  paint();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    paint();
    renderOnce();
  });

  const resize = () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    layoutTargets();
  };
  resize();
  new ResizeObserver(() => {
    resize();
    renderOnce();
  }).observe(hero);

  // Start as a loose cloud around the avatar, so the image seems to dissolve and resettle.
  const spread = box0.size * 0.22;
  for (let i = 0; i < count; i++) {
    const r = spread * Math.sqrt(-2 * Math.log(rand() + 1e-6));
    const a = rand() * Math.PI * 2;
    position[i * 3] = targets[i * 2] + Math.cos(a) * r;
    position[i * 3 + 1] = targets[i * 2 + 1] + Math.sin(a) * r;
  }

  // Pointer in the same centred, y-up pixel space as the points.
  const pointer = { x: 0, y: 0, active: false };
  const onPointer = (event: PointerEvent) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left - width / 2;
    pointer.y = height / 2 - (event.clientY - rect.top);
    pointer.active = event.clientY >= rect.top && event.clientY <= rect.bottom;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });
  document.addEventListener("pointerleave", () => (pointer.active = false));
  window.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") pointer.active = false;
  });

  let scrollProgress = 0;
  const onScroll = () => {
    const rect = hero.getBoundingClientRect();
    scrollProgress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  let visible = true;
  let running = false;
  let frame = 0;
  let last = 0;
  let clock = 0;

  const step = (dt: number) => {
    clock += dt;
    const t = clock;
    const scatterAmount = scrollProgress * scrollProgress * SCATTER_DISTANCE;
    const radius2 = POINTER_RADIUS * POINTER_RADIUS;
    const damping = Math.exp(-DAMPING * dt);
    material.uniforms.uOpacity.value = Math.min(1, t / 0.4) * (1 - scrollProgress * 0.85);

    for (let i = 0; i < count; i++) {
      const p = i * 3;
      const q = i * 2;
      const s = seed[i];
      const dust = i >= catCount;
      // Each point leaves for home at its own moment, so the cat fills in rather than snapping.
      const wake = Math.min(1, Math.max(0, (t - s * INTRO_SPREAD) / 0.4));

      const drift = dust ? 14 : 0.7;
      let tx = targets[q] + Math.sin(t * 0.55 + s * 40) * drift;
      let ty = targets[q + 1] + Math.cos(t * 0.45 + s * 30) * drift;
      tx += scatter[q] * scatterAmount * (0.4 + s);
      ty += scatter[q + 1] * scatterAmount * (0.4 + s) + scatterAmount * 0.35;

      let vx = velocity[q] + (tx - position[p]) * STIFFNESS * wake * dt;
      let vy = velocity[q + 1] + (ty - position[p + 1]) * STIFFNESS * wake * dt;

      if (pointer.active) {
        const dx = position[p] - pointer.x;
        const dy = position[p + 1] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d / POINTER_RADIUS;
          const push = falloff * falloff * POINTER_FORCE * dt;
          vx += (dx / d) * push;
          vy += (dy / d) * push;
        }
      }

      vx *= damping;
      vy *= damping;
      velocity[q] = vx;
      velocity[q + 1] = vy;
      position[p] += vx * dt;
      position[p + 1] += vy * dt;
    }
    positionAttr.needsUpdate = true;
  };

  const loop = (now: number) => {
    if (!running) return;
    const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
    last = now;
    step(dt);
    renderOnce();
    frame = requestAnimationFrame(loop);
  };

  const sync = () => {
    const shouldRun = visible && document.visibilityState === "visible";
    if (shouldRun && !running) {
      running = true;
      last = 0;
      frame = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(hero);
  document.addEventListener("visibilitychange", sync);

  hero.classList.add("is-live");
  sync();
}
