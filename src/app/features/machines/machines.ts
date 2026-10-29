import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FleetStore } from '../../core/state/fleet.store';
import { StatusBadge } from '../../shared/ui/status-badge';
import { Icon } from '../../shared/ui/icon';
@Component({
  selector: 'app-machines',
  imports: [DecimalPipe, StatusBadge, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './machines.html',
  styleUrl: './machines.css',
})
export class Machines {
  readonly fleet = inject(FleetStore);
  private readonly router = inject(Router);
  readonly filter = signal('all');
  readonly visible = computed(() =>
    this.fleet.machines().filter((m) => this.filter() === 'all' || m.status === this.filter()),
  );
  open(id: string): void {
    this.fleet.select(id);
    void this.router.navigate(['/dashboard']);
  }
}
