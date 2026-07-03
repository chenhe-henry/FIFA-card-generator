# fifa-card-generator

Turn a GitHub profile into an EAFC26-style player card. Paste a GitHub username or
profile link and the app fetches public profile/repo/activity data, derives six card
stats (PAC/SHO/PAS/DRI/DEF/PHY) plus an overall rating, and renders an original
EAFC-inspired card you can download as a PNG. Runs entirely in the browser — GitHub's
public REST API is called directly from the client, no backend.

Live: https://chenhe-henry.github.io/FIFA-card-generator/

## Stack

- Vue 3 (`<script setup>`) + TypeScript + Vite
- Element Plus (auto-imported via `unplugin-vue-components` / `unplugin-auto-import`)
- Jest + `@vue/test-utils` for unit/component tests

## Commands

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build
pnpm test
```

## Position

Position (ST/LW/CAM/CM/CDM/CB/FB) is derived from the six stats: each position has a
weighted profile (e.g. CB weights DEF and PHY heavily, ST weights SHO and PAC), and the
card is assigned whichever position its stats best match. A very low overall rating
(< 45) reads as GK instead, since none of the six stats represent goalkeeping ability.
The account's top 1-2 GitHub languages are shown separately, as brand-colored badges in
the top-right corner (not the position) — stacked vertically when there are two.

## Card tiers

Tier is derived from the overall rating, with special faces above gold based on *why*
the account rates highly:

- **Bronze** (< 65), **Silver** (65–74), **Gold** (75–89)
- **TOTY** — OVR ≥ 90 driven by high recent activity (PAC ≥ 90); blue + gold face
- **Icon** — OVR ≥ 90 driven by long account tenure (PHY ≥ 90); cream/white face
- **TOTY Icon** — OVR ≥ 95 with both; blue + white face

Founder mode: double-click the title and enter the passphrase to reveal a card-face
dropdown that overrides the derived tier (visual only — the real stats are kept).

## Parked follow-up: LinkedIn cards

A LinkedIn source was scoped and deliberately **not built**. LinkedIn's self-serve
OAuth ("Sign In with LinkedIn using OpenID Connect") only returns `openid`, `profile`,
and `email` — i.e. name, photo, and email. Connections, followers, skills, positions,
and account age (the signals we'd map to card stats) are **not available** without
partner-tier API approval that this project can't obtain, and scraping them would
violate LinkedIn's ToS. A real OAuth login would also require a backend (the client
secret can't ship in frontend code), which conflicts with staying on GitHub Pages.
Without usable data, the feature was dropped in favour of keeping the app GitHub-only
and fully static. Revisit only if partner API access or a manual-entry card is wanted.

## Notes

- `@vue/vue3-jest` 29.2.6 has an upstream bug where typed `<script setup lang="ts">`
  templates compile to ESM output that Jest can't parse. This is fixed locally via a
  pnpm patch (`patches/@vue__vue3-jest.patch`, wired up in `pnpm-workspace.yaml`) —
  no workaround needed when writing component tests.
