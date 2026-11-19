import { describe, expect, it } from 'vitest';
import { isFloodRelevant, mergeAlerts } from '../lib/alerts';

describe('NWS alert normalization', () => {
  it('filters flood-relevant events', () => {
    expect(isFloodRelevant('Storm Surge Warning')).toBe(true);
    expect(isFloodRelevant('Flash Flood Warning')).toBe(true);
    expect(isFloodRelevant('Heat Advisory')).toBe(false);
  });
  it('deduplicates alerts from multiple coverage endpoints', () => {
    const f = { id: 'alert-1', properties: { event: 'Flood Warning', severity: 'Severe', areaDesc: 'Volusia' } };
    expect(mergeAlerts([[f], [f]]).map(a => a.id)).toEqual(['alert-1']);
  });
  it('orders high severity first', () => {
    const f = (id: string, severity: string) => ({ id, properties: { event: 'Flood Warning', severity } });
    expect(mergeAlerts([[f('minor', 'Minor'), f('extreme', 'Extreme')]]).map(a => a.id)).toEqual(['extreme', 'minor']);
  });
});

describe('alert geometry and fallback fields', () => {
  it('retains polygon geometry for map display', () => {
    const polygon = { type: 'Polygon' as const, coordinates: [[[-81, 29], [-80, 29], [-81, 30], [-81, 29]]] };
    const alerts = mergeAlerts([[{ id: 'polygon-1', properties: { event: 'Flood Warning' }, geometry: polygon }]]);
    expect(alerts[0].polygon).toEqual(polygon);
  });
  it('ignores null geometry and non-flood events', () => {
    const alerts = mergeAlerts([[{ id: 'no-geometry', properties: { event: 'Coastal Flood Advisory' }, geometry: null }, { id: 'heat', properties: { event: 'Heat Advisory' } }]]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].polygon).toBeUndefined();
  });
});

describe('geometry validation', () => {
  it('accepts valid MultiPolygon geometry', () => {
    const geometry = { type: 'MultiPolygon' as const, coordinates: [[[[-81, 29], [-80, 29], [-81, 30], [-81, 29]]]] };
    expect(mergeAlerts([[{ id: 'multi', properties: { event: 'Flood Warning' }, geometry }]])[0].polygon).toEqual(geometry);
  });
  it('rejects invalid coordinate nesting', () => {
    const geometry = { type: 'Polygon', coordinates: [1, 2, 3] };
    expect(mergeAlerts([[{ id: 'bad', properties: { event: 'Flood Warning' }, geometry }]])[0].polygon).toBeUndefined();
  });
});
