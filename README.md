# Developer-portal builder — phase 2

A builder for an API developer portal. An admin picks the pages, arranges
sections, edits any text/image/icon by clicking it, and restyles the entire
portal from a single brand colour.

```bash
npm install
npm run dev
```

Opens on http://localhost:5180. Work autosaves to localStorage.

## Two surfaces

The app is the **developer portal**; the builder is a mode inside it.

**Portal** — layout from the Figma (`Dev Portal - Docuwiz 2026`): a slim icon
rail, a tree sidebar, and the content as a **white card inset on the themed
chrome**. The chrome follows the brand colour; the card never does. That
contrast is the design.

**Builder** — reached from **Customise** in the rail. The right-hand area turns
into the builder, the portal's top bar steps out of the way, and the portal nav
collapses on entry; the square (`SidebarSimple`) icon in the builder toolbar
brings it back. Leaving via any other rail entry, or *Exit builder*, returns to
the portal.

The builder is themed by the same tokens as everything else — it re-points the
`--ui-*` names at the shared semantic layer, so its panel is literally the same
surface as the portal rail. Two colour worlds live in that panel and mixing
them up is the bug the solid treatment exposes instantly: text **on the chrome**
(labels, section headings) must use the chrome scale or it vanishes on a solid
brand panel, while text **on a white well** (inputs, list bodies, menus) must
use the content scale or it vanishes on white.

The reference page is the screen matched to the design so far. The other rail
entries are placeholders, and the landing page is left as-is.

### The reference page

Ported from the dvsh prototype's `doc-page.tsx` + `globals.css`, which is the
code version of the Framer reference screen — so this is reuse, not a rebuild.
Breadcrumbs, mono title, lede, method + path row, Copy Page / Open in Claude /
Download, View | Tryout, the Host card with its environment select, a
brand-tinted callout, Header Parameters and Request Body as param rows with
`format:` chips, and two always-dark hue-matched panels on the right —
**Endpoint** (with language selector and copy/download) and **Response** (with
its status pill). The tree drives which endpoint is shown.

## Layout

Inside the builder, two columns:

- **Left** — a page dropdown at the top (Framer-style), then the section list.
  Selecting anything drills the panel down one level: a `‹ Home / Hero`
  breadcrumb, that section's fields, and **Save and close** to return to
  level one. The theme editor is the same kind of drill-down.
- **Right** — the full-width rendering of the current page. Click any heading,
  button, icon, image, or nav link and the left panel nests straight to that
  field. Double-click text to edit it in place on the canvas.

## Pages

| Page | Chrome | What's configurable |
|---|---|---|
| Home | nav + footer | Hero, logos, features, stats, recipes, FAQ, CTA — any marketing section, insertable anywhere |
| Sign in | standalone | Copy, credential fields, **login providers**, legal, switch link, product artwork |
| Sign-up form | standalone | Step two after Continue — a **custom form builder** |
| Guides | nav + footer | Category groups and their articles, search box |
| API reference | nav + footer | Resources, endpoints, methods, base URL, nav rail |
| Product recipes | nav + footer | Recipe cards with icon, tag, meta and link |
| Contact us | nav + footer | Form, contact details, FAQ |

Nav and footer are shared site chrome — edit once, every page with chrome
follows. Auth and the sign-up form deliberately render without them.

### Login providers

The **Providers** list on the Sign in page has a premade menu rather than a
blank row: Google, GitHub, Microsoft, GitLab, SAML SSO, Okta, Magic link,
API key, LDAP, or blank. Each one is then editable — label, Phosphor icon,
style (outlined / solid / text) and full-width.

### Sign-up form builder

The step-two form is fully composable. Add fields from presets (full name,
work email, company, role dropdown, use case, expected volume, terms
checkbox, environment radio) or blank, then set label, placeholder, **type**
(single line, email, paragraph, dropdown, checkbox, radio, number, date),
choices, helper text, required, and full-width. The canvas renders the real
control for each type.

## Colour system

Ported from the `dvsh` `radix-brand-prototype` branch. The admin picks **one**
colour; everything else is derived.

`src/theme/generate-radix-colors.ts` is vendored byte-for-byte from that
branch (which vendors it from radix-ui/website — the algorithm behind
radix-ui.com/colors/custom), including both `LOCAL DEVIATION` NaN guards.
Don't refactor it; semantic mapping belongs in `palette.ts`, and staying close
to upstream keeps it diffable.

How it works: the accent is matched against every Radix scale in OKLCH by
`deltaEOK`, the two nearest scales are mixed in proportion to their distance
(with the obtuse-triangle case falling back to just the nearest), then chroma
is rescaled to your colour and lightness re-eased through a bezier so step 1
lands on the page background. Step 9 is your hex, verbatim.

### Three token layers

| Layer | What | Where |
|---|---|---|
| 1. Primitive | `--accent-1..12` / `--gray-1..12` + alpha, `--accent-contrast`, `--dark-gray-*`, `--dark-accent-*` | generated by `src/theme/palette.ts`, applied to `.site` as inline custom properties |
| 2. Semantic | `--surface-page`, `--brand-solid`, `--text-hi`, `--border-default`, … — names describe ROLE, not colour | the `.site` block in `canvas.css` |
| 3. Component | every other rule, via the per-surface aliases the `.surf-*` blocks re-point | `canvas.css` |

Changing the accent rewrites layer 1. Layers 2 and 3 never change. No
component knows what colour the brand is.

