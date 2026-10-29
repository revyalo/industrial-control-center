import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { Alerts } from './alerts';
import { FleetStore } from '../../core/state/fleet.store';
describe('Alert filtering', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('combines machine, severity and acknowledgement filters', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(Alerts);
    const fleet = TestBed.inject(FleetStore);
    fleet.command({ type: 'fault', fault: 'overheat' }, 'M-01');
    fleet.command({ type: 'fault', fault: 'mechanical' }, 'M-02');
    await f.whenStable();
    f.componentInstance.severity.set('warning');
    expect(f.componentInstance.visible()).toHaveLength(1);
    f.componentInstance.machine.set('M-02');
    expect(f.componentInstance.visible()).toHaveLength(0);
    f.componentInstance.severity.set('error');
    expect(f.componentInstance.visible()).toHaveLength(1);
    fleet.acknowledge(f.componentInstance.visible()[0]!.id);
    f.componentInstance.acknowledgement.set('open');
    expect(f.componentInstance.visible()).toHaveLength(0);
    f.destroy();
  });
});
