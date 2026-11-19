# NOAA/NWS radar overlay

The dashboard displays NEXRAD-derived radar mosaic tiles distributed by Iowa Environmental Mesonet (IEM). It is not a NOAA-operated tile endpoint.

## Invalid TMS request

IEM `tile.py/1.0.0` serves tiles using TMS row numbering. MapLibre defaults to XYZ tile rows. The raster source must specify `scheme: 'tms'` so MapLibre flips the Y coordinate when requesting tiles.

## Operational checks

1. Enable the radar layer and open browser Developer Tools > Network.
2. Confirm the tile URL uses `ridge::USCOMP-N0Q` and that requests return images, not an `Invalid TMS request` text response.
3. If the upstream layer is retired or the distributor is unavailable, disable radar and investigate a supported alternate service.
4. Radar imagery is observed reflectivity, not a rainfall forecast or an indication of road safety.

This change fixes the known TMS/XYZ mismatch; live third-party tile availability still needs verification in the deployed browser.
