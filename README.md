# GTA 6 Trophy Guide & Platinum Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/edisonradit93/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/edisonradit93/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, responsive, zero-dependency web application and interactive guide for all 55 Grand Theft Auto VI trophies on PlayStation 5.

## Features
- **Official 55 Trophies:** Complete official trophy list (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with exact descriptions, grades, and tracking counters.
- **Progress Tracking & Persistence:** Check off earned trophies with instant progress percentage, trophy counters, and localStorage auto-save.
- **Platinum Roadmap:** 4-stage sequential walkthrough designed to minimize playthroughs and avoid missing time-sensitive objectives.
- **Missable Trophy Warnings:** Prominent flags and alerts for missable storyline events and point-of-no-return missions.
- **Cited Field Guides:** Detailed walkthrough steps and strategies citing official Leonida records, police logs, and vetted guide archives.
- **Spoiler Protection:** Toggleable spoiler shield to protect secret and story-driven trophy descriptions until you are ready.
- **Search & Deep Filters:** Instant client-side search by name/description, filtered by category (Story, Missable, Collectibles, Activities) or grade.
- **Export & Import:** Full JSON backup and restore capabilities for progress data.

## Running Locally
```bash
node serve.ts
```
Then open `http://localhost:8080` in your browser.

## Scorer & Output
Build the judge dossier and static package:
```bash
node main.ts
```

## License
MIT
