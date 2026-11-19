import type { Alert } from './types';

export function isFloodRelevant(event: string): boolean {
  return /flood|storm surge|coastal|hurricane|tropical storm|flash flood|high surf|rip current/i.test(event);
}

export function normalizeAlert(feature: any): Alert {
  const p = feature.properties ?? {};
  return {
    id: String(feature.id ?? p.id ?? ''), event: String(p.event ?? 'Weather alert'),
    severity: String(p.severity ?? 'Unknown'), headline: String(p.headline ?? ''),
    description: String(p.description ?? ''), instruction: String(p.instruction ?? ''),
    expires: p.expires ?? null, area: String(p.areaDesc ?? ''),
    url: String(p['@id'] ?? feature.id ?? 'https://www.weather.gov/'),
    polygon: feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon' ? feature.geometry : undefined,
  };
}

export function mergeAlerts(featureGroups: any[][]): Alert[] {
  const unique = new Map<string, Alert>();
  for (const group of featureGroups) {
    for (const feature of group) {
      if (!isFloodRelevant(String(feature?.properties?.event ?? ''))) continue;
      const alert = normalizeAlert(feature);
      if (alert.id) unique.set(alert.id, alert);
    }
  }
  return [...unique.values()].sort((a, b) => {
    const order: Record<string, number> = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
  });
}
