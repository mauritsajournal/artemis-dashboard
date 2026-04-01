# Artemis II Dashboard — Technical Blueprint

## Overview
Static dashboard tracking the Artemis II mission — from pre-launch countdown through 10-day lunar flyby mission to splashdown. Hosted on GitHub Pages, auto-updating via GitHub Actions cron.

## Architecture
Same pattern as fpl-draft-dashboard:
- **Astro 5** SSG with **Svelte 5** interactive islands
- **Tailwind CSS 4** for styling
- **GitHub Actions** cron → fetch data → transform → build → deploy
- **GitHub Pages** hosting (zero cost)

## Data Sources (all free, no API keys)
| Source | URL | Data | Frequency |
|--------|-----|------|-----------|
| Open-Meteo | api.open-meteo.com | KSC weather | Every 15 min |
| NOAA SWPC | services.swpc.noaa.gov | Solar weather, Kp-index | Every hour |
| NASA Blog RSS | blogs.nasa.gov/artemis/feed/ | News articles | Every 5 min |
| NASA News RSS | nasa.gov/news-release/feed/ | News articles | Every 5 min |
| SpaceNews RSS | spacenews.com/feed/ | News articles | Every 5 min |
| NASASpaceflight RSS | nasaspaceflight.com/feed/ | News articles | Every 5 min |
| Space.com RSS | space.com/feeds/all | News articles | Every 5 min |

## Static/Config Data (no API needed)
| File | Content |
|------|---------|
| data/config.json | Mission phase, launch date, GO/NO-GO, completed milestones |
| data/crew.json | Crew bios, roles, firsts |
| data/trajectory.json | Day-by-day position waypoints for trajectory visualization |
| data/mission-timeline.json | 10-day mission event timeline |

## Key Design Decisions
1. **No API keys** — everything uses free public APIs or RSS feeds
2. **Config-driven state** — mission phase, milestones, GO/NO-GO status all controlled via data/config.json. Push to update.
3. **Trajectory interpolation** — NASA doesn't provide real-time Orion position API. We use published flight plan waypoints and interpolate between them.
4. **GitHub Pages** — same as fpl-draft-dashboard, proven pattern
5. **Dark space theme** — cinematic, NASA-inspired design language

## Pages
1. `/` — Home: countdown, GO/NO-GO, weather, quick status
2. `/mission/` — Trajectory tracker, day-by-day timeline, milestones
3. `/launch/` — Pre-launch timeline, launch event tracker
4. `/crew/` — Crew profiles with "first" badges
5. `/news/` — Aggregated space news feed
6. `/status/` — Data health, config state

## Reference
- FPL Draft Dashboard: /home/claude/fpl-draft-dashboard (same architecture)
- Frontend design skill: ~/.claude/skills/frontend-design/SKILL.md (design guidelines)
