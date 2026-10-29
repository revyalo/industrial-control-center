import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
const paths: Record<string, string> = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  machine: 'M7 5h10v14H7z M3 9h4 M3 15h4 M17 9h4 M17 15h4 M10 2v3 M14 2v3 M10 19v3 M14 19v3',
  chart: 'M3 3v18h18 M6 15l4-5 4 3 6-8',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  down: 'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',
  play: 'm8 5 11 7-11 7z',
  stop: 'M6 6h12v12H6z',
  reset: 'M3 11a9 9 0 1 1 3 8 M3 4v7h7',
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7z',
  temp: 'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0 M12 9v9',
  speed: 'M4 18a9 9 0 1 1 16 0 M12 13l5-5 M7 18h10',
  check: 'm5 12 4 4L20 5',
  pause: 'M8 5v14 M16 5v14',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2',
  moon: 'M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11z',
  code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  info: 'M12 11v6 M12 7v.1 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M6 18 18 6',
  clock: 'M12 7v5l3 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  warning: 'm12 3 10 18H2z M12 9v5 M12 17v.1',
  expand: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',
};
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="path()" />
  </svg>`,
  styles: ':host{display:inline-flex;flex-shrink:0}',
})
export class Icon {
  readonly name = input('grid');
  readonly size = input(18);
  readonly path = computed(() => paths[this.name()] ?? paths['grid']);
}
