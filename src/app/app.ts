import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './shared/ui/icon';
import { FleetStore } from './core/state/fleet.store';
import { PreferencesService } from './core/services/preferences.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly fleet = inject(FleetStore);
  readonly preferences = inject(PreferencesService);
  readonly menuOpen = signal(false);
  readonly links = [
    { path: '/dashboard', icon: 'grid', label: 'Overview' },
    { path: '/machines', icon: 'machine', label: 'Machines' },
    { path: '/telemetry', icon: 'chart', label: 'Telemetry' },
    { path: '/alerts', icon: 'bell', label: 'Alerts' },
  ];
}
