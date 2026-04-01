# Artemis II Dashboard — Tickets

> Ordered by dependency. Work top to bottom.
> Hosting: GitHub Pages (static site, like fpl-draft-dashboard)
> Stack: Astro 5 + Svelte 5 islands + Tailwind CSS 4 + Chart.js/D3
> UI: 2026 modern — dark space theme, glassmorphism, bold typography, cinematic feel
> Data: All open/free APIs and RSS scraping only — NO API keys needed
> Reference project: /home/claude/fpl-draft-dashboard (same architecture pattern)

---

## [x] T-001 — Project scaffolding & CI/CD
**Completed:** 2026-04-01 — Astro 5 + Svelte 5 + Tailwind 4 + TS strict + GitHub Actions (cron, deploy, keepalive) + dark space theme

**Priority:** P0
**Description:** Initialize Astro 5 project with Svelte 5 integration, Tailwind CSS 4, TypeScript strict mode. Set up GitHub Actions workflow for build + deploy to GitHub Pages (same pattern as fpl-draft-dashboard). Add keepalive workflow to prevent cron disable.

**Acceptance criteria:**
- `npm run dev` starts local dev server
- `npm run build` produces static output in dist/
- GitHub Actions deploys to GitHub Pages on push to main
- GitHub Actions fetches data on cron (every 15 min during launch window, every hour otherwise)
- Base path configured for `/artemis-dashboard`
- TypeScript strict mode enabled
- Tailwind CSS 4 configured with dark space theme

