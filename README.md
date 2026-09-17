# acamilo.github.io

Personal site and log for Alex Camilo. Built with Astro, static output, deployed by
GitHub Pages through GitHub Actions.

## Run it

Requires Node 22 (see `.nvmrc`; CI uses Node 24).

```sh
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # static output to dist/
npm run preview   # serve the built dist/
npm run check     # astro check, type and template diagnostics
```

## Add a log entry

Create `src/content/log/YYYY-MM-DD-slug.md`. The filename sets the URL:
`/log/YYYY/MM/slug/`.

```yaml
---
title: "…"
date: YYYY-MM-DD
description: "One sentence."
---

Post body in Markdown.
```

## Add a project

Create `src/content/projects/slug.md`. The URL is `/work/slug/`.

| field | type | notes |
|---|---|---|
| `title` | string | |
| `client` | string | shown as "For" |
| `year` | number, optional | omit if unknown; the build warns about projects with no year |
| `order` | number | sort key; lower sorts first |
| `featured` | boolean | default `false` |
| `image` | string | small existing preview image, used only as a thumbnail |
| `hero` | string | large photo used on index panels and OG image |
| `color` | string | hex soldermask color for this project's board surface |
| `project_url` | string | link target; leave empty for none |
| `link_label` | string, optional | link text for `project_url`; omit if `project_url` is empty |
| `categories` | string[] | |
| `description` | string | one sentence, used in lists and meta tags, not the page body |
| `gallery` | string[] | image and `.mp4` paths, in display order |
| `captions` | string[], optional | parallel to `gallery`, one string per item |
| `for_sentence` | string, optional | overrides the generated "For `client`, `year`." line |
| `hero_alt` | string, optional | alt text for the hero image |

All paths use the form `/assets/img/portfolio/<dir>/<file>`; they resolve against
`src/assets/img/`. The page body (the Markdown after the front matter) is the
project write-up; `description` is separate and only shows in lists and meta tags.

## Videos

Re-encoded video files live in `public/media/<project-dir>/<name>.mp4` and are
referenced from a project's `gallery` with a path like
`/assets/img/portfolio/<dir>/<name>.mp4` (matching the image paths above);
`src/lib/media.ts` rewrites that to `/media/<dir>/<name>.mp4` at build time and
pairs it with a poster image at `src/assets/img/portfolio/<dir>/<name>.poster.jpg`.

Re-encode a source video with:

```sh
ffmpeg -i in.mp4 \
  -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2" \
  -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 96k \
  public/media/<dir>/<name>.mp4
```

Generate its poster frame with:

```sh
ffmpeg -i public/media/<dir>/<name>.mp4 -ss 1 -frames:v 1 -q:v 3 \
  src/assets/img/portfolio/<dir>/<name>.poster.jpg
```

Original, un-re-encoded videos and unused image directories are kept out of the
site under `_orphans/` (gitignored, not published).

## Deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, or on
manual dispatch. Repo Settings > Pages > Source must be set to "GitHub Actions"
for this to work. Nothing is pushed or deployed automatically from a local
checkout.

## Structure

| Path | What |
|---|---|
| `astro.config.mjs` | Astro config: site URL, trailing slashes, sitemap |
| `src/content.config.ts` | content collection schemas (`projects`, `log`) |
| `src/content/projects/` | one Markdown file per project |
| `src/content/log/` | log entries |
| `src/lib/projects.ts` | sorted project list, sheet numbers, prev/next |
| `src/lib/media.ts` | resolves front-matter image/video paths to built assets |
| `src/layouts/`, `src/components/` | shared layout and page components |
| `src/pages/` | routes |
| `src/assets/img/` | project and about-page images |
| `public/media/` | re-encoded project videos |
| `public/robots.txt`, `public/favicon.svg` | static files served as-is |
| `.corpus/` | local-only, **gitignored**, never published |

## Docs

- `docs/DESIGN.md`: the design system (paper and board surfaces, KiCad vocabulary, color interpolation) and the rules behind it.
- `docs/TODO.md`: open items, including what has to happen before the first push.
- `src/components/README.md`: component props and the data attributes `src/scripts/mask.ts` reads.
