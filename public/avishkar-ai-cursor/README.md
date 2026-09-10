# Avishkar AI website

Complete editable source for the Avishkar AI website, including its spacecraft journey, capability playing cards, scroll ribbon, and interactive confetti footer.

## Run in Cursor

Open this folder in Cursor. With Node.js 18 or newer installed, open the integrated terminal and run:

```sh
npm run dev
```

Open http://127.0.0.1:4173 in your browser. There are no npm dependencies to install. Reload the browser after edits. The local server disables caching so changed files appear immediately.

If port 4173 is occupied, use `PORT=4174 npm run dev`.

## Where to edit

| File | Purpose |
| --- | --- |
| `dist/index.html` | Website copy, sections, navigation, cards, and contact links |
| `dist/style.css` | Original base styles |
| `dist/redesign.css` | Current visual design, responsive overrides, cards, and footer |
| `dist/experience.js` | Hero rendering, camera animation, and scene lighting |
| `dist/spacecraft.js` | Ship exterior, lower hatch, cabin, cockpit, and materials |
| `dist/flight-path.js` | Camera route through the spacecraft |
| `dist/ribbon.js` | Uniform violet ribbon; stops after Selected work |
| `dist/interactions.js` | Card interactions, motion control, newsletter, and confetti rendering |
| `dist/particle-physics.js` | Confetti gravity, collisions, pointer forces, and bursts |
| `dist/assets/` | Supplied logos and original generated galaxy panorama |
| `dist/vendor/` | Locally bundled Three.js 0.180.0 and its license |
| `scripts/serve.mjs` | Dependency-free local development server |
| `.openai/hosting.json` | Existing private Sites project reference |

The HTML and CSS in `dist/` are authored source, not generated build output. Edit them directly. No build is required.

## Current state

- Pricing references have been removed.
- “Studio at a glance,” “Trust and security,” and “From the studio” have been removed as requested.
- Unfinished case studies and other retained placeholders are deliberately visible for review.
- The ribbon uses one opaque violet color, with constant screen-space width and rounded edges. It ends after Selected work rather than running through the entire page.
- Booking and newsletter actions open email requests to `arpit@avishkarai.com` and `shivang@avishkarai.com`. They are not connected to an external booking or email-list service.
- Font styles load from Google Fonts; the website falls back to system fonts if offline. All 3D libraries and image assets are local.
- Pause motion and operating-system reduced-motion preferences are supported.

## Checks and hosting

Run `npm run check` to check application JavaScript syntax. Any static host can serve the contents of `dist/`; no server-side application or secrets are needed. Keep root-relative asset paths when hosting at a domain root.

Existing private review site: https://avishkar-ai-studio.arpitsharmawri817168.chatgpt.site

The hosting manifest contains the existing project ID only, with no credentials. Deploying through Sites requires your own authenticated account. The original source repository can be connected in Cursor if you want to continue using it; this export intentionally contains no credentials or temporary tools.
