# Full platform roadmap

## Milestone 1 — Public map foundation (included)
- [x] Distinct Daytona/Volusia branding and responsive map-first UI
- [x] NWS flood-related alerts at Daytona Beach point
- [x] NOAA candidate tide gauges, validating observation availability
- [x] Open-Meteo six-hour precipitation forecasts for five communities
- [x] Map toggles, popups, feed statuses, health endpoint, baseline tests
- [ ] Verify data sources and build on production network

## Milestone 2 — Local hazard intelligence
- [ ] All Volusia County NWS forecast zones, polygon-based filtering
- [ ] Official NOAA station metadata discovery and surge thresholds
- [ ] NHC tropical cyclone forecasts and cone layers (with correct caveats)
- [ ] USGS real-time river/stream observations where applicable
- [ ] Official Volusia County road closures and evacuation zones, subject to data availability
- [ ] Daytona-area traffic cameras where licensing permits

## Milestone 3 — Historical context
- [ ] PostgreSQL/PostGIS ingestion and retention policy
- [ ] Historical high-water records and hurricane event timeline
- [ ] Storm playback and gauge charts with datum-aware comparisons
- [ ] Floodplain / FEMA NFHL reference overlays, labeled as long-term risk not live flooding

## Milestone 4 — Community notifications
- [ ] Opt-in geographic subscriptions, email/SMS verification
- [ ] Alert deduplication, delivery receipts, rate limits
- [ ] Multi-language and WCAG 2.2 AA accessibility testing
- [ ] Incident reporting only with moderation and clear unverified labels

## Milestone 5 — Production hardening
- [ ] Adapter contract/integration tests and end-to-end browser tests
- [ ] Observability, cache, rate limits, security review
- [ ] Load tests, graceful degraded states, basemap licensing
- [ ] Local agency consultation and emergency disclaimer review
