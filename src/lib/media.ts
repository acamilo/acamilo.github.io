import type { ImageMetadata } from 'astro';

/**
 * Resolves front-matter path strings (e.g. "/assets/img/portfolio/mri/mri-cards-v3.jpg")
 * to real build-time assets under src/assets/img/.
 *
 * Front matter always uses the old Jekyll-era path form "/assets/img/...".
 * That gets prefixed with "/src" to find the matching module in this glob.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/img/**/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

export interface ResolvedImage {
  kind: 'image';
  image: ImageMetadata;
  /** Source path string as given in front matter, for debugging/keys. */
  path: string;
}

export interface ResolvedVideo {
  kind: 'video';
  /** Public path to the re-encoded H.264 video, e.g. "/media/mri/foo.mp4". */
  src: string;
  poster: ImageMetadata;
  path: string;
}

export type ResolvedMedia = ResolvedImage | ResolvedVideo;

export interface GalleryItem {
  media: ResolvedMedia;
  caption?: string;
  /** 1-based figure number. */
  no: number;
}

function lookupImage(assetPath: string, context: string): ImageMetadata {
  const key = `/src${assetPath}`;
  const mod = images[key];
  if (!mod) {
    throw new Error(
      `media.ts: could not resolve image "${assetPath}" (${context}). Looked for "${key}".`,
    );
  }
  return mod.default;
}

/**
 * Resolves a single front-matter path string (image or .mp4) to a ResolvedMedia.
 * `context` is used only to make build failures point at the offending project.
 */
export function resolveMedia(assetPath: string, context: string): ResolvedMedia {
  if (assetPath.toLowerCase().endsWith('.mp4')) {
    const parts = assetPath.split('/').filter(Boolean); // assets, img, portfolio, <dir>, <file>.mp4
    const file = parts.at(-1)!;
    const dir = parts.at(-2)!;
    const base = file.replace(/\.mp4$/i, '');
    const posterPath = `/assets/img/portfolio/${dir}/${base}.poster.jpg`;
    return {
      kind: 'video',
      src: `/media/${dir}/${file}`,
      poster: lookupImage(posterPath, context),
      path: assetPath,
    };
  }
  return {
    kind: 'image',
    image: lookupImage(assetPath, context),
    path: assetPath,
  };
}

/**
 * Resolves a project's gallery array (with optional parallel captions) into
 * numbered figures in order.
 */
export function resolveGallery(
  gallery: string[],
  captions: string[] | undefined,
  context: string,
): GalleryItem[] {
  return gallery.map((assetPath, i) => ({
    media: resolveMedia(assetPath, context),
    caption: captions?.[i],
    no: i + 1,
  }));
}
