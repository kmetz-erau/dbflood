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