**Technical notes:**
- Copy the workflow pattern from fpl-draft-dashboard but adapt for this project
- Use `@astrojs/svelte` for interactive islands
- Data fetch + build + deploy in single workflow (GITHUB_TOKEN can't trigger other workflows)

---

## [x] T-002 — Design system & layout
**Completed:** 2026-04-01 — Dark space theme, star field, glassmorphism, NASA palette, reusable components, responsive layout + nav

**Priority:** P0
**Depends on:** T-001
**Description:** Create the master layout, global styles, and design system. This dashboard should feel like a NASA mission control screen — dark, cinematic, authoritative. Use the frontend-design skill philosophy: no AI slop, bold choices, memorable.

**Design direction:**
- Dark space theme (#0a0a0f base, deep blues, accent orange/amber like NASA)
- Glassmorphism panels with subtle backdrop-blur
- Display font: something bold and space-age (e.g., Orbitron, Chakra Petch, or similar from Google Fonts)
- Body font: clean and technical (e.g., JetBrains Mono for data, Source Sans 3 for text)
- Accent colors: NASA orange (#FC3D21), mission blue (#0B3D91), success green, warning amber
- Subtle star field or particle background
- Grid-based dashboard layout, responsive
- Smooth page transitions
- Status indicators with glow effects

**Acceptance criteria:**
- Layout.astro with responsive nav, footer, background effects
- CSS variables for all theme colors, fonts, spacing
- Reusable components: StatusBadge, DataCard, GlowPanel, SectionHeader
- Mobile responsive (dashboard cards stack on mobile)
- Looks cinematic and professional, not generic

---

## [x] T-003 — Data fetch pipeline: weather
**Completed:** 2026-04-01 — Open-Meteo + NOAA SWPC fetch with error handling, stale data fallback

**Priority:** P0
**Depends on:** T-001
**Description:** Create data fetch script for weather at Launch Pad 39B (28.5721°N, 80.6480°W). Use Open-Meteo API (free, no key needed).

**Data to fetch:**
- Current: temperature (°C), wind speed (km/h), wind gusts, cloud cover (%), precipitation, weather code
- Hourly forecast: next 24h
- Daily forecast: 5 days (for backup launch windows)
- Solar/geomagnetic: use NOAA SWPC JSON endpoints (free, no key) for Kp-index and solar weather

**API endpoints:**
- Open-Meteo: `https://api.open-meteo.com/v1/forecast?latitude=28.5721&longitude=-80.6480&current=temperature_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,weather_code&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&timezone=America%2FNew_York&forecast_days=5`
- NOAA Kp-index: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- NOAA solar wind: `https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json`

**Output:** `data/weather.json`

**Acceptance criteria:**
- Script in `scripts/fetch-weather.ts`
- Fetches both weather and solar data
- Writes to `data/weather.json` with timestamp
- Error handling: if API fails, keep stale data
- No API key required

---

## [x] T-004 — Data fetch pipeline: news RSS
**Completed:** 2026-04-01 — RSS parser for 5 feeds, Artemis keyword filter, dedup, 50-article limit

**Priority:** P0
**Depends on:** T-001
**Description:** Scrape/parse RSS feeds from space news sources. No API keys needed.

**Sources:**
- NASA Artemis Blog: `https://blogs.nasa.gov/artemis/feed/`
- NASA Breaking News: `https://www.nasa.gov/news-release/feed/`
- SpaceNews: `https://spacenews.com/feed/`
- NASASpaceflight: `https://www.nasaspaceflight.com/feed/`
- Space.com: `https://www.space.com/feeds/all`

**Process:**
- Parse RSS XML → extract title, link, pubDate, source, description/summary
- Filter for Artemis-related articles (keyword filter: "artemis", "orion", "SLS", "moon mission", "lunar")
- Sort by date descending
- Keep max 50 articles

**Output:** `data/news.json`

**Acceptance criteria:**
- Script in `scripts/fetch-news.ts`
- Parses all 5 RSS feeds
- Filters for Artemis-relevant content
- Outputs clean JSON array
- No API key required
- Handles feed failures gracefully (skip broken feed, keep others)

---

## [x] T-005 — Countdown timer page (home)
**Completed:** 2026-04-01 — Svelte island countdown with glow effects, milestones, MET mode, backup windows

**Priority:** P0
**Depends on:** T-002
**Description:** The home page with a massive, cinematic countdown timer to the Artemis II launch. This is the hero — it should be breathtaking.

**Features:**
- Giant countdown: days, hours, minutes, seconds (T-minus format)
- Launch date: September 2025 (NET — use NASA's latest announced date, or make configurable in a data/config.json)
- T-minus milestones shown inline below the clock:
  - T-6h: Propellant tanking begins
  - T-3h: Crew suit-up
  - T-2h: Crew departs for pad
  - T-1h: Crew ingress
  - T-30m: Terminal countdown
  - T-10m: Final polls
  - T-31s: Automated sequence
  - T-0: LIFTOFF
- Backup launch windows displayed (configurable dates)
- After liftoff: auto-switch to Mission Elapsed Time (MET) counting UP
- Pre-launch vs post-launch state managed via config.json (missionPhase: "prelaunch" | "launch" | "transit" | "lunar" | "return" | "complete")

**Acceptance criteria:**
- Svelte island for live countdown (updates every second)
- Milestone indicators highlight as T-minus passes each one
- Responsive — looks great on mobile and desktop
- MET mode works when configured
- Cinematic typography and glow effects

---

## [x] T-006 — Weather panel component
**Completed:** 2026-04-01 — Full weather panel with wind gauge, Kp-index, 5-day forecast, stale data warning

**Priority:** P1
**Depends on:** T-002, T-003
**Description:** Weather display panel for Launch Pad 39B conditions.

**Features:**
- Current conditions: temp, wind, gusts, cloud cover, precipitation
- Wind limit indicator (launch constraint: max 72 km/h at ground, 53 km/h at 162ft)
- GO/NO-GO color for weather (green if within limits, red if not)
- Solar weather: Kp-index with color scale (0-3 green, 4-5 yellow, 6+ red)
- 5-day forecast mini cards (for backup windows)
- Last updated timestamp

**Acceptance criteria:**
- Reads from data/weather.json (build-time) + client-side refresh option
- Visual wind gauge or bar showing current vs limit
- Kp-index meter
- Clean, readable data presentation
- Works with stale data (shows "data from X hours ago" warning)

---

## [x] T-007 — GO/NO-GO status panel
**Completed:** 2026-04-01 — SVG ring gauge, 8 categories (2 auto, 6 manual), hold/scrub notifications

**Priority:** P1
**Depends on:** T-002
**Description:** Mission-control style GO/NO-GO panel. Since we don't have real NASA polling data, this is a smart visualization that combines available data with configurable manual overrides.

**Categories:**
- Weather: AUTO from weather data (wind/precipitation/lightning risk)
- Vehicle: MANUAL via config.json (default: GO)
- Ground Systems: MANUAL via config.json (default: GO)
- Crew Health: MANUAL via config.json (default: GO)
- Solar Weather: AUTO from NOAA Kp-index
- Range Safety: MANUAL via config.json (default: GO)
- Flight Software: MANUAL via config.json (default: GO)
- Recovery Weather: MANUAL via config.json (default: GO)

**Features:**
- Big overall GO percentage (count of green / total)
- Each category: name + status badge (GO green / CONCERN amber / NO-GO red)
- Hold/scrub notification bar (configurable in config.json)
- Animated status transitions

**Acceptance criteria:**
- Weather and solar auto-derive from data
- Manual categories configurable in data/config.json
- Overall percentage calculation
- Dramatic visual presentation (think mission control big screen)

---

## [x] T-008 — Pre-launch timeline
**Completed:** 2026-04-01 — 14-event vertical timeline, dual timezone, live status from launch time

**Priority:** P1
**Depends on:** T-002
**Description:** Vertical timeline showing all pre-launch countdown milestones with live status.

**Timeline events (configurable in data/config.json):**
- T-38h: Launch Readiness Review → GO
- T-11h: Launch countdown begins
- T-8h: Clear pad for tanking
- T-6h: Liquid oxygen / hydrogen loading begins
- T-3h15m: Crew wake-up
- T-3h: Crew suit-up (ACES suits)
- T-2h30m: Crew walkout & Astrovan ride to pad
- T-2h: Crew ingress Orion
- T-1h: Hatch close & cabin leak check
- T-30m: Terminal countdown begins
- T-10m: Final GO/NO-GO polls
- T-2m: Orion to internal power
- T-31s: Automated launch sequence
- T-0: LIFTOFF

**Features:**
- Vertical timeline with connector lines
- Each event: timestamp (EDT + CEST), title, description, status icon
- Status: completed (green check), active (pulsing), upcoming (dim)
- Active event highlighted and expanded
- Auto-scroll to active event
- Timestamps calculated from launch time in config.json

**Acceptance criteria:**
- Events configurable via data/config.json
- Status derives from current time vs event time
- Dual timezone display (EDT + CEST)
- Smooth animations for status transitions
- Looks like a real mission control timeline

---

## [x] T-009 — Launch event tracker page
**Completed:** 2026-04-01 — 9 ascent events with altitude/velocity, config-driven completion

**Priority:** P1
**Depends on:** T-002
**Description:** Launch day sequence tracker — shows ascent events from liftoff to TLI.

**Events:**
- T+0s: LIFTOFF — SLS clears tower
- T+2m: SRB separation — solid rocket boosters jettison
- T+3m: Fairing panels jettison
- T+8m: Core stage MECO — main engine cutoff
- T+8m10s: Core stage separation
- T+8m20s: ICPS ignition — Interim Cryogenic Propulsion Stage
- T+18m: ICPS cutoff — parking orbit achieved
- T+1h30m–2h: TLI burn — Translunar Injection, leave Earth orbit
- T+2h+: Orion separates from ICPS, solar arrays deploy

**Features:**
- Sequential event cards that light up as events are reached
- Each event: timestamp, title, description, visual indicator
- Altitude/speed indicators where relevant
- Configurable via data/config.json (can mark events as completed)

**Acceptance criteria:**
- Events clearly visualized in sequence
- Completed/active/upcoming states
- Altitude and speed data shown where available
- Works in pre-launch (all upcoming) and post-launch (some completed) states

---

## [x] T-010 — Crew panel component
**Completed:** 2026-04-01 — Profile cards with initials avatar, "Historic First" badges, X links, responsive grid

**Priority:** P1
**Depends on:** T-002
**Description:** Crew information panel with photos, bios, and "first" badges.

**Crew data (hardcode in data/crew.json):**
- **Reid Wiseman** — Commander, NASA, USN Captain. 2nd spaceflight. Born 1975. "First" badge: Oldest person beyond LEO
- **Victor Glover** — Pilot, NASA, USN Captain. 2nd spaceflight. Born 1976. "First" badge: First person of color beyond LEO
- **Christina Koch** — Mission Specialist 1, NASA. 2nd spaceflight. Born 1979. Holds women's single spaceflight duration record (328 days). "First" badge: First woman beyond LEO
- **Jeremy Hansen** — Mission Specialist 2, CSA (Canadian Space Agency). 1st spaceflight. Born 1976. CF-18 fighter pilot. "First" badge: First non-American on a lunar mission, first Canadian beyond LEO

**Features:**
- Photo placeholder (use initials avatar or NASA crew silhouette SVG)
- Name, role, agency, short bio
- "First" achievement badges (prominent, celebratory)
- Social media links: Twitter/X handles
- Hover/click to expand full bio

**Acceptance criteria:**
- Crew data loaded from data/crew.json
- Beautiful card layout
- "First" badges are visually prominent and inspiring
- Responsive grid (4 cards on desktop, 2 on tablet, 1 on mobile)

---

## [x] T-011 — Mission trajectory tracker
**Completed:** 2026-04-01 — SVG trajectory with Earth/Moon, Orion position, record markers, responsive

**Priority:** P1
**Depends on:** T-002
**Description:** 2D visualization of Orion's position on the Earth-Moon trajectory. Since NASA doesn't provide a real-time Orion position API, we interpolate based on the published flight plan.

**Approach:**
- Define trajectory waypoints in data/trajectory.json for each mission day:
  - Day 0: Earth (launch) — 0 km from Earth
  - Day 1: 50,000 km from Earth (post-TLI)
  - Day 2: 120,000 km from Earth
  - Day 3: 200,000 km from Earth
  - Day 4: 300,000 km from Earth
  - Day 5: 370,000 km (approaching Moon, ~384,400 km Earth-Moon distance)
  - Day 6: 392,000 km (7,600 km beyond Moon — farthest point)
  - Day 7: 350,000 km (return trajectory)
  - Day 8: 250,000 km
  - Day 9: 130,000 km
  - Day 10: 0 km (splashdown)
- Interpolate between waypoints based on MET
- Show current position as animated dot on the path

**Features:**
- SVG or Canvas trajectory visualization
- Earth (left) and Moon (right) with Orion moving along curved path
- Current distance to Earth and Moon
- Current speed (interpolated)
- Mission day indicator
- "Farthest point" marker at Day 6
- Apollo 13 record distance marker (400,171 km from Earth)

**Acceptance criteria:**
- Beautiful space visualization (dark background, glowing bodies)
- Smooth animation of Orion position
- Responsive (scales to mobile)
- Shows key metrics: distance, speed, mission day
- Record markers visible

---

## [x] T-012 — Day-by-day mission timeline
**Completed:** 2026-04-01 — Expandable 10-day timeline with events, progress bar, status tracking

**Priority:** P1
**Depends on:** T-002
**Description:** Detailed timeline for all 10 mission days with events, descriptions, and status tracking.

**Data:** Hardcode in data/mission-timeline.json (from the feature spec — all 10 days with events).

**Features:**
- Horizontal or vertical scrollable timeline
- Each day: number, title, key events, description
- Current day highlighted (based on MET from config.json)
- Past days: completed styling
- Future days: upcoming styling
- Click/tap to expand day details

**Acceptance criteria:**
- All 10 days with accurate descriptions from the spec
- Current day auto-highlighted
- Expandable details per day
- Visual progress indicator (how far through the mission)
- Responsive

---

## [x] T-013 — Mission milestones tracker
**Completed:** 2026-04-01 — 18 milestones checklist, record badges, config-driven completion

**Priority:** P1
**Depends on:** T-002
**Description:** Checklist-style tracker for major mission milestones and records.

**Milestones:**
- [ ] Liftoff
- [ ] SRB separation
- [ ] Earth orbit achieved
- [ ] TLI burn complete — heading to the Moon
- [ ] Passed ISS altitude (408 km)
- [ ] Passed GPS satellite altitude (20,200 km)
- [ ] Passed geostationary orbit (35,786 km)
- [ ] Halfway to the Moon (192,200 km)
- [ ] Entered lunar sphere of influence
- [ ] Lunar flyby — closest approach
- [ ] Passed Apollo 13 record (400,171 km from Earth) — NEW RECORD
- [ ] Farthest point reached (~392,000 km from Earth + 7,600 km beyond Moon)
- [ ] Return trajectory established
- [ ] Halfway home
- [ ] Re-entry interface (120 km altitude)
- [ ] Parachute deployment
- [ ] Splashdown
- [ ] Crew recovery

**Record badges:**
- Victor Glover: First person of color beyond LEO
- Christina Koch: First woman beyond LEO
- Jeremy Hansen: First non-American on lunar mission
- Reid Wiseman: Oldest person beyond LEO
- Crew: First humans beyond LEO since Apollo 17 (December 1972)

**Features:**
- Checkbox style with animated completion
- Record badges appear when relevant milestone is hit
- Configurable via data/config.json (mark milestones as complete)

**Acceptance criteria:**
- All milestones listed
- Completed/upcoming visual states
- Record badges prominent and celebratory
- Configurable status

---

## [x] T-014 — News feed page
**Completed:** 2026-04-01 — Color-coded source badges, relative timestamps, excerpts, empty state

**Priority:** P1
**Depends on:** T-002, T-004
**Description:** Live news feed page showing Artemis-related articles.

**Features:**
- Article cards: title, source, timestamp, excerpt
- Source badges with colors per outlet
- Chronological (newest first)
- Last updated indicator
- Click to open article in new tab
- Filter by source (optional)

**Acceptance criteria:**
- Reads from data/news.json
- Clean, readable card layout
- Source attribution clear
- Responsive
- Handles empty state gracefully

---

## [x] T-015 — Historical context component
**Completed:** 2026-04-01 — Live counter since Apollo 17, mini timeline, stat cards, inspiring presentation

**Priority:** P2
**Depends on:** T-002
**Description:** "Return to the Moon" historical context panel.

**Features:**
- Hero text: "First crewed mission beyond LEO since Apollo 17 — December 19, 1972"
- Live counter: days/years since Apollo 17 (calculate from Dec 19, 1972)
- Comparison with Apollo 8 (first crewed lunar orbit, Dec 1968)
- Brief timeline: Apollo 8 → Apollo 11 → Apollo 17 → Artemis I → Artemis II
- Key stat cards: 53+ years since Apollo 17, 4 crew vs 3 on Apollo, first woman, first person of color

**Acceptance criteria:**
- Live counter updates
- Historically accurate data
- Inspiring, not dry — this is a momentous occasion
- Compact enough to fit in a sidebar or section

---

## [x] T-016 — NASA TV livestream embed
**Completed:** 2026-04-01 — YouTube embed with show/hide toggle, configurable video ID, offline placeholder

**Priority:** P2
**Depends on:** T-002
**Description:** Embedded NASA TV YouTube livestream with toggle.

**Features:**
- YouTube iframe embed for NASA TV live stream
- Channel: NASA (youtube.com/nasa) — the livestream URL is typically `https://www.youtube.com/embed/21X5lGlDOfg` but changes per event
- Configurable video ID in data/config.json
- Show/hide toggle (default: hidden to save bandwidth)
- Placeholder when stream is offline

**Acceptance criteria:**
- YouTube embed works
- Toggle show/hide
- Video ID configurable
- Fallback state when no stream active

---

## [x] T-017 — Navigation & page routing
**Completed:** 2026-04-01 — All 6 pages routed, responsive nav, mission phase badge, mobile menu, 404 page

**Priority:** P0
**Depends on:** T-002
**Description:** Set up all pages and navigation.

**Pages:**
1. `/` — Home (countdown + status overview)
2. `/mission/` — Mission tracker (trajectory + day-by-day timeline)
3. `/launch/` — Launch day (pre-launch timeline + launch events)
4. `/crew/` — Crew profiles
5. `/news/` — News feed
6. `/status/` — Data health & config status

**Navigation:**
- Responsive nav bar with mission phase indicator
- Active page highlighting
- Mobile hamburger menu
- Mission phase badge in nav (PRE-LAUNCH / LAUNCH DAY / IN TRANSIT / LUNAR FLYBY / RETURNING / SPLASHDOWN)

**Acceptance criteria:**
- All pages routed and accessible
- Nav works on mobile and desktop
- Mission phase indicator in nav
- 404 page

---

## [x] T-018 — Config system & mission phase management
**Completed:** 2026-04-01 — data/config.json with all mission state, layout reads phase for nav indicator

**Priority:** P0
**Depends on:** T-001
**Description:** Central config system that controls the entire dashboard state.

**data/config.json:**
```json
{
  "launchDate": "2025-09-01T12:00:00-04:00",
  "missionPhase": "prelaunch",
  "missionDay": 0,
  "backupWindows": ["2025-09-02", "2025-09-03", "2025-09-04", "2025-09-05"],
  "goNoGo": {
    "vehicle": "go",
    "groundSystems": "go",
    "crewHealth": "go",
    "rangeSafety": "go",
    "flightSoftware": "go",
    "recoveryWeather": "go"
  },
  "completedMilestones": [],
  "completedLaunchEvents": [],
  "completedTimelineEvents": [],
  "nasaTvVideoId": "21X5lGlDOfg",
  "holdMessage": null,
  "scrubMessage": null
}
```

**Features:**
- All manual states controlled via this single file
- GitHub Actions workflow: edit config.json → push → auto-rebuild dashboard
- Mission phase determines which components are visible/prominent
- Phase transitions change the overall dashboard layout emphasis

**Acceptance criteria:**
- Config drives all manual state
- Changing config + push triggers rebuild
- Dashboard adapts to mission phase
- Well-documented config fields

---

## [x] T-019 — Data fetch orchestrator & GitHub Actions
**Completed:** 2026-04-01 — fetch-all.ts orchestrator, hourly cron, diff-check before commit, deploy after data update

**Priority:** P0
**Depends on:** T-003, T-004, T-018
**Description:** Orchestrate all data fetching in a single script, wire into GitHub Actions cron.

**Scripts:**
- `scripts/fetch-all.ts` — runs all fetch scripts in sequence
- `scripts/fetch-weather.ts` (T-003)
- `scripts/fetch-news.ts` (T-004)

**GitHub Actions cron schedule:**
- Every 15 minutes during active mission (configurable)
- Every hour during pre-launch
- Workflow: fetch → check diff → commit if changed → build → deploy

**Acceptance criteria:**
- Single `npm run fetch` command runs everything
- GitHub Actions cron works
- Only commits when data actually changed
- Build + deploy after data commit
- Error in one fetch doesn't break others

---

## [x] T-020 — Final polish, performance & README
**Completed:** 2026-04-01 — SEO meta tags, OG image, ARIA labels, README, 468K total build output

**Priority:** P2
**Depends on:** T-001 through T-019
**Description:** Final polish pass on the entire dashboard.

**Tasks:**
- Performance audit: ensure fast load, minimal JS, optimized images
- Accessibility: proper ARIA labels, keyboard navigation, contrast ratios
- SEO: meta tags, Open Graph, favicon
- README.md: project description, screenshot, tech stack, how to contribute
- Test all pages on mobile, tablet, desktop
- Verify GitHub Pages deployment works end-to-end
- Add loading states for data-dependent components
- Verify all links and navigation work

**Acceptance criteria:**
- Lighthouse score > 90 for performance
- All pages work on mobile
- README is professional and complete
- No console errors
- Favicon and OG image set