Layer 1 is scoped to `.site` rather than `:root` — the builder chrome keeps its
own `--ui-*` namespace and is never themed by the customer's brand.

### The paired tinted grey

Radix pairs every accent with a tinted grey, so neutrals carry a hint of the
brand instead of being flat `#888`. `grayFamilyForAccent` resolves the pairing
by hue: reds/purples/pinks → mauve, yellows/oranges → sand, grass/lime →
olive, greens/teals → sage, blues/cyans → slate, unsaturated → gray. This is
what makes the chrome shift warm for an orange brand and cool for a blue one
without ever looking tinted-by-accident.

### Chrome treatments

Three, applied to the chrome only — the portal rail and tree sidebar, and the
published site's shared nav and footer (which carry `.chrome-surface`). Each
one re-points role tokens and nothing else: not a single component rule is
duplicated, and neither the white content card nor the page body is affected.

- **Subtle** — accent step 2, a brand-tinted near-white (the default).
- **Solid** — the accent at full strength, as typed; the primary button inverts,
  because a brand-coloured button on a brand-coloured bar is invisible.
- **Neutral** — the paired grey only. Buttons, links and icons stay brand;
  nothing else does, including the decorative washes (`--decor`).

Light and dark **appearance** is a separate axis.

### Contrast

Button labels come from `--accent-contrast`, which upstream picks by APCA, not
by guesswork. The theme panel reports the two numbers that matter — label on
brand, and body on page — so the choice is visible rather than magic.

Verified across eight accents (indigo, orange, teal, yellow, lime, near-black,
rose, mid-grey): step 9 is the input hex exactly, the paired grey resolves
correctly for each hue, every label lands at APCA Lc ≥ 61, and no step
serialises as `NaN` (both vendored guards doing their job — mid-grey exercises
the achromatic path).

One deliberate exception: if the accent sits within `deltaEOK` 25 of the page
background, upstream substitutes a usable step 9 rather than emitting an
unreadable button. Neon lime `#ccff00` measures 23.3 and becomes `#c2f500`.
That is upstream intent, not a porting bug.

### Method badges

Deliberately **not** brand-derived, and the one place the brand does not
reach. A verb badge encodes meaning (GET is safe, DELETE is destructive);
recolouring it with the brand destroys that signal. Fixed Radix scales, with
**opaque** step-3 backgrounds rather than the usual alpha step — these badges
sit in the reference rail, which follows the chrome treatment, so an alpha
background composites down onto a solid brand chrome and the contrast
collapses (GET measured APCA Lc 36 on solid yellow).

## Selection works both ways

Clicking a heading, button, icon or image on the canvas drills the panel to
that exact field and focuses it. Focusing or clicking that field does the
reverse — it outlines the element on the canvas and scrolls it into view
(`block: 'nearest'`, so a canvas-originated click never jumps the page).

## The section picker

One illustration per section type, not a wall of layout variants — the
variants live in the section editor where swapping them shows a live result.

The illustrations are generated by `tools/gen_illustrations.py` with the
`product-ui-illustrations` skill's visual language: one stroke width (0.5) and
one stroke colour everywhere, placeholder bars instead of words, exactly one
element carrying the shadow, and at most one accent per piece — which reads
`--il-accent`, mapped to the brand colour. Thirteen different compositions, so
the set reads as thirteen views of one product rather than one drawing
repeated.

The `--il-*` slots are mapped onto the shared semantic layer in `app.css`, with
a separate dark mapping: dark is not an inversion, surfaces still get lighter
as they come forward. `public/il-sheet.html` is the contact sheet for checking
the set in both appearances.

Regenerate with:

```bash
python3 tools/gen_illustrations.py
```

## Icons

The full **Phosphor** set (1512 icons) via `@phosphor-icons/react`. The picker
shows a curated shelf by default and searches the whole library on typing.

> Vite needs `resolve.dedupe: ['react', 'react-dom']` for this package —
> without it Phosphor is pre-bundled with its own React copy and every hook
> inside its components throws.

## Layout of the code

```
src/theme/generate-radix-colors.ts  Vendored Radix custom-palette algorithm — do not refactor
src/theme/palette.ts     Accent hex -> token map; paired-grey pairing, APCA helper
src/portal/PortalShell.tsx  Icon rail, tree sidebar, inset white content card
src/portal/ReferenceDoc.tsx The API reference screen
src/portal/referenceData.ts Tree groups, endpoints, rail entries
src/styles/tokens.css    Layer 2 — the shared semantic layer
src/styles/portal.css    Portal chrome (layer 3)
src/styles/doc.css       Reference page (layer 3)
src/registry.ts          Every section type: variants, defaults, field schema, presets
src/types.ts             Doc / Page / Section / Field types
src/store.ts             Multi-page state, panel nesting, undo/redo, autosave
src/ui/Phosphor.tsx      Icon component + generated name catalogue
src/canvas/Bits.tsx      Ed / Pick / Img / Ico / Btn — click-to-edit primitives
src/canvas/Canvas.tsx    Frame, section shells, hover chrome, inserters
src/sections/render.tsx  Every section layout
src/panels/LeftPanel.tsx Page switcher, section list, drill-down routing
src/panels/              SectionEditor, ThemePanel, Fields, Thumb, AddSection
src/styles/canvas.css    The rendered portal — all colour via tokens
src/styles/app.css       Builder chrome
```

Adding a section type is one entry in `REGISTRY` and one branch in
`SectionBody`. The editor builds itself from the field schema.

Export / Import round-trips the whole multi-page document as JSON.
