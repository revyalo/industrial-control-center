import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelemetryPanel } from './telemetry-panel';
import { FleetStore } from '../../core/state/fleet.store';
describe('Reactive telemetry presentation', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('freezes only the chart and preserves fleet history across view lifetimes', async () => {
    const fixture = TestBed.createComponent(TelemetryPanel);
    await fixture.whenStable();
    const panel = fixture.componentInstance;
    const fleet = TestBed.inject(FleetStore);
    const before = fleet.selected().history;
    panel.togglePause();
    await fixture.whenStable();
    expect(panel.snapshot()?.points).toBe(before);
    fleet.command({ type: 'stop' });
    await fixture.whenStable();
    expect(fleet.selected().history).not.toBe(before);
    expect(panel.snapshot()?.points).toBe(before);
    panel.togglePause();
    await fixture.whenStable();
    expect(panel.snapshot()).toBeNull();
    fixture.destroy();
    expect(fleet.selected().history.length).toBeGreaterThanOrEqual(before.length);
  });
  it('clears the frozen view when another machine is selected', async () => {
    const f = TestBed.createComponent(TelemetryPanel);
    await f.whenStable();
    f.componentInstance.togglePause();
    TestBed.inject(FleetStore).select('M-02');
    await f.whenStable();
    expect(f.componentInstance.snapshot()).toBeNull();
    f.destroy();
  });
});
