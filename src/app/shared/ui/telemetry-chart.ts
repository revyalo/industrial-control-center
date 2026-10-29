import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Reading } from '../../models/industrial';
import { METRICS, Metric, makePath, readingValue } from '../utils/telemetry';
let sequence = 0;
@Component({
  selector: 'app-telemetry-chart',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './telemetry-chart.html',
  styleUrl: './telemetry-chart.css',
})
export class TelemetryChart {
  readonly points = input.required<readonly Reading[]>();
  readonly metric = input<Metric>('temperature');
  readonly start = input.required<number>();
  readonly end = input.required<number>();
  readonly threshold = input(80);
  readonly config = computed(() => METRICS[this.metric()]);
  readonly path = computed(() => makePath(this.points(), this.metric(), this.start(), this.end()));
  readonly fill = computed(() => {
    const path = this.path();
    if (!path) return '';
    const first = this.points()[0]!;
    const last = this.points().at(-1)!;
    return `${path} L${this.x(last)},168 L${this.x(first)},168 Z`;
  });
  readonly yTicks = computed(() =>
    this.metric() === 'status' ? [0, 1 / 3, 2 / 3, 1] : [0, 0.25, 0.5, 0.75, 1],
  );
  readonly xTicks = [0, 0.25, 0.5, 0.75, 1];
  readonly gradientId = `chart-fill-${++sequence}`;
  readonly hovered = signal<number | null>(null);
  readonly active = computed(() =>
    this.hovered() === null
      ? null
      : (this.points()[Math.min(this.hovered()!, this.points().length - 1)] ?? null),
  );
  readonly thresholdY = computed(() => 168 - (this.threshold() / 120) * 144);
  x(p: Reading): number {
    return (
      48 +
      Math.min(
        1,
        Math.max(0, (p.timestamp - this.start()) / Math.max(1, this.end() - this.start())),
      ) *
        720
    );
  }
  y(p: Reading): number {
    return (
      168 -
      (Math.min(this.config().max, Math.max(0, readingValue(p, this.metric()))) /
        this.config().max) *
        144
    );
  }
  value(p: Reading): string {
    return this.metric() === 'status'
      ? p.status
      : `${readingValue(p, this.metric()).toFixed(this.metric() === 'rpm' ? 0 : 1)} ${this.config().unit}`;
  }
  tickLabel(fraction: number): string {
    return this.metric() === 'status'
      ? (['Stopped', 'Running', 'Warning', 'Error'][Math.round(fraction * 3)] ?? '')
      : String(Math.round(fraction * this.config().max * 10) / 10);
  }
  inspect(event: PointerEvent): void {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const time =
      this.start() +
      Math.min(1, Math.max(0, (((event.clientX - rect.left) / rect.width) * 800 - 48) / 720)) *
        (this.end() - this.start());
    let index = 0;
    let distance = Infinity;
    this.points().forEach((p, i) => {
      const d = Math.abs(p.timestamp - time);
      if (d < distance) {
        distance = d;
        index = i;
      }
    });
    this.hovered.set(index);
  }
}
