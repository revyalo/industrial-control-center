import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PreferencesService } from './preferences.service';
import { DEFAULT_CONFIG } from '../../models/industrial';
describe('Design preferences', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });
  it('applies and persists theme and motion preferences', () => {
    const p = TestBed.inject(PreferencesService);
    p.toggleTheme();
    p.setMotion(true);
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
    TestBed.resetTestingModule();
    const restored = TestBed.inject(PreferencesService);
    expect(restored.theme()).toBe('light');
    expect(restored.reducedMotion()).toBe(true);
  });
  it('rejects corrupt stored settings and invalid configuration', () => {
    localStorage.setItem('icc.preferences.v1', '{invalid');
    const p = TestBed.inject(PreferencesService);
    expect(p.config()).toEqual(DEFAULT_CONFIG);
    expect(p.setConfig({ ...DEFAULT_CONFIG, rampRate: -1 })).toBeTruthy();
    expect(p.config().rampRate).toBe(260);
  });
});
