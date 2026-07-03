# fifa-card-generator

Vue 3 + TypeScript web app, built mobile-responsive with Element Plus.

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

## Notes

- `@vue/vue3-jest` 29.2.6 has an upstream bug where typed `<script setup lang="ts">`
  templates compile to ESM output that Jest can't parse. This is fixed locally via a
  pnpm patch (`patches/@vue__vue3-jest.patch`, wired up in `pnpm-workspace.yaml`) —
  no workaround needed when writing component tests.
