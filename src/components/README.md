# Shared design layer

"Sheet v2": every page is a drawing sheet (paper frame, red lines, zone
references, KiCad title block). Anything that *is* a board (the index plate, the
home Boards zone, a project sheet interior) becomes a **board surface**: a
soldermask ground with silkscreen marks.

Read `mockups/BUILD_SPEC.md` sections 5.1 to 5.3 for the intent. This file is
the API.

## 1. Surfaces and tokens (`src/styles/global.css`)

Components never name a palette color directly. They use the **surface tokens**,
and the surface decides what those are:

| token | paper | board |
|---|---|---|
| `--bg` | `--paper` `#fbfbf7` | `--mask` (the project color) |
| `--fg` | `--ink` `#1c1c1c` | `--silk` `#f4f1e6` |
| `--fg-dim` | `--ink-dim` `#4a4a46` | `--silk-dim` (silk at 74%) |
| `--rule` | `--grid` `#e4e4dc` | `--silk-line` (silk at 40%) |
| `--label` | `--teal` `#00787a` | `--silk-dim` |
| `--mark` (link underline, wires) | `--green` `#00843d` | `--gold` `#e3c26b` |
| `--focus` | `--green` | `--silk` |

Frame red `--red` `#8a1c1c` is never swapped: the frame strip is paper with red
marks on every page.

**Making something a board:** give it `class="board"` (or
`data-surface="board"`) and set `--mask` plus `--mask-deep`:

```astro
<div class="board" style={`--mask:${color};--mask-deep:${deepMask(color)}`}>
```

`deepMask(hex)` is exported from `src/scripts/mask.ts` and is safe to call in
Astro front matter (Oklab lightness x 0.74). `--mask-deep` is the fill for title
blocks and the plate's legend strip. Any subtree can be a board; nothing is
global, so a page can hold several at once.

Type: B612 (`--font-text`) everywhere, B612 Mono (`--font-num`) for numeric and
tabular fields. **Archivo (`--font-display`) only on boards** through the
`.display` helper class (`font-stretch: 125%; font-weight: 800`). Never on
paper.

House rules, enforced by eye: no border-radius, no shadows, no pills, no
uppercase tracked labels, no middle-dot meta strings, no arrows on links.

### Contrast (measured)

Silk on all 14 mask colors: 6.73:1 (wii-chuck) to 15.38:1 (moon-badge).
Silk-dim (74%) on the same: 4.51:1 (bstar) to 8.86:1. Gold as *text* on a raw
mask drops to 4.42:1 on wii-chuck, so gold is used for underlines, the junction
dot, and hex readouts that sit on `--mask-deep` (>= 7.1:1 everywhere). On a
board, `a:hover` keeps silk text and thickens the gold underline instead of
turning the text gold. Keep that rule if you add board links.

## 2. Layout: `layouts/Sheet.astro`

```astro
<Sheet title="..." description="..." ogImage={sheet.hero}
       surface="board" mask={sheet.color} bare={false} class="">
```

Draws the outer 1px line, the paper strip with column references 1-6 (top and
bottom, aligned to the `.six` grid) and the inner 2px line, plus all the
head/SEO/OG tags. `surface="board"` + `mask` turns only the **interior** into a
board; the strip stays paper with red marks.

It also loads `src/scripts/mask.ts` once per page and calls `initMasks()`, which
wires every `[data-mask-scope]` and every `[data-index]` on the page. You do not
need your own script.

Zone letters, the `.six` six-column grid, `.head`, `.name`, `.section-title`,
`.count`, `.lead`, `.prose`, `.visually-hidden` and the skip link all live in
`global.css`.

## 3. Components

### `Zone.astro` - one lettered section

```astro
<Zone letter="B" as="section" first={false} board={false} mask="#0f5735"
      class="" aria-labelledby="...">
```

Letters are assigned **by the page**, one per real section, starting at A, and
they show in the frame strip on both sides. `as` picks the tag
(`section`/`header`/`footer`/`div`/...). `first` drops the top rule. `board` +
`mask` makes the whole zone a board. Any other attribute (`id`, `aria-*`,
`data-*`) is forwarded to the element.

Convention on the pages that exist:

| page | A | B | C | D |
|---|---|---|---|---|
| `/` | head, intro, revisions | sheet index | boards (board surface) | title block |
| `/work/` | head | sheet index | title block | |
| project (yours) | head + title block | figures | next sheet | contact |

### `Nav.astro`

```astro
<Nav current="work" brand="Alex Camilo" />
```

`current` is `about` / `work` / `log` or omitted; `brand` adds a link back to
`/` before the links (use it on any page whose h1 is not the name). Works on
both surfaces.

### `TitleBlock.astro`

```astro
<TitleBlock sheet="/work/mri/" file="src/content/projects/mri.md"
            title="..." forText="WPI AIM Lab" date={2018}
            type="Circuit Boards, Medical" link={{href, label}} id="1/14"
            mask="#0f5735" variant="board" live sticky
            extra={[{ label: 'Email', value: '...', href: '...', span: 3 }]} />
```

Fields are only drawn when their value is given, and the cells are packed onto a
6-column grid; the cell that closes a row loses its right border and the last
row loses its bottom border, because the **sheet frame closes the block**. So
put it flush in a corner (`padding: 0` on the zone, `display: flex;
justify-content: flex-end`) as `/` and `/work/` do.

