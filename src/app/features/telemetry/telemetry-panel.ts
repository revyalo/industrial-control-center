import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FleetStore } from '../../core/state/fleet.store';
import { Reading } from '../../models/industrial';
import { TelemetryChart } from '../../shared/ui/telemetry-chart';
import { Icon } from '../../shared/ui/icon';
import { METRICS, Metric, downloadCsv, readingValue } from '../../shared/utils/telemetry';
@Component({
  selector: 'app-telemetry-panel',
  imports: [TelemetryChart, Icon, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './telemetry-panel.html',
  styleUrl: './telemetry-panel.css',
})
export class TelemetryPanel {
  readonly fleet = inject(FleetStore);
  readonly metric = signal<Metric>('temperature');
  readonly range = signal(300000);
  readonly snapshot = signal<{ id: string; points: readonly Reading[]; time: number } | null>(null);
  readonly metrics = METRICS;
  readonly keys: Metric[] = ['temperature', 'rpm', 'power', 'status'];
  readonly end = computed(() => this.snapshot()?.time ?? this.fleet.state().timestamp);
  readonly start = computed(() => this.end() - this.range());
  readonly points = computed(() =>
    (this.snapshot()?.points ?? this.fleet.selected().history).filter(
      (p) => p.timestamp >= this.start(),
    ),
  );
  readonly current = computed(() => this.points().at(-1));
  readonly currentValue = computed(() =>
    this.current() ? readingValue(this.current()!, this.metric()) : 0,
  );
  constructor() {
    effect(() => {
      const id = this.fleet.selectedId();
      if (this.snapshot() && this.snapshot()!.id !== id) this.snapshot.set(null);
    });
  }
  togglePause(): void {
    this.snapshot.update((s) =>
      s
        ? null
        : {
            id: this.fleet.selectedId(),
            points: this.fleet.selected().history,
            time: this.fleet.state().timestamp,
          },
    );
  }
  export(): void {
    downloadCsv(this.fleet.selectedId(), this.points());
    this.fleet.notify('Simulated telemetry exported to CSV');
  }
}
