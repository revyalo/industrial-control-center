import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FleetStore } from './fleet.store';
describe('Fleet reactive state', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    localStorage.clear();
  });
  it('emits through RxJS and derives signals without duplicating fleet state', () => {
    vi.useFakeTimers();
    const fleet = TestBed.inject(FleetStore);
    let count = 0;
    const sub = fleet.state$.subscribe(() => count++);
    fleet.select('M-04');
    fleet.command({ type: 'start' });
    expect(fleet.selected().status).toBe('RUNNING');
    vi.advanceTimersByTime(2000);
    expect(fleet.selected().rpm).toBeGreaterThan(0);
    expect(count).toBe(3);
    fleet.command({ type: 'stop' });
    const history = fleet.selected().history;
    vi.advanceTimersByTime(4000);
    expect(fleet.selected().history).toBe(history);
    sub.unsubscribe();
  });
  it('acknowledges alerts independently of fault recovery', () => {
    const fleet = TestBed.inject(FleetStore);
    fleet.command({ type: 'fault', fault: 'mechanical' });
    expect(fleet.activeAlerts()).toHaveLength(1);
    fleet.acknowledge(fleet.alerts()[0]!.id);
    expect(fleet.activeAlerts()).toHaveLength(0);
    expect(fleet.selected().status).toBe('ERROR');
    fleet.command({ type: 'reset' });
    expect(fleet.selected().status).toBe('STOPPED');
    expect(fleet.selected().fault).toBe('none');
  });
  it('clears only telemetry buffers and ignores unknown machine selections', () => {
    const fleet = TestBed.inject(FleetStore);
    fleet.select('unknown');
    expect(fleet.selectedId()).toBe('M-01');
    const rpm = fleet.selected().rpm;
    fleet.clearHistory();
    expect(fleet.machines().every((m) => !m.history.length)).toBe(true);
    expect(fleet.selected().rpm).toBe(rpm);
  });
});
