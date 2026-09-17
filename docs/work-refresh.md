# Work cards and case studies

The five work cards open `/work/<slug>`. These pages follow the editorial layout of https://www.14islands.com/work/cartier365 with the site's existing Aeonik font and color tokens: project facts, oversized title, hero, large introduction, right-column narrative, full-width/paired media, more work, and contact footer.

Edit `lib/work-studies.ts` for each project's copy and services. All project descriptions are illustrative. The current project images and designed placeholders stand in for final media. The film slot is deliberately labeled as a video placeholder and has no nonfunctional playback button. No awards, outcomes, or external project URLs are invented. Detail routes have noindex metadata until approved content replaces the placeholders.

The cards use the official Componentry registry component from https://componentry.dev/r/image-ripple-effect.json, adapted to cover the card, preserve color space and drawing-buffer sizing, and keep the underlying Next Image as a fallback. Dependencies were already installed. Static media is used on touch devices and with reduced motion; canvases mount only near the viewport.
