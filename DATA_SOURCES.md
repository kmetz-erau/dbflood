# Data sources and limitations

| Source | Endpoint | Meaning | Caveat |
| --- | --- | --- | --- |
| NWS | `https://api.weather.gov/alerts/active?zone=FLC127` plus five community point queries | Active warnings for Volusia county zone and sampled locations | Zone and point coverage can differ; some alerts have no geometry; partial upstream failures can reduce coverage. |
| NOAA CO-OPS | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` | Observed station water levels | Candidate IDs must be verified; MLLW values are not flood depth. |
| Open-Meteo | `https://api.open-meteo.com/v1/forecast` | Hourly precipitation forecast | Forecast not observed; commercial use terms and attribution should be reviewed. |
| CARTO | `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` | Map style/tiles | Review attribution, usage limits and production licensing. |

Future candidate sources: NOAA NHC, USGS Water Services, FEMA NFHL, Volusia County emergency management, Florida 511 and local agency closure feeds. These are not yet integrated.

The dashboard intentionally does not assign a composite flood risk score: doing so responsibly requires validated thresholds, location-specific models, and authoritative data.

### NOAA/NWS radar overlay

NEXRAD-derived US composite reflectivity via Iowa Environmental Mesonet tiles: `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q/{z}/{x}/{y}.png`. Optional map overlay (not an official warning feed). Attribution: NOAA/NWS NEXRAD via Iowa Environmental Mesonet. Validate current tile service terms and operational availability before production use.
