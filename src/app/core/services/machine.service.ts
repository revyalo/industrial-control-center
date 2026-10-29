import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, distinctUntilChanged, interval, map, switchMap } from 'rxjs';
import { MachineState } from '../../models/machine-state';

/** Isolated reference exercise: stopped machines emit no periodic telemetry. */
@Injectable()
export class MachineService {
  private readonly subject = new BehaviorSubject<MachineState>({
    temperature: 24,
    rpm: 0,
    status: 'STOPPED',
  });
  readonly state$ = this.subject.asObservable();
  readonly state = toSignal(this.state$, { requireSync: true });
  private tick = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.state$
      .pipe(
        map((state) => state.status === 'RUNNING'),
        distinctUntilChanged(),
        switchMap((running) => (running ? interval(2000) : EMPTY)),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => {
        this.tick++;
        this.subject.next({
          status: 'RUNNING',
          temperature: 52 + Math.sin(this.tick) * 2,
          rpm: 1450 + Math.round(Math.cos(this.tick) * 22),
        });
      });
    destroyRef.onDestroy(() => this.subject.complete());
  }
  startMachine(): void {
    if (this.state().status === 'RUNNING') return;
    this.subject.next({ ...this.state(), status: 'RUNNING', rpm: 1450 });
  }
  stopMachine(): void {
    this.subject.next({ ...this.state(), status: 'STOPPED', rpm: 0 });
  }
}
