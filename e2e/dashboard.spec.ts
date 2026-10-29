import { expect, test } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T10:00:00Z') });
});
test('loads an interactive dashboard with a working start/stop path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Operations overview.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start machine', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(page.locator('.machine-identity')).toContainText('Stopped');
  await page.getByRole('button', { name: 'Start machine', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(page.locator('.machine-identity')).toContainText('Running');
  await expect(page.locator('.machine-vitals')).not.toContainText('0 RPM');
  expect(errors).toEqual([]);
});
test('captures the real dashboard at desktop size', async ({ page }) => {
  await page.goto('./#/dashboard');
  await expect(page.getByRole('heading', { name: 'Operations overview.' })).toBeVisible();
  await expect(page.locator('.machine-identity')).toContainText('VectorDrive');
  await page.screenshot({
    path: 'docs/screenshots/dashboard.png',
    fullPage: true,
    animations: 'disabled',
  });
});
test('freezes the view, switches metrics and exports readings', async ({ page }) => {
  await page.goto('./#/telemetry');
  await expect(page.getByRole('heading', { name: 'Telemetry explorer.' })).toBeVisible();
  await expect(page.locator('.series-line')).toHaveAttribute('d', /^M/);
  await page.getByRole('button', { name: 'Pause chart', exact: true }).click();
  const path = await page.locator('.series-line').getAttribute('d');
  await page.clock.runFor(6000);
  await expect(page.locator('.series-line')).toHaveAttribute('d', path!);
  await page.getByRole('button', { name: 'Motor speed', exact: true }).click();
  await expect(page.locator('.series-line')).not.toHaveAttribute('d', path!);
  await page.getByRole('button', { name: 'Resume chart', exact: true }).click();
  await expect(page.locator('.chart-signal')).toHaveText('LIVE STREAM');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export current readings as CSV' }).click();
  expect((await download).suggestedFilename()).toBe('M-01-simulated-telemetry.csv');
});
