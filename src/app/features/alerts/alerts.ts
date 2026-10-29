import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FleetStore } from '../../core/state/fleet.store';
import { Icon } from '../../shared/ui/icon';
@Component({
  selector: 'app-alerts',
  imports: [DatePipe, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  readonly fleet = inject(FleetStore);
  readonly severity = signal('all');
  readonly machine = signal('all');
  readonly acknowledgement = signal('all');
  readonly visible = computed(() =>
    this.fleet
      .alerts()
      .filter(
        (a) =>
          (this.severity() === 'all' || a.severity === this.severity()) &&
          (this.machine() === 'all' || a.machineId === this.machine()) &&
          (this.acknowledgement() === 'all' ||
            (this.acknowledgement() === 'open' ? !a.acknowledged : a.acknowledged)),
      ),
  );
  readonly unacknowledged = computed(
    () => this.fleet.alerts().filter((a) => !a.acknowledged).length,
  );
}
