# Design: Sheet v2

Every page is a KiCad drawing sheet. Anything that is a board takes the color of that
board's soldermask. Sheet is the system, soldermask is the color.

Component props and the data attributes the scripts read are documented in
`src/components/README.md`. This file is the why and the rules.

## Two surfaces, one frame

**Frame, on every page.** Outer 1px and inner 2px lines in KiCad component red. The strip
between them carries column references 1 to 6 (top and bottom, aligned to the six-column
content grid) and row letters A, B, C, D (left and right). One letter per real section of
the page, assigned by the page. The strip is always paper with red marks, whatever is
inside it. The frame is in flow, not fixed.

**Paper surface.** Index and text pages: home zones A, B, D, `/work/`, about, log, posts,
404. KiCad schematic palette:

| token | value | use |
|---|---|---|
| paper | `#fbfbf7` | ground |
| ink | `#1c1c1c` | text |
| red | `#8a1c1c` | frame, title block lines |
| green | `#00843d` | links, the active wire, junction dots |
| teal | `#00787a` | field labels, numbers, secondary metadata |
| grid | `#e4e4dc` | hairlines |

Type is B612 everywhere. B612 Mono only for numeric or tabular fields.

**Board surface.** The index panel plate, the home Boards zone, the interior of every
project sheet, next-sheet bands. Ground is the project's `color` from front matter. Marks
in silkscreen white `#f4f1e6` (74% alpha for secondary text, 40% for hairlines). Links
underlined in ENIG gold `#e3c26b`. Title block fills use a deep variant of the mask
(Oklab L x 0.74). Titles on boards are Archivo at width 125, weight 800. Archivo never
appears on paper.

Any subtree becomes a board with `class="board"` and a `--mask` custom property.

**Not used anywhere:** border-radius, shadows, pill buttons, uppercase tracked labels,
middle-dot meta strings, arrows appended to links.

## KiCad vocabulary

Use these where they carry information, nowhere else.

- **Wire and junction dot.** The active index row's rule turns green and runs into the
  panel's vertical bus, with a junction dot at the join. In the Boards zone a silk bus runs
  down the left edge with a dot at each entry; the entry in view gets a gold dot.
- **Title block.** Bottom right of every sheet. Fields: Sheet (URL path), File (the source
  file to edit), Title, For, Date, Type, Link, Id (`n/14`). Board variant adds Mask with a
  swatch and the live hex.
- **Revisions block.** Top right of the home page. Rows are log entries, newest first.
  Rev letters are assigned oldest = A.
- **Status bar.** The Boards zone has a one-row bar pinned to the bottom of the viewport
  while the zone is on screen: Id, Title, For, Date, Mask hex. Same idea as the status bar
  in the KiCad editors.

## Color interpolation

`src/scripts/mask.ts` is the only script that touches color. No dependencies.

- **Scroll.** Inside a `[data-mask-scope]`, each `[data-mask]` element is a color stop. The
  scope's ground is interpolated in Oklab between neighbouring stops while the boundary
  between them crosses the middle 70% of the viewport, then eased toward that target each
  frame (`1 - exp(-dt/140)`). Used by the home Boards zone and by project pages (project
  color into the next sheet's color).
- **Index plate.** When the active row changes, the plate color lerps in Oklab over about
  350 ms and the hex readout counts along. Photo and text swap immediately.
- Interpolating in Oklab instead of sRGB avoids the muddy grey midpoint between, say, green
  and crimson.
- Without JS every board element has its own solid color. With `prefers-reduced-motion`
  the scroll-linked color stays (it follows the scrollbar) but the easing lag is removed.
- No scroll-linked photo movement. It was tried and removed: it read as a portfolio
  template effect, not as a schematic editor.

## Images and video

- No image is ever rendered wider than its intrinsic width. Project figures, index
  plates, boards and next-sheet images share `src/lib/image-widths.ts`: AVIF/WebP
  `srcset`s capped at the source width or 2600px, whichever is smaller. Their fallback
  images and lightbox targets use WebP; social previews use JPEG capped at 1200px.
- The 371px `image` previews are thumbnails only (186 CSS px or less). Panels, boards and
  OG images use `hero`.
- Videos are re-encoded to 720p H.264 in `public/media/` with a poster frame next to the
  project's images. The ffmpeg commands are in the README.

## Accessibility floor

One h1 per page, real tables for tabular data (with explicit roles where `display` is
changed on small screens), `figure`/`figcaption`, skip link, visible focus on both
surfaces, width and height on all media. Silk text is 6.7:1 or better on all 14 mask
colors. Gold does not reach 4.5:1 on every mask, so it is used for underlines, dots and
for hex readouts that sit on the deep mask fill, not for body text.

## Writing

First person. Facts first. Plain words. No em-dashes. No marketing voice. Project
write-ups are one to three sentences: what it is, who it was for, what was notable.
