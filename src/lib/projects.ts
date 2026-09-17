import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { resolveMedia, resolveGallery, type GalleryItem } from './media';

export interface Sheet {
  entry: CollectionEntry<'projects'>;
  /** Slug, e.g. "mri". */
  id: string;
  /** 1-based rank by `order`. */
  no: number;
  total: number;
  /** "/work/<slug>/" */
  url: string;
  hero: ImageMetadata;
  thumb: ImageMetadata;
  color: string;
  /** e.g. "For WPI AIM Lab, 2018." or "Personal project, 2015." or an override. */
  forSentence: string;
  gallery: GalleryItem[];
  prev: Sheet;
  next: Sheet;
}

function buildForSentence(client: string, year: number | undefined, override: string | undefined): string {
  if (override) return override;
  const subject = client === 'Personal' ? 'Personal project' : `For ${client}`;
  return year ? `${subject}, ${year}.` : `${subject}.`;
}

let cache: Sheet[] | null = null;

/**
 * All 14 projects, sorted by front-matter `order`, with sheet numbers, resolved
 * media, and prev/next (next wraps around after the last one).
 *
 * Warns to the console (once) listing any projects missing `year`.
 */
export async function getSheets(): Promise<Sheet[]> {
  if (cache) return cache;

  const entries = await getCollection('projects');
  entries.sort((a, b) => a.data.order - b.data.order);

  const missingYear = entries.filter((e) => e.data.year === undefined).map((e) => e.id);
  if (missingYear.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `[projects] ${missingYear.length} project(s) missing "year": ${missingYear.join(', ')}`,
    );
  }

  const total = entries.length;

  function imageOf(path: string, context: string): ImageMetadata {
    const resolved = resolveMedia(path, context);
    if (resolved.kind !== 'image') {
      throw new Error(`projects.ts: expected an image at "${path}" (${context}), got a video.`);
    }
    return resolved.image;
  }

  const sheets: Sheet[] = entries.map((entry, i) => {
    const context = entry.id;
    return {
      entry,
      id: entry.id,
      no: i + 1,
      total,
      url: `/work/${entry.id}/`,
      hero: imageOf(entry.data.hero, context),
      thumb: imageOf(entry.data.image, context),
      color: entry.data.color,
      forSentence: buildForSentence(entry.data.client, entry.data.year, entry.data.for_sentence),
      gallery: resolveGallery(entry.data.gallery, entry.data.captions, context),
      // prev/next patched below
      prev: undefined as unknown as Sheet,
      next: undefined as unknown as Sheet,
    };
  });

  sheets.forEach((s, i) => {
    s.prev = sheets[(i - 1 + total) % total];
    s.next = sheets[(i + 1) % total];
  });

  cache = sheets;
  return sheets;
}

export async function getSheet(id: string): Promise<Sheet | undefined> {
  const sheets = await getSheets();
  return sheets.find((s) => s.id === id);
}

export interface LogEntry {
  entry: CollectionEntry<'log'>;
  url: string;
  year: string;
  month: string;
  slug: string;
  /** Rev letter, oldest = "A". */
  rev: string;
}

function revLetter(index: number): string {
  // A, B, ... Z, AA, AB, ... (won't be needed at 26 posts, but don't break past it)
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

let logCache: LogEntry[] | null = null;

/** All log posts, newest first. Rev letters assigned oldest = "A". */
export async function getLogEntries(): Promise<LogEntry[]> {
  if (logCache) return logCache;

  const entries = await getCollection('log');
  // Filename convention: YYYY-MM-DD-slug.md
  const withParts = entries.map((entry) => {
    const m = entry.id.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
    if (!m) {
      throw new Error(`log entry "${entry.id}" does not match YYYY-MM-DD-slug.md`);
    }
    const [, year, month, , slug] = m;
    return { entry, year, month, slug };
  });

  // oldest-first for rev assignment
  const oldestFirst = [...withParts].sort(
    (a, b) => a.entry.data.date.getTime() - b.entry.data.date.getTime(),
  );
  const revById = new Map(oldestFirst.map((e, i) => [e.entry.id, revLetter(i)]));

  const newestFirst = [...withParts].sort(
    (a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime(),
  );

  logCache = newestFirst.map(({ entry, year, month, slug }) => ({
    entry,
    url: `/log/${year}/${month}/${slug}/`,
    year,
    month,
    slug,
    rev: revById.get(entry.id)!,
  }));

  return logCache;
}
