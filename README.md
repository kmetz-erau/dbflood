# Daytona Flood Watch

> **Acknowledgment and upstream license notice**
>
> Daytona Flood Watch is an independent project inspired by and, where applicable,
> adapted from **[Bay Flood Watch](https://bayflood.watch/)** and its
> [open-source repository](https://github.com/mcsplat/bay-flood), by **Matt Carter**.
> Bay Flood Watch is licensed under the [MIT License](https://github.com/mcsplat/bay-flood/blob/main/LICENSE).
> The applicable upstream copyright and MIT permission notice are retained in this
> repository's `LICENSE` file. Please consult that file when copying, modifying, or
> redistributing portions derived from the upstream project.
>
> Daytona Flood Watch is a separate, unofficial implementation for the Daytona Beach
> and Volusia County area. It is not affiliated with, endorsed by, or an official
> product of Matt Carter, Bay Flood Watch, NOAA, the National Weather Service,
> Volusia County, or any emergency-management authority.

An independent, map-first public-information dashboard for Daytona Beach, Ormond Beach, Daytona Beach Shores, Port Orange, and New Smyrna Beach, Florida.

**Included:** Next.js 15 + React 19 + TypeScript, MapLibre map, NOAA CO-OPS coastal gauge observations, National Weather Service active flood-related alerts, Open-Meteo precipitation forecasts, source health states, responsive UI, refresh, tests, and deployment guidance.

## Run

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000. On Windows, copy `.env.example` to `.env.local` using File Explorer or PowerShell. The env file is optional.

```bash
npm run typecheck
npm run test
npm run build
```

## API

- `GET /api/dashboard` — normalized `{ alerts, gauges, rainfall, generatedAt }` data, with independent source statuses.
- `GET /api/health` — process health.

## What is live versus planned?

The starter connects to live public APIs when deployed with outbound network access. It is **not** an emergency notification service. Map basemap tiles require internet. No API key is required for the included feeds. There is **no** simulated live sensor data. Missing/unavailable data is shown as unavailable or empty, never as a zero-water or safe condition.

NOAA station IDs are candidates, not guaranteed live feeds. A station is displayed only if NOAA returns a valid water-level observation. NOAA levels use MLLW and **cannot** be interpreted as street flood depth. Open-Meteo precipitation is a **forecast**, not a measured rainfall sensor. NWS alerts are queried using the Volusia County zone and five representative community points. Partial upstream failures or zone-only warnings may limit coverage. The map only renders NWS polygons when supplied; many NWS alerts use zones without explicit geometry.

## Production readiness

Before using this as a public operational tool, verify NOAA station coverage, add NWS county/zone coverage for the entire service area, ingest authoritative evacuation and road-closure information, establish source usage terms and basemap licensing, add monitoring, security controls, automated adapter tests, and clear accessibility testing. See `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, and `docs/DATA_SOURCES.md`.

## Deployment

Deploy to Vercel or any Node-compatible Next.js host. `npm run build` then `npm run start`. Set `NEXT_PUBLIC_MAP_STYLE` if using a licensed basemap provider. Ensure public API requests are allowed from your hosting environment. Add a domain, rate limiting, and uptime monitoring before promotion.

## License and attribution

This project is distributed under the MIT License; see [`LICENSE`](LICENSE). The
`LICENSE` file also reproduces the upstream MIT copyright and permission notice for
Bay Flood Watch (Copyright (c) 2026 Matt Carter), as required for copies or
substantial portions of upstream software. Attribution does not imply endorsement.

Bay Flood Watch: https://github.com/mcsplat/bay-flood

Daytona Flood Watch is an independent, unofficial project and is not affiliated
with or endorsed by Bay Flood Watch, Matt Carter, NOAA, NWS, Volusia County, or any
emergency authority. It is not an emergency warning service. Always follow official
instructions from local emergency management and the National Weather Service.

## Release 3: Build fixes and deployment

The NWS adapter now merges Volusia County zone `FLC127` with five representative community point queries and deduplicates alerts. It treats total upstream failure as unavailable, not as no alerts. Individual query failures can still reduce coverage, so the public launch checklist includes operational monitoring.

Additional resources: [Volusia County Emergency Management](https://www.volusia.org/services/public-protection/emergency-management/), [National Hurricane Center](https://www.nhc.noaa.gov/), [Florida 511](https://fl511.com/), and [NWS Melbourne](https://www.weather.gov/mlb/). These are official external resources, **not** integrated live map layers.

See `docs/DEPLOYMENT.md` for GitHub, Vercel, and smoke-test instructions. CI is configured in `.github/workflows/ci.yml`.

## Build troubleshooting and verification

The Vercel lint failure caused by explicit `any` in `lib/alerts.ts` and `lib/feeds.ts` has been addressed using typed upstream response interfaces. The CSS `align-items: end` warning has also been changed to `flex-end`. The NOAA adapter now rejects empty or missing observations, and the Open-Meteo adapter does not incorrectly substitute the first forecast hour if all available hours are in the past.

Before pushing to production, run `npm install`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. In this authoring environment dependency installation timed out, so these commands **have not been verified to pass**. CI will run them after upload.

The NWS query set is best-effort, not a guaranteed complete countywide warning service; individual query failures can lead to incomplete results. Always consult official warnings.


## Verification notes

See [BUILD_VERIFICATION.md](docs/BUILD_VERIFICATION.md) for the latest build fixes, test commands, and limitations.

## v4 map updates

- Five configured NOAA CO-OPS stations (regional stations are included for coastal context, not local flood depth). Stations without valid latest observations do not appear.
- Rainfall forecasts are displayed in inches, converted from the upstream millimeter values by dividing by 25.4.
- Click an orange NWS alert polygon on the map to view its event, area, headline, description, instructions and official link. Alerts are also expandable in the sidebar for alerts without polygon geometry.
- NOAA observations are water levels relative to MLLW, **not** a measure of flooding at a street or property.

## NOAA radar (v8)

Radar uses NOAA nowCOAST MRMS base-reflectivity WMS 1.1.1 instead of the IEM TMS endpoint. The MapLibre raster source requests Web Mercator tile bounding boxes with `BBOX={bbox-epsg-3857}`. Observed reflectivity is not a rainfall forecast. Browser access, service availability, CORS, and the precise upstream layer name must be validated after deployment; live NOAA access was not available in the build environment.

### v8 verification marker
The sidebar must display `NOAA nowCOAST · WMS radar mosaic`. The source and layer IDs are `noaa-nowcoast-radar` and `noaa-nowcoast-radar-layer`. No Iowa Mesonet tile URL is used in the application.
