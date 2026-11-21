# GTA VI Platinum Compendium & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/edisonradit93/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/edisonradit93/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, responsive, zero-dependency single-page web application and interactive guide for all 55 Grand Theft Auto VI trophies on PlayStation 5.

## Features

- **Complete Official 55 Trophies:** Comprehensive coverage of all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with verified descriptions, point values, hidden flags, and categorized metadata.
- **Vice City Sunset Aesthetics:** Dark synthwave theme styled with Vice City neon pink (`#ff2a85`), cyan (`#00e5ff`), gold (`#ffb800`), silver (`#94a3b8`), and bronze (`#d97706`).
- **Real-Time Progress & Score Tracking:** Interactive checkboxes with live percentage recalculation, trophy counters, and PSN points totals (up to 1,350 points) saved persistently to `localStorage`.
- **Sequential 4-Stage Platinum Roadmap:** Optimized step-by-step path designed to minimize playthroughs:
  - *Stage 1:* Main Story & Avoid Missables
  - *Stage 2:* Strangers & Freaks Side Missions (8 strands)
  - *Stage 3:* Leonida 100% Collectibles & Map Exploration
  - *Stage 4:* Miscellaneous Stunts and Cleanup
- **Missable Trophy Warnings & Save Protocols:** Prominent danger badges and strategic save recommendations (Slots 1, 2, 3) to prevent locking out companion and branching storyline milestones.
- **Detailed Tactical Walkthroughs with Cited Sources:** Expandable accordion guides for every trophy citing verified archives (Leonida Police Records, VCPD Archives, FAA Incident Reports, Syndicate Logs).
- **Spoiler Shield:** Toggleable spoiler protection keeping hidden story milestones blurred until clicked or unlocked.
- **Search & Multi-Dimensional Filters:** Instant search by keyword, filterable by grade (Platinum, Gold, Silver, Bronze), category (Story, Missables, Collectibles, Activities), and status (Earned, Unearned).
- **Full Keyboard Navigation:**
  - `/` Focus search input
  - `Esc` Clear search and reset all filters
  - `T` Switch to Trophies tab
  - `R` Switch to Roadmap tab
  - `M` Filter directly to Missables
- **Data Export & Import:** Full JSON backup and restore capabilities for user save data.

## Running Locally

Serve the application locally with Node 22 (no external dependencies or build step required):

```bash
node serve.ts
```

Then navigate to `http://localhost:8080` in your web browser.

## Building Dossier & Validation

To test and compile the static bundle and judge dossier:

```bash
powershell -Command "$env:MAKEFUN_OUTPUT_DIR='out'; node main.ts"
```

This validates that all 4 screenshots exist, copies static web assets into `out/`, and compiles `out/dossier.json`.

## License

MIT License. See [LICENSE](LICENSE) for details.
