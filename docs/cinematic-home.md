Homepage-only cinematic design

Route / uses CinematicHome.tsx and cinematic-home.css. All new selectors are scoped to cinematic-home, ch-prefixed children, and the homepage-only footer class. App.tsx changes only the homepage route, component import, and conditional footer class. Old Home component remains available for rollback.

Uses existing Balewadi image and published athlete/news photos. No generated athlete asset is included. Missing content has explicit empty and failure states. Data comes from existing public API modules; no seed data or database changes.

Features: stadium geometry, limited atmospheric particles, pointer depth on desktop, reveal transitions, sport selector, event links, athlete carousel, medal counters with CSS dimensional medals, regional event selector, results, editorial news, and closing vision link. Reduced-motion OS and account preferences disable CSS motion. Navbar and approved opening animation retained.

Limitations: the region section uses accessible city buttons, not the geographic 3D map requested in the concept. No WebGL model or video assets are included. CSS provides the depth effects. Build passes, but browser visual/interaction checks could not run because the installed Playwright browser executable is missing. No live MongoDB validation performed.
