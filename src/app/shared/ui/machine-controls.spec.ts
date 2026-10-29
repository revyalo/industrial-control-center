import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MachineControls } from './machine-controls';
import { SimulationEngine } from '../../core/simulation/engine';
import { MachineCommand } from '../../models/industrial';
describe('Machine control interactions', () => {
  it('validates targets and resets pending values on machine changes', async () => {
    const f = TestBed.createComponent(MachineControls);
    const machines = new SimulationEngine().createFleet(180000).machines;
    f.componentRef.setInput('machine', machines[0]);
    await f.whenStable();
    const commands: MachineCommand[] = [];
    f.componentInstance.command.subscribe((c) => commands.push(c));
    f.componentInstance.draftRpm.set(4000);
    f.componentInstance.applyTarget();
    expect(commands).toHaveLength(0);
    f.componentInstance.draftRpm.set(2200);
    f.componentInstance.applyTarget();
    expect(commands).toEqual([{ type: 'target', rpm: 2200 }]);
    f.componentInstance.draftRpm.set(900);
    f.componentRef.setInput('machine', machines[1]);
    await f.whenStable();
    expect(f.componentInstance.draftRpm()).toBeNull();
    f.destroy();
  });
});
