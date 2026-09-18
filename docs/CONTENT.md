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

The rebuild is on local `main`, with `origin` pointing to
`git@github.com:acamilo/acamilo.github.io.git`. The old `origin/master` history
(through `5c6e8ae`) is preserved as a parent of the integration merge. That merge
keeps the Astro source tree, rather than bringing the old generated Hugo files
back into the current checkout. No force push is needed.

GitHub still uses `master` as its default branch and legacy Pages source. Actions
are enabled and the `github-pages` environment has no branch restrictions.
Nothing has been pushed or changed in the remote settings during preparation.

When ready to publish:

1. Fetch `origin` again and check for any changes since the integration.
2. Set repository **Settings → Pages → Source → GitHub Actions**.
3. Run `git push -u origin main`. This creates remote `main` and triggers Deploy.
4. Set the repository's default branch to `main`.
5. Check the workflow result and review `https://acamilo.github.io`, RSS, and
   project links. The workflow builds on Node 24, runs type/template diagnostics,
   then publishes through GitHub Pages.

The GitHub CLI can perform the settings changes and monitor deployment:

```sh
gh api --method PUT repos/acamilo/acamilo.github.io/pages -f build_type=workflow
git push -u origin main
gh repo edit acamilo/acamilo.github.io --default-branch main
gh run list --repo acamilo/acamilo.github.io --workflow deploy.yml --branch main
```

Keep remote `master` available as the old published version until the new site
has been reviewed.

Content to review before the first publication:

- Missing years: `hornbot`, `chdk-ptp-java`, and `wii-chuck`.
- Project mask colors and figure captions; see `docs/TODO.md`.
- Decide whether any of the five media-only projects in `_orphans/` need pages.
