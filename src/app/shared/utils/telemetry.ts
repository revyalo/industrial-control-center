import { Reading } from '../../models/industrial';
export type Metric = 'temperature' | 'rpm' | 'power' | 'status';
export const METRICS: Record<Metric, { label: string; unit: string; max: number; color: string }> =
  {
    temperature: { label: 'Temperature', unit: '°C', max: 120, color: 'var(--accent)' },
    rpm: { label: 'Motor speed', unit: 'RPM', max: 3000, color: 'var(--blue)' },
    power: { label: 'Power draw', unit: 'kW', max: 8, color: 'var(--amber)' },
    status: { label: 'Machine state', unit: '', max: 3, color: 'var(--accent)' },
  };
export function readingValue(reading: Reading, metric: Metric): number {
  return metric === 'status'
    ? { STOPPED: 0, RUNNING: 1, WARNING: 2, ERROR: 3 }[reading.status]
    : reading[metric];
}
export function makePath(
  points: readonly Reading[],
  metric: Metric,
  start: number,
  end: number,
): string {
  if (!points.length) return '';
  const max = METRICS[metric].max;
  return points
    .map(
      (p, i) =>
        `${i ? 'L' : 'M'}${(48 + Math.min(1, Math.max(0, (p.timestamp - start) / Math.max(1, end - start))) * 720).toFixed(2)},${(168 - (Math.min(max, Math.max(0, readingValue(p, metric))) / max) * 144).toFixed(2)}`,
    )
    .join(' ');
}
const escapeCell = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
export function readingsToCsv(id: string, points: readonly Reading[]): string {
  return (
    '\uFEFF' +
    [
      'machine_id,timestamp_utc,temperature_c,rpm,power_kw,status,data_source',
      ...points.map((p) =>
        [
          id,
          new Date(p.timestamp).toISOString(),
          p.temperature,
          p.rpm,
          p.power,
          p.status,
          'browser simulation',
        ]
          .map(escapeCell)
          .join(','),
      ),
    ].join('\r\n')
  );
}
export function downloadCsv(id: string, points: readonly Reading[]): void {
  const blob = new Blob([readingsToCsv(id, points)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${id}-simulated-telemetry.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
