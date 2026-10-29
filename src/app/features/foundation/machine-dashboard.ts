import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MachineService } from '../../core/services/machine.service';
import { TelemetryDisplay } from './telemetry-display';
import { ControlPanel } from './control-panel';
@Component({
  selector: 'app-machine-dashboard',
  imports: [TelemetryDisplay, ControlPanel],
  providers: [MachineService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">FUNCTIONAL RECONSTRUCTION</p>
        <h1>The original brief, rebuilt.</h1>
        <p class="subtitle">A new implementation of the exercise's functional requirements.</p>
      </div>
      <span class="badge">Reference exercise</span>
    </div>
    <div class="foundation-layout">
      <app-telemetry-display [state]="machine.state()" /><app-control-panel
        [running]="machine.state().status === 'RUNNING'"
        (start)="machine.startMachine()"
        (stop)="machine.stopMachine()"
      />
    </div>
    <p class="footnote">
      Isolated reference simulation · RxJS · 2-second cadence · HTML + CSS · No original source code
      recovered
    </p>`,
  styles: `
    .foundation-layout {
      display: flex;
      gap: 24px;
      align-items: stretch;
    }
    .footnote {
      margin-top: 24px;
      color: var(--muted);
      font-size: 12px;
    }
    @media (max-width: 700px) {
      .foundation-layout {
        flex-direction: column;
      }
    }
  `,
})
export class MachineDashboard {
  readonly machine = inject(MachineService);
}
