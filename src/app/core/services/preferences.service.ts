import { Injectable, signal } from '@angular/core';
import { DEFAULT_CONFIG, SimulationConfig } from '../../models/industrial';
import { validateConfig } from '../simulation/engine';
interface Preferences {
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  compact: boolean;
  config: SimulationConfig;
}
const KEY = 'icc.preferences.v1';
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly initial = this.load();
  readonly theme = signal(this.initial.theme);
  readonly reducedMotion = signal(this.initial.reducedMotion);
  readonly compact = signal(this.initial.compact);
  readonly config = signal<SimulationConfig>(this.initial.config);
  readonly storageError = signal('');
  constructor() {
    this.apply();
  }
  setTheme(theme: 'dark' | 'light'): void {
    this.theme.set(theme);
    this.save();
  }
  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }
  setMotion(value: boolean): void {
    this.reducedMotion.set(value);
    this.save();
  }
  setCompact(value: boolean): void {
    this.compact.set(value);
    this.save();
  }
  setConfig(config: SimulationConfig): string | null {
    const error = validateConfig(config);
    if (error) return error;
    this.config.set({ ...config });
    this.save();
    return null;
  }
  private apply(): void {
    document.documentElement.dataset['theme'] = this.theme();
    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion());
    document.documentElement.classList.toggle('compact', this.compact());
  }
  private save(): void {
    this.apply();
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          theme: this.theme(),
          reducedMotion: this.reducedMotion(),
          compact: this.compact(),
          config: this.config(),
        }),
      );
      this.storageError.set('');
    } catch {
      this.storageError.set('Preferences work for this session; browser storage is unavailable.');
    }
  }
  private load(): Preferences {
    const fallback: Preferences = {
      theme: 'dark',
      reducedMotion: false,
      compact: false,
      config: { ...DEFAULT_CONFIG },
    };
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (!parsed || typeof parsed !== 'object') return fallback;
      const value = parsed as Partial<Preferences>;
      return {
        theme: value.theme === 'light' ? 'light' : 'dark',
        reducedMotion: value.reducedMotion === true,
        compact: value.compact === true,
        config:
          value.config &&
          Object.keys(DEFAULT_CONFIG).every(
            (key) => typeof (value.config as unknown as Record<string, unknown>)[key] === 'number',
          ) &&
          !validateConfig(value.config)
            ? value.config
            : fallback.config,
      };
    } catch {
      return fallback;
    }
  }
}
