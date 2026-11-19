# Architecture

## Data flow

Browser -> `/api/dashboard` (Next.js server) -> parallel feed adapters -> NWS, NOAA CO-OPS, Open-Meteo. The server normalizes fields and reports independent `ok`/`empty`/`unavailable` statuses. Client renders map markers and NWS polygons, alert cards, layer toggles, and data freshness.

## Design principles

1. **Provenance:** every feed has a source and retrieval time. Observations and forecasts are labeled differently.
2. **Fail independently:** one external source failing does not block other sources.
3. **No fabricated data:** absence of observations is not evidence of safety.
4. **Server aggregation:** external fetches are server-side, reducing CORS and allowing future API keys to remain private.
5. **Coastal context:** MLLW tide-gauge levels are not inundation depths or thresholds.

## Production evolution

- Split `lib/feeds.ts` into versioned adapters with schema validation (Zod), retries/backoff and circuit breakers.
- Add scheduled ingestion workers, Redis cache, PostgreSQL/PostGIS for geospatial event queries, TimescaleDB or partitions for time series, and object storage for historical data.
- Add Volusia County polygon filtering, NWS forecast zones and county alerts, official alert CAP parsing, and coastal hazard products.
- Add geocoded subscriptions with opt-in consent, notification deduplication, audit logs, and email/SMS vendor.
- Add OpenTelemetry tracing, Sentry error reporting, metrics and uptime checks.
- Enforce authentication and RBAC for any future admin endpoints, rate limits, API key isolation, CSP and data retention rules.

## Suggested production entities

`source(id, name, license, refresh_interval)`; `observation(id, source_id, geometry, observed_at, metric, value, unit, datum, quality)`; `alert(id, source_id, geometry, starts_at, expires_at, severity, text)`; `subscription(id, geofence, channels, consent_at)`; `delivery(id, subscription_id, alert_id, state, attempted_at)`.

## Data policy

No emergency guarantees. Do not claim flooding at a point from a gauge level alone. Display forecast horizons, timestamps, source errors, and uncertainty. Do not represent this independent site as an official warning authority.


## Project acknowledgment and licensing

This independent Daytona/Volusia implementation acknowledges Bay Flood Watch
(https://github.com/mcsplat/bay-flood) by Matt Carter as an upstream inspiration
and source of any portions explicitly adapted. The upstream project is MIT-licensed;
its copyright and permission notice are preserved in the repository `LICENSE`.
This project is not affiliated with or endorsed by the upstream author or project.
