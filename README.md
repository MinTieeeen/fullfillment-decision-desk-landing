# Optiflo — landing page

Landing page + interactive prototype for IT Consultant Challenge 2026 (Round 1). Bilingual (VI / EN), React + Vite + TypeScript, deployed to GitHub Pages.

Pages: Home · Current model (`/business`) · Prototype (`/demo`) · Roadmap. Routing uses `HashRouter`, so URLs look like `/#/demo` and reloads work on GitHub Pages.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173/fullfillment-decision-desk-landing/
npm test         # engine + workflow unit tests (incl. the 7 synthetic checks)
npm run build    # type-check + production build into dist/
```

## Where things live

| Path | What |
|---|---|
| `src/engine/engine.ts` | Decision engine: allocatable stock, source filtering, enumeration, constraint checks, dominance filter, option selection, nearest-first baseline |
| `src/engine/checks.ts` | The 7 synthetic checks (also shown in the prototype) |
| `src/workflow/confirm.ts` | Confirmation saga: revalidate → hold → book → release, with compensation |
| `src/data/scenarios.ts` | Synthetic network (Store A / B / Warehouse C), demo scenarios, customer fee policy |
| `src/data/business.ts` | Business activity map + deep dives (from `docs/Business.md`) |
| `src/i18n/en.ts`, `vi.ts` | All page copy |

Expected numbers (asserted by tests): baseline 600 SEK; options 480 / 720 / 930 SEK; customer fees 398 / 747 / 1,047 SEK.

## Deploy to GitHub Pages

1. Repository: `MinTieeeen/fullfillment-decision-desk-landing` (the name must match `base` in `vite.config.ts`).
2. Push to the `master` branch.
3. In the repository: **Settings → Pages → Source = GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes to `https://mintieeeen.github.io/fullfillment-decision-desk-landing/`.

If the repository has a different name, change `base` in `vite.config.ts` to `'/<repo-name>/'`.
