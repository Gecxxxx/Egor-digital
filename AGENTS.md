# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Approved Egor Digital direction

- Preserve the selected dark editorial layout inspired by ZelvixAI: black/charcoal surface, subtle grain, strict vertical grid, condensed uppercase display type, square controls, and generous negative space.
- Use the existing Digital Tools by Egor logo and a restrained violet-to-cyan accent system; do not use lime green.
- The homepage hero headline is “САЙТЫ. CRM. АВТОМАТИЗАЦИЯ.” with Egor as a natural-color cutout on the black grid, with no photographic background.
- Keep the current site's seven-route information architecture and real content: home, services, cases, pricing, process, about, and contacts.
- Preserve real prices and promises: website from $500, CRM/automation from $1000, audit/small task from $250, support from $50/month, and two months of support included after launch.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
