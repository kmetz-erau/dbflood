import type { Alert } from './types';

export interface NwsAlertFeature {
  id?: string;
  properties?: {
    id?: string;
    event?: string;
    severity?: string;
    headline?: string;
    description?: string;
    instruction?: string;
    expires?: string | null;
    areaDesc?: string;
    '@id'?: string;
  };
  geometry?: unknown;
}

export function isFloodRelevant(event: string): boolean {
  return /flood|storm surge|coastal|hurricane|tropical storm|high surf|rip current/i.test(event);
}

function isPosition(value: unknown): value is number[] {
  return Array.isArray(value) && value.length >= 2 && value.every(n => typeof n === 'number' && Number.isFinite(n));
}

function isRing(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length >= 4 && value.every(isPosition);
}

function isPolygonCoordinates(value: unknown): value is number[][][] {
  return Array.isArray(value) && value.length > 0 && value.every(isRing);
}

function isPolygon(value: unknown): value is NonNullable<Alert['polygon']> {
  if (typeof value !== 'object' || value === null) return false;
  const geometry = value as { type?: unknown; coordinates?: unknown };
  if (geometry.type === 'Polygon') return isPolygonCoordinates(geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 && geometry.coordinates.every(isPolygonCoordinates);
  }
  return false;
}

export function normalizeAlert(feature: NwsAlertFeature): Alert {
  const p = feature.properties ?? {};
  return {
    id: String(feature.id ?? p.id ?? ''),
    event: String(p.event ?? 'Weather alert'),
    severity: String(p.severity ?? 'Unknown'),
    headline: String(p.headline ?? ''),
    description: String(p.description ?? ''),
    instruction: String(p.instruction ?? ''),
    expires: p.expires ?? null,
    area: String(p.areaDesc ?? ''),
    url: String(p['@id'] ?? feature.id ?? 'https://www.weather.gov/'),
    polygon: isPolygon(feature.geometry) ? feature.geometry : undefined,
  };
}

export function mergeAlerts(featureGroups: NwsAlertFeature[][]): Alert[] {
  const unique = new Map<string, Alert>();
  for (const group of featureGroups) {
    for (const feature of group) {
      if (!isFloodRelevant(String(feature?.properties?.event ?? ''))) continue;
      const alert = normalizeAlert(feature);
      if (alert.id) unique.set(alert.id, alert);
    }
  }
  const order: Record<string, number> = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
  return [...unique.values()].sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));
}
