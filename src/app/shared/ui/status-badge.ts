import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MachineStatus } from '../../models/industrial';
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="status" [class]="status().toLowerCase()"
    ><span class="dot"></span>{{ recovering() ? 'Cooling down' : labels[status()] }}</span
  >`,
  styles: `
    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      font: 10px var(--mono);
      border: 1px solid var(--border);
      color: var(--muted);
      background: var(--surface-2);
    }
    .running {
      color: var(--green);
      border-color: color-mix(in srgb, var(--green) 20%, transparent);
      background: color-mix(in srgb, var(--green) 7%, transparent);
    }
    .warning {
      color: var(--amber);
      border-color: color-mix(in srgb, var(--amber) 20%, transparent);
      background: color-mix(in srgb, var(--amber) 7%, transparent);
    }
    .error {
      color: var(--red);
      border-color: color-mix(in srgb, var(--red) 20%, transparent);
      background: color-mix(in srgb, var(--red) 7%, transparent);
    }
  `,
})
export class StatusBadge {
  readonly status = input.required<MachineStatus>();
  readonly recovering = input(false);
  readonly labels = { RUNNING: 'Running', STOPPED: 'Stopped', WARNING: 'Warning', ERROR: 'Error' };
}
