# Artemis II Mission Dashboard

A live, auto-updating dashboard tracking NASA's Artemis II mission -- the first crewed flight to the Moon since Apollo 17 in 1972.

**[View Live Dashboard](https://mauritsajournal.github.io/artemis-dashboard/)**

## Features

- **Countdown Timer** -- Live T-minus countdown to launch with milestone indicators, auto-switching to Mission Elapsed Time after liftoff
- **Weather Panel** -- Real-time conditions at Launch Pad 39B from Open-Meteo, wind limit indicators, NOAA solar weather (Kp-index)
- **GO/NO-GO Status** -- Mission-control style readiness panel with auto-derived weather/solar status and configurable manual overrides
- **Trajectory Tracker** -- SVG visualization of Orion's Earth-Moon flight path with interpolated position
- **Day-by-Day Timeline** -- Expandable 10-day mission timeline with event details
- **Milestones Tracker** -- 18 mission milestones with record badges for historic firsts
- **Crew Profiles** -- All 4 astronauts with bios and "Historic First" achievement badges
- **News Feed** -- Aggregated Artemis-related articles from 5 RSS sources (NASA, SpaceNews, NASASpaceflight, Space.com)
- **Pre-Launch Timeline** -- 14-event countdown sequence from T-38h to T-0
- **Launch Event Tracker** -- Ascent events from liftoff through TLI with altitude/velocity data
- **NASA TV Embed** -- Toggle-able YouTube livestream embed
- **Historical Context** -- Live counter since Apollo 17, comparison timeline

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (SSG) |
| Interactive islands | Svelte 5 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript (strict) |
| Data pipeline | Node.js scripts via GitHub Actions cron |
| Hosting | GitHub Pages (free) |

## Data Sources (all free, no API keys)

| Source | Data | Update frequency |
|--------|------|-----------------|
| [Open-Meteo](https://open-meteo.com/) | KSC weather (temp, wind, cloud cover) | Hourly |
| [NOAA SWPC](https://www.swpc.noaa.gov/) | Solar weather (Kp-index, solar wind) | Hourly |
| NASA Artemis Blog RSS | Mission articles | Hourly |
| NASA News RSS | Press releases | Hourly |
| SpaceNews RSS | Industry coverage | Hourly |
| NASASpaceflight RSS | Launch coverage | Hourly |
| Space.com RSS | General space news | Hourly |

## How It Works

```
GitHub Actions cron (hourly)
    --> fetch weather (Open-Meteo + NOAA)
    --> fetch news (5 RSS feeds)
    --> commit data if changed
    --> build Astro static site
    --> deploy to GitHub Pages
```

All mission state (phase, milestones, GO/NO-GO overrides) is controlled via `data/config.json`. Push a config change to trigger a rebuild.

## Local Development

```bash
npm install
npm run fetch        # Fetch latest data from APIs
npm run dev          # Start dev server at localhost:4321
npm run build        # Build static site to dist/
```

## Configuration

Edit `data/config.json` to control mission state:

```json
{
  "launchDate": "2025-09-01T12:00:00-04:00",
  "missionPhase": "prelaunch",
  "missionDay": 0,
  "goNoGo": { "vehicle": "go", ... },
  "completedMilestones": [],
  "nasaTvVideoId": "21X5lGlDOfg"
}
```

Mission phases: `prelaunch` | `launch` | `transit` | `lunar` | `return` | `complete`

## Architecture

Same pattern as [fpl-draft-dashboard](https://github.com/mauritsajournal/fpl-draft-dashboard):
- Astro SSG with Svelte islands for interactivity (countdown timer, trajectory map, NASA TV toggle)
- All data pre-fetched at build time, no client-side API calls
- GitHub Actions handles the data pipeline + deployment
- Zero runtime cost (static files on GitHub Pages)

---

Built for the return to the Moon.
