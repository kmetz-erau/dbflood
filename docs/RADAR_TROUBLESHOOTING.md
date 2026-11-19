# NOAA nowCOAST WMS radar troubleshooting (v8)

The radar overlay uses NOAA nowCOAST WMS 1.1.1. It does not use TMS or Iowa Mesonet.

1. Verify the deployed sidebar says **NOAA nowCOAST · WMS radar mosaic**. If not, the old code is deployed.
2. Open browser developer tools > Network; enable the radar toggle; filter for `nowcoast`.
3. Inspect the GetMap response status and content type. A WMS XML ServiceException indicates an invalid layer, projection, or server issue, not a MapLibre TMS problem.
4. If requests fail due to CORS or 404, confirm the live NOAA service capabilities and layer names before changing the code.
5. Radar reflectivity is not rainfall accumulation or flood depth. Do not use this dashboard for emergency decisions.

Live NOAA service connectivity was not validated when this archive was created.
