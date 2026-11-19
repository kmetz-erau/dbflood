import { describe, expect, it } from 'vitest';
import { alertIsFloodRelated, mmToInches } from '../lib/format';
describe('utility functions', () => { it('converts precipitation', () => expect(mmToInches(25.4)).toBeCloseTo(1)); it('matches relevant alerts', () => { expect(alertIsFloodRelated('Coastal Flood Warning')).toBe(true); expect(alertIsFloodRelated('Heat Advisory')).toBe(false); }); });
