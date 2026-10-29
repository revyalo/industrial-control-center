import { describe, expect, it } from 'vitest';
import { makePath, readingsToCsv } from './telemetry';
import { Reading } from '../../models/industrial';
const points: Reading[] = [
  { timestamp: 0, temperature: 20, rpm: 1000, power: 1, status: 'RUNNING' },
  { timestamp: 2000, temperature: 80, rpm: 2000, power: 4, status: 'WARNING' },
];
describe('Telemetry geometry and export', () => {
  it('creates bounded SVG coordinates and supports state charts', () => {
    expect(makePath(points, 'temperature', 0, 2000)).toBe('M48.00,144.00 L768.00,72.00');
    expect(makePath(points, 'status', 0, 2000)).toBe('M48.00,120.00 L768.00,72.00');
    expect(makePath([], 'rpm', 0, 0)).toBe('');
    expect(makePath(points, 'rpm', 0, 0)).not.toMatch(/NaN|Infinity/);
  });
  it('exports escaped CSV with units, UTC and explicit simulation provenance', () => {
    const csv = readingsToCsv('M-"01', points);
    expect(csv).toContain('"M-""01"');
    expect(csv).toContain('1970-01-01T00:00:02.000Z');
    expect(csv).toContain('browser simulation');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});
