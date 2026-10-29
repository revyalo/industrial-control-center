import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MachineState } from '../../models/machine-state';
@Component({
  selector: 'app-telemetry-display',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="panel foundation-display" aria-label="Machine telemetry">
    <h2>Telemetry display</h2>
    <div class="basic-motor" [class.danger]="state.status === 'ERROR' || state.temperature > 80">
      <div class="basic-led" [class.running]="state.status === 'RUNNING'"></div>
      <div class="basic-fan" [class.spinning]="state.status === 'RUNNING'">✣</div>
      <span>MOTOR / 01</span>
    </div>
    <dl class="readings">
      <div>
        <dt>Temperature</dt>
        <dd>{{ state.temperature | number: '1.1-1' }} °C</dd>
      </div>
      <div>
        <dt>Speed</dt>
        <dd>{{ state.rpm }} RPM</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{{ state.status }}</dd>
      </div>
    </dl>
  </article>`,
  styles: `
    :host {
      flex: 1;
      min-width: 0;
    }
    .foundation-display {
      padding: 28px;
    }
    .basic-motor {
      border: 3px solid var(--border);
      border-radius: 12px;
      width: 240px;
      max-width: 100%;
      height: 155px;
      margin: 36px auto;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      position: relative;
      background: var(--surface-2);
    }
    .basic-motor > span {
      position: absolute;
      bottom: 14px;
      font: 10px monospace;
    }
    .basic-led {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--muted);
    }
    .basic-led.running {
      background: var(--green);
      box-shadow: 0 0 16px var(--green);
    }
    .basic-motor.danger {
      border-color: var(--red);
    }
    .danger .basic-led {
      background: var(--red);
    }
    .basic-fan {
      font-size: 62px;
      color: var(--muted);
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    .readings {
      display: flex;
      justify-content: space-around;
      gap: 10px;
    }
    dt {
      color: var(--muted);
      font-size: 12px;
    }
    dd {
      margin: 8px 0;
      font-family: monospace;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinning {
        animation: none;
      }
    }
  `,
})
export class TelemetryDisplay {
  @Input({ required: true }) state!: MachineState;
}
