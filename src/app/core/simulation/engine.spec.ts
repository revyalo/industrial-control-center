import { describe, expect, it } from 'vitest';
import { SimulationEngine, validateConfig } from './engine';
import { DEFAULT_CONFIG, HISTORY_LIMIT, MAX_RPM } from '../../models/industrial';
const time = 180000;
describe('Industrial simulation', () => {
  it('is reproducible with the same seed and timestamp', () => {
    expect(new SimulationEngine(42).createFleet(time)).toEqual(
      new SimulationEngine(42).createFleet(time),
    );
    expect(new SimulationEngine(7).createFleet(time)).not.toEqual(
      new SimulationEngine(42).createFleet(time),
    );
  });
  it('ramps speed and prevents invalid targets and unsafe restarts', () => {
    const e = new SimulationEngine();
    let s = e.createFleet(time);
    s = e.command(s, 'M-04', { type: 'start' }, DEFAULT_CONFIG);
    s = e.step(s, time + 2000, DEFAULT_CONFIG);
    expect(s.machines[3]!.rpm).toBeGreaterThan(0);
    expect(s.machines[3]!.rpm).toBeLessThan(600);
    expect(e.command(s, 'M-04', { type: 'target', rpm: NaN }, DEFAULT_CONFIG)).toBe(s);
    s = e.command(s, 'M-04', { type: 'stop' }, DEFAULT_CONFIG);
    expect(s.machines[3]!.rpm).toBe(0);
  });
  it('raises warning, shuts down on heat, and recovers without automatic restart', () => {
    const e = new SimulationEngine();
    let s = e.createFleet(time);
    s = e.command(s, 'M-01', { type: 'fault', fault: 'overheat' }, DEFAULT_CONFIG);
    expect(s.machines[0]!.status).toBe('WARNING');
    expect(s.alerts[0]!.severity).toBe('warning');
    let tick = 1;
    for (; tick <= 30 && s.machines[0]!.status !== 'ERROR'; tick++)
      s = e.step(s, time + tick * 2000, DEFAULT_CONFIG);
    expect(s.machines[0]!.status).toBe('ERROR');
    expect(s.machines[0]!.rpm).toBe(0);
    expect(e.command(s, 'M-01', { type: 'start' }, DEFAULT_CONFIG)).toBe(s);
    s = e.command(s, 'M-01', { type: 'reset' }, DEFAULT_CONFIG);
    expect(s.machines[0]!.recovering).toBe(true);
    for (let i = tick; i <= tick + 24; i++) s = e.step(s, time + i * 2000, DEFAULT_CONFIG);
    expect(s.machines[0]!.recovering).toBe(false);
    expect(s.machines[0]!.status).toBe('STOPPED');
  });
  it('bounds memory and values during 8 simulated hours', () => {
    const e = new SimulationEngine();
    let s = e.createFleet(time);
    for (let i = 1; i <= 14400; i++) s = e.step(s, time + i * 2000, DEFAULT_CONFIG);
    for (const m of s.machines) {
      expect(m.history.length).toBeLessThanOrEqual(HISTORY_LIMIT);
      expect(m.rpm).toBeGreaterThanOrEqual(0);
      expect(m.rpm).toBeLessThanOrEqual(MAX_RPM);
      expect(Number.isFinite(m.temperature)).toBe(true);
    }
    expect(s.machines[0]!.runtimeSeconds).toBe(28980);
    expect(s.alerts.length).toBeLessThanOrEqual(100);
  });
  it('does not grow stopped telemetry and validates configuration', () => {
    const e = new SimulationEngine();
    const s = e.createFleet(time);
    const next = e.step(s, time + 2000, DEFAULT_CONFIG);
    expect(next.machines[3]).toBe(s.machines[3]);
    expect(validateConfig(DEFAULT_CONFIG)).toBeNull();
    expect(validateConfig({ ...DEFAULT_CONFIG, warningTemperature: 99 })).toBeTruthy();
    expect(validateConfig({ ...DEFAULT_CONFIG, shutdownTemperature: 85 })).toBeTruthy();
    expect(validateConfig({ ...DEFAULT_CONFIG, rampRate: Infinity })).toBeTruthy();
  });
});
