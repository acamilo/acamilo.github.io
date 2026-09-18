# Writing and publishing

Posts and projects are Markdown with YAML front matter. Layouts are automatic.
Use `npm run dev` while editing and open the URL printed by Astro.

## Log entry

Create `src/content/log/YYYY-MM-DD-slug.md`, for example
`src/content/log/2026-09-17-on-the-bench.md`:

```markdown
---
title: "On the bench"
date: 2026-09-17
description: "A short summary for the log index and RSS feed."
---

Write the post here. Headings, links, lists, images, and fenced code blocks work.
```

The example becomes `/log/2026/09/on-the-bench/`. The filename determines the
URL; the front-matter date determines sorting and the displayed date. Keep them
consistent. The log index, revision letters, and RSS feed update automatically.

Every `.md` file directly inside `src/content/log/` is published at build time.
There is no draft flag, future-date scheduling, or `published: false` handling.
Keep unfinished writing outside the content collections until it is ready.
Liquid tags and Jekyll `permalink:` fields are not supported.

For simple inline post images, put a file in `public/media/log/` and reference it
as `![Descriptive alt text](/media/log/my-photo.jpg)`. Files in `public/` are
served unchanged, so resize/compress them before adding them.

## Project

Create `src/content/projects/my-project.md`:

```markdown
---
title: "My project"
client: "Personal"
year: 2026
order: 150
featured: false
image: /assets/img/portfolio/my-project/preview.jpg
hero: /assets/img/portfolio/my-project/board.jpg
hero_alt: "Describe the board shown in the photo."
color: "#0f5735"
description: "One sentence explaining what the project is."
categories: ["Electronics"]
gallery:
  - /assets/img/portfolio/my-project/board.jpg
captions:
  - "Describe what this figure shows."
---

What I built, who it was for, and what was notable about it.
```

This becomes `/work/my-project/`. Put the actual images in
`src/assets/img/portfolio/my-project/`; the `/assets/img/` front-matter paths
are resolved to that source directory during the build.

- `image` is a small thumbnail. `hero` is the large photo.
- Lower `order` values appear first; use gaps to make later insertion easy.
- `featured: true` also puts the project in the home page's Boards section.
- `color` is the board's soldermask color.
- Gallery captions match gallery entries by position.
- Optional `project_url` and `link_label` add an external project link.

See the README for all fields and video preparation commands.

## Before publishing content

```sh
npm run check
npm run build
npm run preview
```

Use the preview URL Astro prints. Review the edited pages at desktop and mobile
widths, including photos, captions, and links. Commit the source changes when ready.
Once the GitHub deployment is connected, pushes to `main` build and publish the site.

## First deployment handoff

The rebuild is prepared for local `main`. At this handoff, this checkout has no
Git remote configured. The intended site URL is `https://acamilo.github.io`.

1. Inspect the existing `acamilo/acamilo.github.io` repository and its default
   branch/history before integrating this new local history.
2. Connect the remote and integrate the rebuild with the chosen remote branch.
3. Set repository **Settings → Pages → Source → GitHub Actions**.
4. Push the prepared `main` branch. The Deploy workflow builds on Node 24,
   runs type/template diagnostics, then publishes through GitHub Pages.
5. Check the workflow result and review the live site, RSS, and project links.

Content to review before the first publication:

- Missing years: `hornbot`, `chdk-ptp-java`, and `wii-chuck`.
- Project mask colors and figure captions; see `docs/TODO.md`.
- Decide whether any of the five media-only projects in `_orphans/` need pages.
