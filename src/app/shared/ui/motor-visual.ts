import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IndustrialMachine } from '../../models/industrial';
import { Icon } from './icon';
@Component({
  selector: 'app-motor-visual',
  imports: [DecimalPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './motor-visual.html',
  styleUrl: './motor-visual.css',
})
export class MotorVisual {
  readonly machine = input.required<IndustrialMachine>();
  readonly threshold = input(80);
  readonly detail = signal('');
  readonly danger = computed(
    () => this.machine().status === 'ERROR' || this.machine().temperature > this.threshold(),
  );
  readonly duration = computed(() => `${1440 / Math.max(1, this.machine().rpm)}s`);
  readonly details: Record<string, string> = {
    fan: 'Cooling fan · Rotation follows simulated RPM. Stops when the motor is stopped or in error.',
    housing:
      'Motor housing · The thermal indicator turns red above the configured warning threshold.',
    terminal:
      'Terminal box · LED indicates running, stopped, warning or error. All values are simulated.',
  };
}
