# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Approved Egor Digital direction

- Preserve the selected dark editorial layout inspired by ZelvixAI: black/charcoal surface, subtle grain, strict vertical grid, condensed uppercase display type, square controls, and generous negative space.
- Use the existing Digital Tools by Egor logo and a restrained violet-to-cyan accent system; do not use lime green.
- The homepage hero headline is “САЙТЫ. CRM. АВТОМАТИЗАЦИЯ.” with Egor as a natural-color cutout on the black grid, with no photographic background.
- The About page uses the separate smiling portrait with Egor's raised peace-sign gesture; keep it in natural color as a clean cutout on the same black editorial grid, without the original outdoor photo background.
- Keep the current site's seven-route information architecture and real content: home, services, cases, pricing, process, about, and contacts.
- Preserve real prices and promises: website from $500, CRM/automation from $1000, audit/small task from $250, support from $50/month, and two months of support included after launch.
- Keep both contact paths visible: a direct Telegram link and the lead form must be available on the Contacts page and in the site footer.
- Direct contacts: Telegram `@egecxxxx`, WhatsApp `+20 114 969 2210`, email `eggetsevich@gmail.com`, and Instagram `@_gecevich_`; show all four on the Contacts page and in the footer.
- Display every case preview in a true 16:9 frame with the full screenshot visible; do not crop case artwork.
- Motion direction approved from the ZelvixAI reference: a fast branded intro that waits briefly for the hero portrait, blur-to-sharp and masked line reveals, staggered hero content, continuous benefit ticker, scroll-triggered section reveals, count-up metrics, masked CTA text swaps with moving action icons, 16:9 case-image reveals/hover zoom, and smoothly animated FAQ accordions.
- Keep the intro under roughly one second on a normal connection, prefer transform/opacity over heavy filters, and respect `prefers-reduced-motion` across every animation.
- Mobile direction is approved as a responsive version of the same editorial design, not a separate visual concept: support 320–430px widths without horizontal overflow, use a full-height one-column menu with direct Telegram and lead-form actions, keep the HERO/facts/photo hierarchy compact, preserve 16:9 case art with `object-fit: contain`, and use 16px form controls to avoid iOS input zoom.
- Keep Egor's portrait integrated inside the HERO at every breakpoint, including phones and tablets; never move it into a separate photo block below the HERO content, and always fit the full cutout without cropping his arms.\n- The homepage portrait remains the current natural-color `egor-hero-cutout` asset. At desktop widths above 1100px, keep Egor approximately 20% larger than the approved `11381bf` version and top-anchor the enlarged image so the head remains fully visible while the lower body can crop at the HERO boundary. Preserve the approved compact upper-right 404-style composition on 320–520px mobile screens instead of a tall standalone image block.
- Display typography must keep a safe Cyrillic rhythm across desktop and mobile: use roughly `1.04–1.06` line-height, restrained negative tracking, and enough reveal-mask padding for Й/Ё diacritics and Д/Ц/Щ descenders so glyphs never clip or collide with adjacent lines and accent rules.
- Mobile retains the same branded motion language as desktop with lighter scroll blur/offsets for performance. Keep the intro loader clearly visible for about half a second, wait briefly for the display font and priority portrait, and continue respecting `prefers-reduced-motion`.
- Unknown routes use a branded 404 page in the same editorial system: show Egor's natural-color cutout, clear recovery copy, actions to return home and open the lead form, plus quick links to Services, Cases, and Contacts. Mark the route `noindex,follow` and preserve an actual `404.html`/HTTP 404 response while known application routes remain 200.
- Mobile navigation, the branded loader, scroll reveals, and the continuous ticker are required product behavior, not optional decoration. Keep them functional on touch devices from 320–430px and preserve a static loader state for users who request reduced motion.
- Never make mobile-menu visibility depend only on an entrance animation: `.nav.open` must provide a fully visible fallback when animations are disabled or unsupported. Keep the ticker running on mobile even when the device reports reduced motion, because it is an explicitly required content behavior for this site.
- Case priority on both Home and the full Cases page is: Дарья Каминскене, Green Apple Dent (ЗЯ), then Крыша-мечты. Deliver responsive WebP sources at 640, 960, and 1440 widths while preserving a true 16:9 frame and the full uncropped cover.
- Keep `/privacy` as a real known route, link it from the footer and mobile menu, and require an explicit privacy-consent checkbox in every lead form before submission.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
