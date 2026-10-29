import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IndustrialMachine, MachineCommand } from '../../models/industrial';
import { Icon } from './icon';
import { ConfirmDialog } from './confirm-dialog';
@Component({
  selector: 'app-machine-controls',
  imports: [Icon, FormsModule, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="controls">
      <div class="control-label">
        <h3>Machine controls</h3>
        <span class="tag">MANUAL</span>
      </div>
      <p class="muted">Manage the selected machine's operation.</p>
      <div class="control-buttons">
        <button
          class="button primary"
          [disabled]="!canStart()"
          (click)="command.emit({ type: 'start' })"
        >
          <app-icon name="play" [size]="14" />Start machine</button
        ><button class="button" [disabled]="!isActive()" (click)="command.emit({ type: 'stop' })">
          <app-icon name="stop" [size]="14" />Stop
        </button>
      </div>
      @if (machine().recovering) {
        <p class="recovery" role="status">Cooling down. Start unlocks at a safe temperature.</p>
      }
      <div class="control-divider"></div>
      <form (ngSubmit)="applyTarget()">
        <div class="speed-heading">
          <label for="target-rpm">Target speed</label
          ><span class="speed-value"
            >{{ draftRpm() ?? machine().targetRpm }} <small>RPM</small></span
          >
        </div>
        <input
          id="target-rpm"
          type="range"
          min="300"
          max="3000"
          step="50"
          [ngModel]="draftRpm() ?? machine().targetRpm"
          (ngModelChange)="draftRpm.set(+$event)"
          name="rpm"
          aria-label="Target speed in RPM"
        />
        <div class="range-labels"><span>300 RPM</span><span>3,000 RPM</span></div>
        <button
          class="button apply-speed"
          [disabled]="draftRpm() === null || draftRpm() === machine().targetRpm"
        >
          Apply target speed<app-icon name="arrow" [size]="13" />
        </button>
      </form>
      <div class="control-divider"></div>
      <div class="reset-row">
        <span><strong>Controlled reset</strong><small>Clear faults & cool down safely</small></span
        ><button
          class="icon-button tooltip"
          aria-label="Reset machine"
          data-tooltip="Reset machine"
          (click)="command.emit({ type: 'reset' })"
        >
          <app-icon name="reset" [size]="16" />
        </button>
      </div>
      <div class="control-divider"></div>
      <div class="fault-tools">
        <label for="fault-type">FAULT SIMULATION</label>
        <div class="fault-row">
          <select
            id="fault-type"
            aria-label="Fault type"
            [ngModel]="fault()"
            (ngModelChange)="fault.set($event)"
          >
            <option value="overheat">Overheating</option>
            <option value="mechanical">Mechanical fault</option></select
          ><button
            class="button danger small"
            [disabled]="!isActive()"
            (click)="confirming.set(true)"
          >
            <app-icon name="warning" [size]="12" />Inject fault
          </button>
        </div>
      </div>
    </div>
    <app-confirm-dialog
      [open]="confirming()"
      title="Inject a simulated fault?"
      message="This intentionally changes the selected machine's simulation. Overheating raises its temperature and can trigger a safety shutdown. Reset the machine to recover safely."
      actionLabel="Inject fault"
      (closed)="confirming.set(false)"
      (confirmed)="command.emit({ type: 'fault', fault: fault() })"
    />`,
  styles: `
    .controls {
      padding: 22px;
    }
    .control-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .controls > p {
      font-size: 11px;
      margin-top: 9px;
    }
    .control-buttons {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }
    .control-buttons .primary {
      flex: 1;
    }
    .control-divider {
      height: 1px;
      background: var(--border);
      margin: 23px 0;
    }
    .speed-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .speed-value {
      font: 17px var(--mono);
    }
    .speed-value small {
      font: 9px var(--mono);
      color: var(--muted);
    }
    .range-labels {
      display: flex;
      justify-content: space-between;
      font: 8px var(--mono);
      color: var(--subtle);
      margin-top: 7px;
    }
    .apply-speed {
      width: 100%;
      justify-content: space-between;
      margin-top: 18px;
      font-size: 10px;
    }
    .reset-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .reset-row strong {
      font-size: 11px;
      font-weight: 400;
      display: block;
    }
    .reset-row small {
      display: block;
      font-size: 9px;
      color: var(--muted);
      margin-top: 5px;
    }
    .recovery {
      color: var(--amber);
      font-size: 10px;
    }
    .fault-tools > label {
      font: 8px var(--mono);
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .fault-row {
      display: flex;
      gap: 8px;
    }
    .fault-row select {
      min-width: 0;
      flex: 1;
      font-size: 10px;
      padding: 7px 8px;
    }
    .fault-row .button {
      font-size: 9px;
      padding: 7px 9px;
    }
  `,
})
export class MachineControls {
  readonly fault = signal<'overheat' | 'mechanical'>('overheat');
  readonly confirming = signal(false);
  private previousId = '';
  readonly machine = input.required<IndustrialMachine>();
  readonly command = output<MachineCommand>();
  readonly draftRpm = signal<number | null>(null);
  readonly isActive = computed(
    () => this.machine().status === 'RUNNING' || this.machine().status === 'WARNING',
  );
  readonly canStart = computed(
    () => this.machine().status === 'STOPPED' && !this.machine().recovering,
  );
  constructor() {
    effect(() => {
      const id = this.machine().id;
      if (id !== this.previousId) {
        this.previousId = id;
        this.draftRpm.set(null);
        this.confirming.set(false);
      }
    });
  }
  applyTarget(): void {
    const rpm = this.draftRpm();
    if (rpm !== null && rpm >= 300 && rpm <= 3000) {
      this.command.emit({ type: 'target', rpm });
      this.draftRpm.set(null);
    }
  }
}
