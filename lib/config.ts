export const DAYTONA = { lat: 29.2108, lon: -81.0228, zoom: 10.5 } as const;
export const STATIONS = [
  { id: '8721120', name: 'Daytona Beach (NOAA)', lat: 29.227, lon: -81.009 },
  { id: '8721604', name: 'Ponce de Leon Inlet (NOAA)', lat: 29.08, lon: -80.928 },
] as const;
// Station coordinates are map approximations, not authoritative NOAA station metadata.
// A station is rendered only after NOAA returns a valid observation.
export const FORECAST_POINTS = [
  { name: 'Daytona Beach', lat: 29.2108, lon: -81.0228 },
  { name: 'Ormond Beach', lat: 29.2858, lon: -81.0559 },
  { name: 'Daytona Beach Shores', lat: 29.1761, lon: -80.9828 },
  { name: 'Port Orange', lat: 29.1383, lon: -80.9956 },
  { name: 'New Smyrna Beach', lat: 29.0258, lon: -80.9270 },
] as const;
