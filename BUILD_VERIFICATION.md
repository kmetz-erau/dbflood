# Build verification and limitations

This release fixes the `PromiseFulfilledResult<Gauge | null>` inference failure reported by Vercel on commit `4bace59`. The station loader is explicitly annotated `Promise<Gauge | null>`. The shared GeoJSON geometry type is a discriminated union, and alert geometry is validated before rendering.

## Validation in this environment

- Repository source reviewed and ZIP integrity checked.
- `npm install` was attempted but timed out due to dependency retrieval.
- Therefore **lint, typecheck, unit tests, and production build were not successfully executed here**. A clean Vercel deployment is not guaranteed.

## Required checks in an environment with npm access

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions performs these checks on push and pull request. The workflow does not assume an npm lockfile exists.

## Operational limitations

- External NWS, NOAA and Open-Meteo feeds must be verified at runtime.
- NOAA stations should be checked against authoritative station metadata and live data availability.
- NWS point queries are samples, not complete countywide spatial coverage. Partial NWS endpoint failures are reported as unavailable instead of falsely implying zero warnings.
- This is not an official emergency warning system.
