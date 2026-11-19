export type SourceStatus = 'ok' | 'empty' | 'unavailable';
export interface Feed<T> { source: string; fetchedAt: string; status: SourceStatus; data: T[]; error?: string }
export interface Alert { id: string; event: string; severity: string; headline: string; description: string; instruction: string; expires: string | null; area: string; url: string; polygon?: ({ type: 'Polygon'; coordinates: number[][][] } | { type: 'MultiPolygon'; coordinates: number[][][][] }) }
export interface Gauge { id: string; name: string; lat: number; lon: number; waterLevelFt: number; observedAt: string; datum: string }
export interface RainPoint { name: string; lat: number; lon: number; hourlyRainMm: number; next6hMm: number; observedAt: string }
export interface DashboardData { alerts: Feed<Alert>; gauges: Feed<Gauge>; rainfall: Feed<RainPoint>; generatedAt: string }
