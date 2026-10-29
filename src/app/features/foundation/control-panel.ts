import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-control-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="panel basic-controls">
    <h2>Control panel</h2>
    <p>Start the motor to receive simulated readings every two seconds.</p>
    <button class="button primary" (click)="start.emit()" [disabled]="running">Iniciar</button
    ><button class="button" (click)="stop.emit()" [disabled]="!running">Detener</button>
  </section>`,
  styles: `
    .basic-controls {
      padding: 28px;
    }
    .button {
      width: 100%;
      margin-top: 12px;
    }
    p {
      color: var(--muted);
      line-height: 1.6;
    }
    :host {
      flex: 0 1 300px;
    }
  `,
})
export class ControlPanel {
  @Input() running = false;
  @Output() readonly start = new EventEmitter<void>();
  @Output() readonly stop = new EventEmitter<void>();
}
