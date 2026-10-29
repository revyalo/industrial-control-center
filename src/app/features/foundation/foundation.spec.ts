import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MachineService } from '../../core/services/machine.service';
import { MachineDashboard } from './machine-dashboard';
import { TelemetryDisplay } from './telemetry-display';
describe('Reconstructed exercise', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('emits at 2 seconds and freezes telemetry after stopping', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [MachineService] });
    const machine = TestBed.inject(MachineService);
    const states: number[] = [];
    const subscription = machine.state$.subscribe((s) => states.push(s.temperature));
    expect(machine.state().status).toBe('STOPPED');
    machine.startMachine();
    vi.advanceTimersByTime(1999);
    expect(states).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(states).toHaveLength(3);
    expect(machine.state().rpm).toBeGreaterThan(0);
    machine.stopMachine();
    const count = states.length;
    vi.advanceTimersByTime(10000);
    expect(states).toHaveLength(count);
    expect(machine.state().rpm).toBe(0);
    subscription.unsubscribe();
  });
  it('connects child outputs to the parent service', async () => {
    const fixture = TestBed.createComponent(MachineDashboard);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.machine.state().status).toBe('RUNNING');
    expect(buttons[0]!.disabled).toBe(true);
    buttons[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.machine.state().status).toBe('STOPPED');
  });
  it('marks temperatures over 80 °C and errors visually', async () => {
    const fixture = TestBed.createComponent(TelemetryDisplay);
    fixture.componentRef.setInput('state', { status: 'RUNNING', temperature: 81, rpm: 1400 });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.basic-motor').classList.contains('danger')).toBe(
      true,
    );
    fixture.componentRef.setInput('state', { status: 'ERROR', temperature: 30, rpm: 0 });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.basic-motor').classList.contains('danger')).toBe(
      true,
    );
  });
});
