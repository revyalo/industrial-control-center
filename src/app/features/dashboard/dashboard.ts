import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FleetStore } from '../../core/state/fleet.store';
import { Icon } from '../../shared/ui/icon';
import { StatusBadge } from '../../shared/ui/status-badge';
import { MotorVisual } from '../../shared/ui/motor-visual';
import { TelemetryPanel } from '../telemetry/telemetry-panel';
import { MachineControls } from '../../shared/ui/machine-controls';
@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    Icon,
    StatusBadge,
    MotorVisual,
    MachineControls,
    TelemetryPanel,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly fleet = inject(FleetStore);
  readonly averageTemp = computed(
    () =>
      this.fleet.machines().reduce((s, m) => s + m.temperature, 0) / this.fleet.machines().length,
  );
  readonly uptime = computed(() => Math.floor(this.fleet.selected().runtimeSeconds / 60));
  readonly powerTrend = computed(() => {
    const machines = this.fleet.machines();
    const times = machines[0]!.history.slice(-20).map((p) => p.timestamp);
    const values = times.map((time) =>
      machines.reduce((sum, m) => {
        for (let i = m.history.length - 1; i >= 0; i--) {
          if (m.history[i]!.timestamp <= time) return sum + m.history[i]!.power;
        }
        return sum;
      }, 0),
    );
    const max = Math.max(1, ...values);
    return values
      .map(
        (v, i) =>
          `${i ? 'L' : 'M'}${((i / Math.max(1, values.length - 1)) * 90).toFixed(1)},${(20 - (v / max) * 18).toFixed(1)}`,
      )
      .join(' ');
  });
  readonly recent = computed(() => this.fleet.alerts().slice(0, 3));
}
