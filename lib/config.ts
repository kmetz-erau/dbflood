export const DAYTONA = { lat: 29.2108, lon: -81.0228, zoom: 10.5 } as const;
export const STATIONS = [
  { id: '8721120', name: 'Daytona Beach', lat: 29.227, lon: -81.009 },
  { id: '8721604', name: 'Trident Pier, Port Canaveral', lat: 28.4158, lon: -80.5931 },
  { id: '8720218', name: 'Mayport (Jacksonville)', lat: 30.3982, lon: -81.4279 },
  { id: '8720030', name: 'Fernandina Beach', lat: 30.6714, lon: -81.4658 },
  { id: '8722670', name: 'Lake Worth Pier', lat: 26.6128, lon: -80.0342 },
] as const;
// Regional reference stations may lie outside Volusia County. NOAA metadata
// overrides approximate coordinates, and stations without observations are omitted.
export const FORECAST_POINTS = [
  { name: 'Daytona Beach', lat: 29.2108, lon: -81.0228 },
  { name: 'Ormond Beach', lat: 29.2858, lon: -81.0559 },
  { name: 'Daytona Beach Shores', lat: 29.1761, lon: -80.9828 },
  { name: 'Port Orange', lat: 29.1383, lon: -80.9956 },
  { name: 'New Smyrna Beach', lat: 29.0258, lon: -80.9270 },
] as const;
