# Design QA — filtros de catálogo

## Evidence

- Source visual truth: `tmp/design-qa/catalog-filters-left-reference.png`
- Normalized source: `tmp/design-qa/catalog-filters-reference-normalized.png`
- Desktop implementation: `tmp/design-qa/catalog-filters-implementation-desktop-current.png`
- Mobile implementation: `tmp/design-qa/catalog-filters-implementation-mobile-current.png`
- Mobile genre-search state: `tmp/design-qa/catalog-filters-implementation-mobile-genres.png`
- Current full-view comparison: `tmp/design-qa/catalog-filters-comparison-current.png`
- Focused drawer comparison: `tmp/design-qa/catalog-filters-drawer-comparison.png`
- Incident reproduction check: `tmp/design-qa/home-recent-otome-current.png`
- Desktop viewport: 1440 × 1024 CSS px at device scale factor 1.
- Source normalized from 1486 × 1058 px to 1440 × 1024 px for the full-view comparison.
- Mobile viewport: 390 × 844 CSS px at device scale factor 1; captured output is 390 × 843 px because the browser surface reserves one pixel.
- State: drawer open from the left, dark theme, category selected, fixed action footer.

## Findings

No actionable P0, P1, or P2 differences remain.

The implementation intentionally treats the selected mock as direction rather than literal component specification:

- The real HeroUI drawer overlays the page instead of reflowing the catalogue. This avoids a large layout jump and matches the requested drawer behavior.
- The drawer is wider and its controls have 44 px minimum targets. This adds some vertical scrolling compared with the dense mock, but improves legibility and mobile accessibility.
- Exact HeroUI number fields replace the mock's decorative range slider. Empty fields expose the available bounds as placeholders; selected values are full-width and readable. An inverted range gets a visible error and blocks Apply.
- The live catalogue supplies its own current posters and counts, so those dynamic assets are not expected to match the generated mock pixel-for-pixel.

### Required fidelity surfaces

- Fonts and typography: existing AnimeHub display/body fonts, weights, line heights, Spanish labels, and uppercase eyebrow treatment are preserved. No cramped or clipped production copy remains.
- Spacing and layout rhythm: panel hierarchy, section dividers, two-column choice groups, toolbar, active chips, and fixed footer match the source direction. Desktop and 390 px mobile remain within the viewport.
- Colors and visual tokens: the existing navy surfaces, subtle borders, white foreground, muted copy, and `#2F81F7` accent map directly to AnimeHub's current tokens.
- Image quality and asset fidelity: no new image assets were required. Existing poster assets retain their native crop and rendering; no CSS or SVG substitutes were introduced.
- Copy and content: all controls use concise Spanish product language. Loading, count, range-error, empty-genre, and results-updated states are explicit.
- Icons: existing Lucide icons already used by AnimeHub are retained at consistent 13–18 px optical sizes.
- Accessibility: semantic HeroUI dialog, heading, disclosures, checkboxes, radios, number fields, search, tags, focus management, live regions, `aria-busy`, 44 px touch targets, and disabled invalid submission were verified.

## Interaction verification

- Desktop and mobile drawer open from the left and remain stable.
- The drawer body has one vertical scroll; header and footer remain outside the scrolling region.
- Adding Aventura to ONA leaves the URL unchanged, previews `43 obras`, then navigates once to `?category=ona&genre=aventura` on Apply.
- `/buscar?q=one&order=title-asc&genre=accion` keeps `q` and `order` after Limpiar + Apply and navigates once to `/buscar?q=one&order=title-asc`.
- `Desde 2026 / Hasta 1990` shows the range error and disables Apply without changing the URL.
- Searching `accion` matches `Acción`; unrelated genres disappear.
- `/catalogo?category=ona&genre=aventura&page=51` hides contradictory pagination and links back to `/catalogo?category=ona&genre=aventura` without losing filters.
- Invalid and legacy URL parameters are normalized before the API call instead of producing a 400 response.
- A fresh browser pass contained no console errors or warnings. Empty year fields remain controlled, and the first above-fold poster now loads eagerly.

## Comparison history

### Pass 1 — blocked

- P1: the first controlled trigger could open and immediately dismiss during rerenders.
- P2: year placeholders inherited HeroUI's three-column number-field grid and displayed only two digits.
- P2: the blur backdrop obscured too much catalogue context.
- P2: dialog padding doubled the component padding and weakened the single-scroll/fixed-footer contract.

Fixes applied: explicit overlay-state opening through the AnimeHub button, the library trigger retained as hidden state plumbing, full-grid year inputs, transparent desktop backdrop, and an overflow-hidden/padding-free dialog with a sticky footer.

### Pass 2 — passed

The revised desktop and mobile captures show stable placement, readable years, one body scroll, persistent actions, matched palette and hierarchy, and no clipped controls. Focused and full-view comparisons found no remaining P0/P1/P2 issue.

### Pass 3 — current verification passed

The implementation was re-captured after the final interaction fixes at the same 1440 × 1024 viewport as the normalized source. The combined comparison confirms the selected left-drawer direction, stable overlay, readable controls, fixed actions, and unchanged AnimeHub visual language. A 390 × 844 pass also confirms full-height containment without horizontal overflow or clipped production controls.

## Follow-up polish

- P3: production can omit the local Next.js development indicator that overlaps the lower-left corner in development screenshots; it is not part of the application bundle.

final result: passed