- `variant="board"` - silk lines on `--mask-deep`, Archivo title, and `mask`
  renders a swatch + hex.
- `live` - marks values with `data-f="id|title|for|date"` and the hex with
  `data-hex` so the scroll engine rewrites them. A live block does **not** pin
  `--mask`, it inherits it from the scope.
- `sticky` - renders the block as a **status bar**: one full-width row pinned to
  the bottom of the containing board zone (`position: sticky; bottom: 0`,
  ~2.6rem tall), cells left to right `Id | Title | For | Date | Mask`, silk
  hairlines between them on a `--mask-deep` fill. Title is one line with an
  ellipsis. Below 861px it keeps Id, Title and Mask. The zone that hosts it
  gives it `margin-inline: calc(-1 * var(--pad)); width: auto` for full bleed
  and reserves its height in each entry's bottom padding.

### `Revisions.astro`

```astro
<Revisions entries={logEntries} limit={5} variant="paper" />
```

Rev / Date / Description, newest first; rev letters come from
`getLogEntries()`. ISO dates in mono.

### `ProjectIndex.astro`

```astro
<ProjectIndex sheets={sheets} sizes="..." />
```

The whole zone-B body: the 14-row table in columns 1-3, wired (green rule +
junction dot) into the vertical bus at the board plate in columns 4-6. The page
owns the `<h2>`. Hover/focus on a row swaps the plate photo and caption
immediately and lerps the plate color over 350 ms; the hex counts along.
Below 861px there is no plate: rows get a 64px thumb and a 6px mask bar.

### `Boards.astro`

```astro
<Boards sheets={featured} letter="C" sizes="..." />
```

Renders **its own `<Zone>`** (board surface, `data-mask-scope`), one
~`100vh - 6rem` entry per project (text left 5 columns, hero right 7 columns,
centered against each other, capped at intrinsic width and `100vh - 9rem`
tall), a silk bus whose junction dots sit level with each entry title, and the
sticky live status bar, which closes the zone so the last entry's color runs to
the bottom without JS.

### `Media.astro`

Unchanged: one gallery figure (image or video) with `Fig. N` captions.

## 4. Color engine: `src/scripts/mask.ts`

Pure helpers (safe at build time): `hexToLab`, `labToHex`, `mixLab`, `deepLab`,
`deepMask`.

Behaviours, both writing on the element you give them (never `:root`):

- `initScrollMask(scope)` - scroll-linked ground. Interpolates between
  neighbouring stops in Oklab as the boundary crosses the middle 70% of the
  viewport, then eases toward it each frame (`1 - exp(-dt/140)`).
- `initPlateLerp(index)` - 350 ms ease-out lerp driven by pointer/focus.
- `initMasks(doc?)` - called by the layout; wires both by attribute.

**Data attribute contract**

| attribute | on | meaning |
|---|---|---|
| `data-mask-scope` | the element whose `--mask` / `--mask-deep` are written | one scroll-driven board region |
| `data-mask="#rrggbb"` | a descendant of the scope | a color stop, in document order |
| `data-id` `data-title` `data-for` `data-date` | the same stop | values pushed into `[data-f="..."]` inside the scope |
| `data-f="id\|title\|for\|date"` | any element in the scope | live field, gets the active stop's value |
| `data-hex` | any element in the scope or plate | live uppercase hex readout |
| `data-index` | the index wrapper | one plate lerp group |
| `data-row` + `data-mask` | each index row | hover/focus target and its color |
| `data-plate` | the plate element | gets `--mask` / `--mask-deep` |
| `data-plate-item` | one figure per row, in the same order | `hidden` toggled with the row |

The engine adds `mask-js` to the scope (use it to drop no-JS fallback
backgrounds) and `is-current` to the stop in view (the gold junction dot).

**Project page**: put `data-mask-scope` on the sheet interior (the `<Sheet>`
`class` prop lands there), `data-mask` on the project band and on the next-sheet
band, and a `<TitleBlock variant="board" live />` anywhere inside. Nothing else
to wire.

## 5. Media rules

Never render an image wider than its intrinsic width: filter
`[480, 800, 1300, 1920, 2600]` to `<= image.width`, add the intrinsic width, and
give honest `sizes`. `<Picture formats={['avif','webp']}>` with `width`/`height`
from the metadata (Astro's metadata is already EXIF-orientation corrected, so
`osh-2020-badge-qr.jpg` and `Thermal-target-back-pcb.jpg` really are portrait).

Portrait heroes (moon-badge, ohs-2020, thermal-target) get deliberate handling:
in the plate they sit **beside** their caption (`[data-shape="portrait"]`), and
in Boards they run as tall as `100vh - 9rem` allows, right-aligned to the grid
edge, clear of the status bar. Keep that if you add hero photos elsewhere.

## 6. Quality floor

Responsive to 360px with no horizontal scroll, visible focus on both surfaces,
one h1 per page, real `<table>` semantics (explicit `role`s survive the mobile
`display` change), `width`/`height` on all media,
`prefers-reduced-motion: reduce` keeps the scroll-linked color but drops the
easing lag and every transform, and the page still reads correctly with
JavaScript off.
