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
- **"Rebuilt the site" log post** still says the site is Jekyll, plain CSS, no JavaScript,
  and follows the system light or dark setting. None of that is true now.
- **Five projects with media but no page:** dice-roller, gameboy, fig-elevation,
  kilian-box, supercon-2019. Their files are in `_orphans/` (gitignored, 211 MB, mostly
  two dice-roller videos). Write pages or leave them out.
- **Dark scheme.** The paper surface is light only. The old site followed the system
  setting. Decide whether a dark paper variant is wanted.
- **Push.** Repo Settings > Pages > Source has to be set to "GitHub Actions" before the
  workflow in `.github/workflows/deploy.yml` can deploy. The existing `acamilo.github.io`
  repo holds the old Hugo build; decide whether to replace its history or push this as a
  new default branch.

## Design

- **Motion.** The scroll-linked photo drift was removed. Idea to try instead, in keeping
  with the schematic editor: a KiCad-style cursor that moves to a sheet and double-clicks
  to enter it (that is how hierarchical sheets are opened in KiCad), either once on the
  home page as a demonstration of the index or as the page transition into a project. A
  full-window crosshair with an X/Y readout in the Boards status bar is a related option.
- Boards zone entries with landscape photos have a lot of empty ground under the text.
- About page title block has an empty cell at top right (no Id field on that page).
- Log index on small screens hides the Rev and Date columns; the date should stay. Its
  title block Id reads "1/1", which means nothing.
- Code blocks in posts: the Shiki theme is overridden locally with `!important` in the
  post page. Set a light theme in `astro.config.mjs` instead.
- View transitions: carry the board color from the index plate into the project sheet.

## Build

- A few photo originals around 4 MB are copied into `dist/` next to their resized
  versions. Check what links to them (the lightbox target should be a generated image
  capped around 2600px, not the original).
- `og:image` should be a generated 1200px-wide image from `hero`.
- `_site/` and `.jekyll-cache/` are root-owned leftovers from the Docker Jekyll preview.
  `sudo rm -rf _site .jekyll-cache` removes them. Both are gitignored.
- Link check over `dist/` before the first push.

## Project page

- The last polish round was cut short: head and figure spacing had no final pass.
- Figure rows that cannot fill the width without upscaling leave a gap at the right
  (for example the two microscope shots on `mri`). Consider placing the caption beside
  short rows instead of under them.
- `src/components/Media.astro` is currently unused (the project page has its own
  `Figure.astro`). Remove it or fold the two together.
- `Sheet.astro` cannot forward `data-mask-scope`, so the project page wraps its zones in
  its own `board` div. Add a prop if more pages need it.
