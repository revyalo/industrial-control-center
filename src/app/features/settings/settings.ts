import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FleetStore } from '../../core/state/fleet.store';
import { PreferencesService } from '../../core/services/preferences.service';
import { DEFAULT_CONFIG, SimulationConfig } from '../../models/industrial';
import { Icon } from '../../shared/ui/icon';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog';
@Component({
  selector: 'app-settings',
  imports: [FormsModule, Icon, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  readonly prefs = inject(PreferencesService);
  readonly fleet = inject(FleetStore);
  readonly error = signal('');
  readonly clearing = signal(false);
  draft: { -readonly [K in keyof SimulationConfig]: SimulationConfig[K] } = {
    ...this.prefs.config(),
  };
  save(): void {
    const error = this.prefs.setConfig(this.draft);
    this.error.set(error ?? '');
    if (!error) this.fleet.notify('Simulation parameters saved');
  }
  defaults(): void {
    this.draft = { ...DEFAULT_CONFIG };
    this.error.set('');
  }
}
