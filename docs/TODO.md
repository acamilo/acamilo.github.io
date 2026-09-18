# Open items

State as of 2026-09-17. Nothing has been pushed; the live site at acamilo.github.io is
still the 2021 one.

## Needs Alex

- **Years** for `hornbot`, `chdk-ptp-java`, `wii-chuck`. The build warns about them.
- **Mask colors.** The first six (`mri`, `moon-badge`, `ohs-2020`, `zen-driver`,
  `thermal-target`, `samplereturn`) were sampled from the photos. The other eight are
  guesses from thumbnails. Fix them in each project's `color:`.
- **Captions.** Only `mri` has figure captions, and they were written from what is visible
  in the photos. Check them. Add `captions:` to other projects as wanted.
- **Five projects with media but no page:** dice-roller, gameboy, fig-elevation,
  kilian-box, supercon-2019. Their files are in `_orphans/` (gitignored, 211 MB, mostly
  two dice-roller videos). Write pages or leave them out.
- **Dark scheme.** The paper surface is light only. The old site followed the system
  setting. Decide whether a dark paper variant is wanted.
- **Push.** Local `main` is prepared for content work. No remote is configured.
  Inspect and integrate with the existing `acamilo.github.io` repository history, then
  set Settings > Pages > Source to "GitHub Actions" before publishing. See
  `docs/CONTENT.md` for the deployment handoff.

## Design

- **Motion.** The scroll-linked photo drift was removed. Idea to try instead, in keeping
  with the schematic editor: a KiCad-style cursor that moves to a sheet and double-clicks
  to enter it (that is how hierarchical sheets are opened in KiCad), either once on the
  home page as a demonstration of the index or as the page transition into a project. A
  full-window crosshair with an X/Y readout in the Boards status bar is a related option.
- Boards zone entries with landscape photos have a lot of empty ground under the text.
- View transitions: carry the board color from the index plate into the project sheet.

## Build

- Astro still emits the roughly 4 MB `2021-06-20` original into `dist/_astro/`,
  despite no reference in generated HTML, JS, CSS or XML. Investigate asset emission.
  Responsive project photos and lightbox targets are now capped at 2600px; photo
  fallbacks use WebP. Social images are generated JPEGs capped at 1200px.
- `_site/` and `.jekyll-cache/` are root-owned leftovers from the Docker Jekyll preview.
  `sudo rm -rf _site .jekyll-cache` removes them. Both are gitignored.
- Re-run the local link check before the first push (passed on 2026-09-17).

## Verified polish pass, 2026-09-17

- Home portrait sits to the left of the title and introduction, spanning both on desktop.
- Deployment requires a successful type/template check as well as the build.
- About and log title blocks fill the title row when no Id or adjacent Date is present.
- Mobile log index keeps Date visible; removed its meaningless `1/1` Id.
- Markdown uses Shiki's `github-light` theme, with the token-color overrides removed.
- Shared responsive image widths cap delivery at 2600px without upscaling.
- `npm run check` and `npm run build` pass. Existing diagnostics: deprecated `z`
  re-export hints, plus the three missing project years listed above.
- Browser checks: all 20 HTML pages, 82 local URLs, representative layouts at
  375/768/1440px with no horizontal overflow, mobile dates, title-block span,
  lightbox opening/next/Escape, and no JavaScript errors.
- Preview available locally at `http://127.0.0.1:4176` during this session.

## Project page

- The last polish round was cut short: head and figure spacing had no final pass.
- Figure rows that cannot fill the width without upscaling leave a gap at the right
  (for example the two microscope shots on `mri`). Consider placing the caption beside
  short rows instead of under them.
- `src/components/Media.astro` is currently unused (the project page has its own
  `Figure.astro`). Remove it or fold the two together.
- `Sheet.astro` cannot forward `data-mask-scope`, so the project page wraps its zones in
  its own `board` div. Add a prop if more pages need it.
