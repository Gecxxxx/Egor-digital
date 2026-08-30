# Design QA — TOYS case landing

## Evidence

- Source visual truth: `C:\Users\Admin\.codex\generated_images\01a04e34-3190-7450-88c3-8a6c04595220\exec-563254f2-c2f3-4a01-92b8-8a283a079db0.png`
- Browser-rendered implementation: `D:\UserData\Documents\ChatGPT\store-site\deploy-data\egor-digital\artifacts\toys-case-final-desktop.jpg`
- Mobile implementation: `D:\UserData\Documents\ChatGPT\store-site\deploy-data\egor-digital\artifacts\toys-case-final-mobile.jpg`
- Full-view side-by-side comparison: `D:\UserData\Documents\ChatGPT\store-site\deploy-data\egor-digital\artifacts\toys-case-design-comparison.jpg`
- Hero comparison: `D:\UserData\Documents\ChatGPT\store-site\deploy-data\egor-digital\artifacts\toys-case-hero-comparison.jpg`
- Integrations comparison: `D:\UserData\Documents\ChatGPT\store-site\deploy-data\egor-digital\artifacts\toys-case-integrations-comparison.jpg`

## Capture normalization

- Source: 900 × 1792 px.
- Desktop implementation: 2816 × 5918 px, browser CSS viewport 1910 × 1074, device pixel ratio 0.8375. The 1440 px page frame was cropped from the wider browser canvas before comparison; trailing full-page capture padding was excluded.
- Mobile evidence: 836 × 9727 px, effective browser CSS viewport 582 × 1259, device pixel ratio 0.67. The browser surface enforces this minimum effective width; the tested one-column rules apply at `max-width: 600px` and therefore also cover 390 px phones.
- State: `/cases/toys-store`, dark theme, page loaded, lead modal closed.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: Oswald display headings and restrained sans-serif body copy preserve the approved hierarchy. Every major heading has exactly one semantic accent. There is no gradient text.
- Spacing and layout rhythm: the implementation intentionally uses a denser vertical rhythm than the mock, matching the user's request for a more compact, less stretched page. The desktop hero remains a two-column proof layout; mobile becomes a single readable flow without horizontal overflow.
- Colors and visual tokens: the black/white base, violet and cyan accents, and thin two-color CTA borders match the selected direction. Service names retain their individual brand colors without turning the whole section into a multicolored composition.
- Image quality and asset fidelity: all product/store views use real TOYS screenshots at appropriate crops. No placeholder imagery is present.
- Copy and content: the funnel is concise and specific: sales pain, customer journey, integrations with business purpose, VPS ownership, and a direct next step. There are no invented performance numbers or Tilda references.

## Comparison history

1. Initial P2: the desktop hero heading wrapped into four short lines, weakening the approved composition. Fixed by widening the heading measure, reducing the display size, and allowing natural two-line wrapping. Post-fix evidence: `toys-case-hero-comparison.jpg`.
2. Initial P2: the narrow browser capture still showed two-column journey and integration layouts at an effective width of 582 px. Fixed by moving the single-column breakpoint to 600 px. Post-fix evidence: `toys-case-final-mobile.jpg`.
3. Post-fix full comparison found no remaining P0/P1/P2 issue. The implementation is intentionally more compact than the visual mock, per the user's latest direction.

## Interaction and runtime checks

- “Обсудить свой магазин” opens the lead dialog; “Закрыть” closes it and restores page scrolling.
- Both “Открыть живое демо” links resolve to `https://store.egordigital.site/` in a new tab.
- Desktop document overflow check: no horizontal overflow.
- Mobile/effective narrow viewport overflow check: no horizontal overflow.
- Browser console checked: no errors; only Vite connection and React development notices.

## Follow-up polish

- P3: official service logo assets could be added later if brand-guideline fidelity becomes more important than the current restrained text treatment.

final result: passed
