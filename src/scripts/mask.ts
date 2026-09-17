/**
 * Soldermask color engine.
 *
 * Two behaviours, both driven by the same Oklab interpolation:
 *
 *   initScrollMask(scope)  scroll-linked ground color for a board zone. Every
 *                          descendant carrying `data-mask="#rrggbb"` is a color
 *                          stop; the scope's own `--mask` / `--mask-deep` are
 *                          interpolated between neighbouring stops as the
 *                          boundary crosses the middle 70% of the viewport,
 *                          then eased toward that target each frame.
 *   initPlateLerp(index)   time-based (350 ms) lerp for the index plate, driven
 *                          by pointer/focus on the index rows.
 *
 * Both write on the element you hand them, never on :root, so a page can have
 * several independent boards.
 *
 * Contract (data attributes) is documented in src/components/README.md.
 */

export type Lab = [number, number, number];

const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** "#0f5735" (or "0f5735") to Oklab. */
export function hexToLab(hex: string): Lab {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255)) as Lab;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Oklab to "#rrggbb", clipped into sRGB. */
export function labToHex([L, a, b]: Lab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(clamp(toGamma(clamp(v))) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export const mixLab = (p: Lab, q: Lab, t: number): Lab =>
  [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t] as Lab;

/** Title-block fill: the mask at 74% lightness, slightly desaturated. */
export const deepLab = ([L, a, b]: Lab): Lab => [L * 0.74, a * 0.9, b * 0.9];

/** Same, hex in and hex out. Safe to call at build time. */
export const deepMask = (hex: string): string => labToHex(deepLab(hexToLab(hex)));

function paint(el: HTMLElement, lab: Lab): string {
  const hex = labToHex(lab);
  el.style.setProperty('--mask', hex);
  el.style.setProperty('--mask-deep', labToHex(deepLab(lab)));
  return hex;
}

const reduced = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* scroll-driven ground                                                */
/* ------------------------------------------------------------------ */

export function initScrollMask(scope: HTMLElement): void {
  const stops = [...scope.querySelectorAll<HTMLElement>('[data-mask]')];
  if (!stops.length) return;

  scope.classList.add('mask-js');

  const labs = stops.map((s) => hexToLab(s.dataset.mask!));
  const readouts = [...scope.querySelectorAll<HTMLElement>('[data-hex]')];
  const fields = new Map<string, HTMLElement>(
    [...scope.querySelectorAll<HTMLElement>('[data-f]')].map((el) => [el.dataset.f!, el]),
  );

  let tops: number[] = [];
  const measure = (): void => {
    tops = stops.map((el) => el.getBoundingClientRect().top + scrollY);
  };

  let cur: Lab | null = null;
  let active = -1;
  let lastHex = '';
  let last = 0;
  let running = false;

  const frame = (now: number): void => {
    const dt = Math.min(64, now - last || 16);
    last = now;
    const slow = reduced();
    const k = slow ? 1 : 1 - Math.exp(-dt / 140);
    const y = scrollY + innerHeight / 2;

    // a transition runs while the boundary between two stops crosses the middle 70%
    const span = innerHeight * 0.35;
    let pos = 0;
    for (let n = 1; n < tops.length; n++) pos += smooth(0, 1, (y - tops[n] + span) / (2 * span));
    const i = Math.floor(pos);
    const f = pos - i;
    const target: Lab = labs[i + 1] ? mixLab(labs[i], labs[i + 1], f) : labs[i];
    cur = cur ? mixLab(cur, target, k) : target;

    const hex = labToHex(cur);
    if (hex !== lastHex) {
      lastHex = paint(scope, cur);
      readouts.forEach((el) => {
        el.textContent = hex.toUpperCase();
      });
    }

    const nowActive = Math.round(pos);
    if (nowActive !== active) {
      active = nowActive;
      const stop = stops[active];
      stops.forEach((s, n) => s.classList.toggle('is-current', n === active));
      fields.forEach((el, key) => {
        el.textContent = stop.dataset[key] ?? '';
      });
    }

    const settled = Math.hypot(target[0] - cur[0], target[1] - cur[1], target[2] - cur[2]) < 0.0005;

    if (settled) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  };

  const kick = (): void => {
    if (!running) {
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    }
  };
  const remeasure = (): void => {
    measure();
    kick();
  };

  measure();
  kick();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
  if (document.fonts) void document.fonts.ready.then(remeasure);
  scope.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', remeasure, { once: true });
  });
}

/* ------------------------------------------------------------------ */
/* index plate                                                         */
/* ------------------------------------------------------------------ */

export function initPlateLerp(index: HTMLElement): void {
  const plate = index.querySelector<HTMLElement>('[data-plate]');
  const rows = [...index.querySelectorAll<HTMLElement>('[data-row]')];
  const items = [...index.querySelectorAll<HTMLElement>('[data-plate-item]')];
  if (!plate || !rows.length || rows.length !== items.length) return;

  index.classList.add('mask-js');

  const labs = rows.map((r) => hexToLab(r.dataset.mask!));
  const readouts = [...plate.querySelectorAll<HTMLElement>('[data-hex]')];

  const DURATION = 350;
  let cur: Lab = labs[0];
  let from: Lab = labs[0];
  let to: Lab = labs[0];
  let start = 0;
  let raf = 0;

  const apply = (lab: Lab): void => {
    cur = lab;
    const hex = paint(plate, lab);
    readouts.forEach((el) => {
      el.textContent = hex.toUpperCase();
    });
  };

  const step = (now: number): void => {
    const t = clamp((now - start) / DURATION);
    const eased = 1 - (1 - t) ** 3; // ease-out cubic
    apply(mixLab(from, to, eased));
    if (t < 1) raf = requestAnimationFrame(step);
  };

  const show = (i: number): void => {
    rows.forEach((r, n) => r.classList.toggle('is-active', n === i));
    items.forEach((el, n) => {
      el.hidden = n !== i;
    });
    cancelAnimationFrame(raf);
    if (reduced()) {
      apply(labs[i]);
      return;
    }
    from = cur;
    to = labs[i];
    start = performance.now();
    raf = requestAnimationFrame(step);
  };

  apply(labs[0]);
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => show(i));
    row.addEventListener('focusin', () => show(i));
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a')) return;
      row.querySelector('a')?.click();
    });
  });
}

/** Wires up every board zone and index on the page. Called from the layout. */
export function initMasks(doc: ParentNode = document): void {
  doc.querySelectorAll<HTMLElement>('[data-mask-scope]').forEach(initScrollMask);
  doc.querySelectorAll<HTMLElement>('[data-index]').forEach(initPlateLerp);
}
