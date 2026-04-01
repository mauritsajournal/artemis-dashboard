# Artemis II Dashboard

## Quick Reference
- **Stack:** Astro 5 + Svelte 5 + Tailwind CSS 4 + TypeScript
- **Hosting:** GitHub Pages at /artemis-dashboard
- **Data:** Free APIs only (Open-Meteo, NOAA SWPC, RSS feeds) + static config
- **Architecture:** Same pattern as /home/claude/fpl-draft-dashboard

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Build static site
npm run fetch        # Fetch all external data
npm run fetch:weather # Fetch weather only
npm run fetch:news   # Fetch news RSS only
```

## Design Requirements
- Dark space theme, cinematic, NASA mission control feel
- Use the frontend-design skill: bold typography, no AI slop, memorable design
- Glassmorphism panels, glow effects, star field background
- Display font: space-age character (Orbitron, Chakra Petch, or similar)
- Colors: NASA orange (#FC3D21), mission blue (#0B3D91), deep dark base (#0a0a0f)

## Data Flow
```
GitHub Actions cron → fetch scripts → data/*.json → Astro build → GitHub Pages
```

## Config-Driven State
All mission state controlled via `data/config.json`:
- missionPhase: "prelaunch" | "launch" | "transit" | "lunar" | "return" | "complete"
- Milestone completion, GO/NO-GO status, NASA TV video ID
- Push config change → auto-rebuild

## Tickets
See `docs/tickets.md` — 20 tickets, work top to bottom, respect dependencies.
