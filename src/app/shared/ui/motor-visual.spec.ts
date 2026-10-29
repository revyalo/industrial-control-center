import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MotorVisual } from './motor-visual';
import { SimulationEngine } from '../../core/simulation/engine';
describe('Interactive machine view', () => {
  it('explains selectable parts and reflects thermal danger', async () => {
    const f = TestBed.createComponent(MotorVisual);
    const machine = new SimulationEngine().createFleet(180000).machines[0]!;
    f.componentRef.setInput('machine', machine);
    await f.whenStable();
    (f.nativeElement.querySelector('.fan-cover') as HTMLButtonElement).click();
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Rotation follows simulated RPM');
    f.componentRef.setInput('machine', { ...machine, temperature: 85 });
    await f.whenStable();
    expect(f.nativeElement.querySelector('.motor-stage').classList.contains('danger')).toBe(true);
    f.destroy();
  });
});
