import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FleetStore } from '../../core/state/fleet.store';
import { TelemetryPanel } from './telemetry-panel';
import { StatusBadge } from '../../shared/ui/status-badge';
@Component({
  selector: 'app-telemetry',
  imports: [TelemetryPanel, DecimalPipe, DatePipe, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-heading">
      <div>
        <p class="eyebrow">REACTIVE OBSERVABILITY</p>
        <h1>Telemetry explorer<span class="accent">.</span></h1>
        <p class="subtitle">
          A closer look at every cycle. Explore up to 10 minutes of simulated readings.
        </p>
      </div>
      <label class="machine-picker"
        >Machine<select
          aria-label="Telemetry machine"
          [value]="fleet.selectedId()"
          (change)="fleet.select($any($event.target).value)"
        >
          @for (m of fleet.machines(); track m.id) {
            <option [value]="m.id">{{ m.id }} — {{ m.name }}</option>
          }
        </select></label
      >
    </div>
    <app-telemetry-panel />
    <div class="panel sample-panel">
      <div class="panel-header">
        <h2>Recent samples</h2>
        <span class="tag">LATEST 10 / MAX 300 PER MACHINE</span>
      </div>
      <div class="table-wrap">
        <table>
          <caption class="sr-only">
            Recent raw simulated telemetry readings
          </caption>
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Temperature</th>
              <th>Speed</th>
              <th>Power</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            @for (p of fleet.selected().history.slice(-10).reverse(); track $index) {
              <tr>
                <td class="monospace">{{ p.timestamp | date: 'HH:mm:ss' : 'UTC' }}</td>
                <td class="monospace">{{ p.temperature | number: '1.1-1' }} °C</td>
                <td class="monospace">{{ p.rpm }} RPM</td>
                <td class="monospace">{{ p.power | number: '1.2-2' }} kW</td>
                <td><app-status-badge [status]="p.status" /></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">
                  <div class="empty-state">
                    <strong>No samples yet</strong>
                    <p>Start this machine from Overview or Machines.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>`,
  styles: `
    h1 {
      margin-top: 9px;
    }
    .machine-picker {
      display: grid;
      gap: 8px;
      font-size: 10px;
    }
    .machine-picker select {
      min-width: 210px;
      font-size: 12px;
    }
    .sample-panel {
      margin-top: 24px;
    }
    .tag {
      font-size: 8px;
    }
    @media (max-width: 550px) {
      .tag {
        white-space: normal;
        font-size: 7px;
      }
      .sample-panel td,
      .sample-panel th {
        font-size: 9px;
        padding: 12px 10px;
      }
    }
  `,
})
export class Telemetry {
  readonly fleet = inject(FleetStore);
}
