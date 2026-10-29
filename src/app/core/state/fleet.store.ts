import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, interval } from 'rxjs';
import { FleetState, MachineCommand, TICK_MS } from '../../models/industrial';
import { PreferencesService } from '../services/preferences.service';
import { SimulationEngine } from '../simulation/engine';
@Injectable({ providedIn: 'root' })
export class FleetStore {
  readonly preferences = inject(PreferencesService);
  private readonly engine = new SimulationEngine(42);
  private readonly subject = new BehaviorSubject<FleetState>(
    this.engine.createFleet(Date.now(), this.preferences.config()),
  );
  readonly state$ = this.subject.asObservable();
  readonly state = toSignal(this.state$, { requireSync: true });
  readonly selectedId = signal('M-01');
  readonly machines = computed(() => this.state().machines);
  readonly selected = computed(
    () => this.machines().find((m) => m.id === this.selectedId()) ?? this.machines()[0]!,
  );
  readonly alerts = computed(() => this.state().alerts);
  readonly activeCount = computed(
    () => this.machines().filter((m) => m.status === 'RUNNING' || m.status === 'WARNING').length,
  );
  readonly activeAlerts = computed(() =>
    this.alerts().filter((a) => a.severity !== 'info' && !a.acknowledged),
  );
  readonly totalPower = computed(() => this.machines().reduce((sum, m) => sum + m.power, 0));
  readonly notice = signal('');
  readonly error = signal('');
  private noticeTimer?: ReturnType<typeof setTimeout>;
  constructor() {
    const destroyRef = inject(DestroyRef);
    interval(TICK_MS)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        try {
          this.subject.next(this.engine.step(this.state(), Date.now(), this.preferences.config()));
          this.error.set('');
        } catch {
          this.error.set(
            'The simulation could not advance. Reload the page to restart the local session.',
          );
        }
      });
    destroyRef.onDestroy(() => {
      clearTimeout(this.noticeTimer);
      this.subject.complete();
    });
  }
  select(id: string): void {
    if (this.machines().some((m) => m.id === id)) this.selectedId.set(id);
  }
  command(command: MachineCommand, id = this.selectedId()): void {
    const next = this.engine.command(this.state(), id, command, this.preferences.config());
    if (next === this.state()) {
      this.notify('Action unavailable in the current machine state.');
      return;
    }
    this.subject.next(next);
    const labels = {
      start: 'Machine started',
      stop: 'Machine stopped',
      reset: 'Controlled reset requested',
      target: 'Target speed updated',
      fault: 'Simulation fault injected',
    };
    this.notify(`${id} · ${labels[command.type]}`);
  }
  acknowledge(id: string): void {
    this.subject.next({
      ...this.state(),
      alerts: this.alerts().map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    });
    this.notify('Alert acknowledged');
  }
  acknowledgeAll(): void {
    this.subject.next({
      ...this.state(),
      alerts: this.alerts().map((a) => ({ ...a, acknowledged: true })),
    });
    this.notify('All alerts acknowledged');
  }
  clearHistory(): void {
    this.subject.next({
      ...this.state(),
      machines: this.machines().map((m) => ({ ...m, history: [] })),
    });
    this.notify('Telemetry histories cleared');
  }
  notify(message: string): void {
    clearTimeout(this.noticeTimer);
    this.notice.set(message);
    this.noticeTimer = setTimeout(() => this.notice.set(''), 4500);
  }
}
