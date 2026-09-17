/**
 * Justified figure rows, computed at build time.
 *
 * Every figure in a row is drawn at the same height, so a row's width at
 * height 1 is the sum of its aspect ratios. Rows are packed to land near an
 * ideal sum (about 2.6 to 3.2 on desktop), the way a plate of photographs is
 * laid out in a report.
 *
 * Two rules the layout must never break:
 *
 *   - no figure is ever drawn wider than its intrinsic width, so a row's
 *     height is capped at the shortest intrinsic height in it (`maxHeight`)
 *     and a row of small images simply does not reach the container's edge;
 *   - a short trailing row does not stretch to fill the container either: it
 *     keeps `frac` of the width (a lone leftover figure gets `lone`, and the
 *     page sets its caption beside it instead of under it).
 *
 * Pure: no DOM, no Astro. Safe to unit test and to call in front matter.
 */

import type { ResolvedMedia } from '../../lib/media';

export interface Packable {
  /** intrinsic width / intrinsic height */
  ar: number;
  /** intrinsic width in px: the cap on how wide this figure may be drawn */
  natWidth: number;
}

/** One numbered figure on a project sheet. */
export interface ProjectFigure extends Packable {
  media: ResolvedMedia;
  /** 1-based figure number in display order ("Fig. 3") */
  no: number;
  caption?: string;
  alt: string;
  natHeight: number;
  /** true for the project's hero photo, which always comes first */
  hero: boolean;
}

/**
 * Gallery order for a sheet: the hero first (it is usually in the gallery
 * already, and is never repeated), then the rest in front-matter order.
 * Figures are renumbered in display order.
 */
export function orderFigures<T extends { media: ResolvedMedia }>(
  items: readonly T[],
  heroPath: string,
): T[] {
  const heroAt = items.findIndex((i) => i.media.kind === 'image' && i.media.path === heroPath);
  if (heroAt <= 0) return [...items];
  return [items[heroAt], ...items.filter((_, i) => i !== heroAt)];
}

export interface PackedRow<T extends Packable> {
  items: T[];
  /** sum of the row's aspect ratios: its width at height 1 */
  sumAr: number;
  /** the tallest this row can be without upscaling anything, in px */
  maxHeight: number;
  /** share of the container this row may use (1 for a full row) */
  frac: number;
  /** a single leftover figure: intrinsic width, caption beside it */
  lone: boolean;
}

export interface PackOptions {
  /** aspect sum a row aims for */
  ideal?: number;
  /** below this a trailing row counts as short and does not stretch */
  min?: number;
  /** never put more than this many figures side by side */
  maxPerRow?: number;
}

export function packRows<T extends Packable>(
  items: readonly T[],
  { ideal = 2.9, min = 2.6, maxPerRow = 4 }: PackOptions = {},
): PackedRow<T>[] {
  const rows: T[][] = [];
  let current: T[] = [];
  let sum = 0;

  const close = (): void => {
    if (current.length) rows.push(current);
    current = [];
    sum = 0;
  };

  for (const item of items) {
    const next = sum + item.ar;
    // Close before adding when the row is full, or when adding would take the
    // row further from the ideal sum than stopping here does.
    if (
      current.length &&
      (current.length >= maxPerRow ||
        (next > ideal && Math.abs(next - ideal) > Math.abs(sum - ideal)))
    ) {
      close();
    }
    current.push(item);
    sum += item.ar;
    if (sum >= ideal) close();
  }
  close();

  return rows.map((row) => {
    const sumAr = row.reduce((t, i) => t + i.ar, 0);
    // height at which the narrowest figure reaches its intrinsic width
    const maxHeight = Math.floor(Math.min(...row.map((i) => i.natWidth / i.ar)));
    return {
      items: row,
      sumAr,
      maxHeight,
      frac: Math.min(1, sumAr / min),
      lone: row.length === 1 && sumAr < min,
    };
  });
}
