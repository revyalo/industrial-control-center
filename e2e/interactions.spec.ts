import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T10:00:00Z') });
});
test('starts a standby machine, updates telemetry and stops it', async ({ page }) => {
  await page.goto('./#/dashboard');
  await page.getByLabel('SELECT MACHINE', { exact: true }).selectOption('M-04');
  await expect(page.locator('.machine-identity')).toContainText('Stopped');
  await page.getByRole('button', { name: 'Start machine', exact: true }).click();
  await page.clock.runFor(4000);
  await expect(page.locator('.machine-identity')).toContainText('Running');
  const speed = await page.locator('.machine-vitals strong').first().innerText();
  expect(Number(speed.replace(/[^0-9]/g, ''))).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.locator('.machine-vitals strong').first()).toContainText('0');
});
test('simulates overheating, exposes alerts and recovers under control', async ({ page }) => {
  await page.goto('./#/dashboard');
  await expect(page.locator('.machine-identity')).toContainText('VectorDrive');
  await page.getByRole('button', { name: 'Inject fault', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Inject fault', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.machine-identity')).toContainText('Warning');
  await expect(page.locator('.motor-stage')).toHaveClass(/danger/);
  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Alerts', exact: false })
    .click();
  await page.getByLabel('Filter alert severity').selectOption('warning');
  await expect(page.getByRole('heading', { name: 'Overheating simulated' })).toBeVisible();
  await page.getByRole('button', { name: 'Acknowledge Overheating simulated on M-01' }).click();
  await expect(page.locator('.alert-item').first()).toContainText('Acknowledged');
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await page.clock.runFor(18000);
  await expect(page.locator('.machine-identity')).toContainText('Error');
  await page.getByRole('button', { name: 'Reset machine', exact: true }).click();
  await expect(page.locator('.machine-identity')).toContainText('Cooling down');
  await expect(page.getByRole('button', { name: 'Start machine', exact: true })).toBeDisabled();
  await page.clock.runFor(20000);
  await expect(page.getByRole('button', { name: 'Start machine', exact: true })).toBeEnabled();
});
test('injects a mechanical fault and resets without an automatic restart', async ({ page }) => {
  await page.goto('./#/dashboard');
  await page.getByLabel('Fault type', { exact: true }).selectOption('mechanical');
  await page.getByRole('button', { name: 'Inject fault', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Inject fault', exact: true }).click();
  await expect(page.locator('.machine-identity')).toContainText('Error');
  await page.getByRole('button', { name: 'Reset machine', exact: true }).click();
  await expect(page.locator('.machine-identity')).toContainText('Stopped');
});
test('keeps history on navigation, selects machines and validates settings', async ({ page }) => {
  await page.goto('./#/telemetry');
  await expect(page.locator('.series-line')).toHaveAttribute('d', /^M/);
  await page.getByRole('link', { name: 'Machines 04' }).click();
  await expect(page.getByRole('heading', { name: 'Your machine fleet.' })).toBeVisible();
  await page.getByLabel('Filter machine state').selectOption('STOPPED');
  await expect(page.locator('.machine-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open monitor' }).click();
  await expect(page.locator('.machine-identity')).toContainText('LineMotion');
  await page.getByRole('link', { name: 'Telemetry', exact: true }).click();
  await expect(page.getByText('No readings in this window')).toBeVisible();
  await page.getByLabel('Telemetry machine').selectOption('M-01');
  await expect(page.locator('.series-line')).toHaveAttribute('d', /^M/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Warning threshold (°C)', { exact: true }).fill('90');
  await page.getByLabel('Safety shutdown (°C)', { exact: true }).fill('95');
  await page.getByRole('button', { name: 'Save parameters' }).click();
  await expect(page.getByRole('alert')).toContainText('at least 10');
  await page.getByRole('button', { name: 'Load defaults' }).click();
  await page.getByRole('button', { name: 'Save parameters' }).click();
  await expect(page.getByRole('status')).toContainText('Simulation parameters saved');
});
test('supports mobile navigation, themes, reduced motion and a keyboard-safe dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./#/dashboard');
  await expect(page.locator('.machine-identity')).toContainText('VectorDrive');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Day shift' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('Reduce motion', { exact: true }).check();
  await page.getByRole('button', { name: 'Clear telemetry history' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear telemetry history' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: 'docs/screenshots/mobile-settings.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByLabel('Reduce motion', { exact: true })).toBeChecked();
});
test('reference exercise retains its independent start/stop contract', async ({ page }) => {
  await page.goto('./#/foundation');
  await expect(page.getByRole('heading', { name: 'The original brief, rebuilt.' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(page.locator('.readings')).toContainText('RUNNING');
  await page.getByRole('button', { name: 'Detener', exact: true }).click();
  const values = await page.locator('.readings dd').allTextContents();
  await page.clock.runFor(6000);
  await expect(page.locator('.readings dd')).toHaveText(values);
});
test('checks accessibility of all routes in dark and light themes', async ({ page }) => {
  test.setTimeout(120000);
  const failures: unknown[] = [];
  for (const theme of ['dark', 'light']) {
    await page.goto('./#/settings');
    await page.getByRole('button', { name: theme === 'dark' ? 'Dark room' : 'Day shift' }).click();
    for (const route of [
      'dashboard',
      'machines',
      'telemetry',
      'alerts',
      'settings',
      'foundation',
    ]) {
      await page.goto('./#/' + route);
      await expect(page.locator('h1')).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      if (result.violations.length)
        failures.push({
          theme,
          route,
          violations: result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({ target: n.target, detail: n.failureSummary })),
          })),
        });
    }
  }
  expect(failures).toEqual([]);
});

test('applies a target speed by keyboard and clears buffers through a confirmed dialog', async ({
  page,
}) => {
  await page.goto('./#/dashboard');
  await expect(page.locator('.machine-identity')).toContainText('VectorDrive');
  const target = page.getByRole('slider', { name: 'Target speed in RPM' });
  await target.focus();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Apply target speed' }).click();
  await page.clock.runFor(6000);
  const actual = await page.locator('.machine-vitals strong').first().innerText();
  expect(Number(actual.replace(/[^0-9]/g, ''))).toBeGreaterThan(2800);
  await page.getByRole('button', { name: 'Inspect cooling fan' }).click();
  await expect(page.locator('.part-detail')).toContainText('Rotation follows simulated RPM');
  await page.getByRole('button', { name: 'Close part information' }).click();
  await expect(page.locator('.part-detail')).not.toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Clear telemetry history', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear history', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('status')).toContainText('Telemetry histories cleared');
});
