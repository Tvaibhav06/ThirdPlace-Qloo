// tests/e2e/presets.spec.ts
// End-to-end browser walkthrough for Presets A, B, and C verifying 9 UI states and wedge components.

import { test, expect } from '@playwright/test';

test.describe('ThirdPlace Squad E2E Presets & Wedge Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure header is visible
    await expect(page.locator('h1')).toContainText('ThirdPlace Squad');
  });

  test('Preset A: Solo Weekly Routine builds 3 stops and BLS benchmark', async ({ page }) => {
    // Click Preset A button
    const presetAButton = page.locator('button', { hasText: 'A: New in Logan Square' });
    await expect(presetAButton).toBeVisible();
    await presetAButton.click();

    // Verify Solo mode results appear
    await expect(page.locator('h2', { hasText: 'Weekly Routine (3 Slots)' })).toBeVisible({ timeout: 20000 });

    // Verify BLS benchmark metrics
    await expect(page.locator('text=Weekly Total Spend')).toBeVisible();
    await expect(page.locator('text=Savings vs BLS ($58.17/wk)')).toBeVisible();

    // Verify 13-Row Itemized Split Ledger
    await expect(page.locator('text=13-Row Itemized Pre-Spend Split Ledger')).toBeVisible();
    await expect(page.locator('text=LI-12: Weekly Running Total')).toBeVisible();
    await expect(page.locator('text=LI-13: BLS Weekly Savings')).toBeVisible();
  });

  test('Preset B: Squad Consensus with Blind Cap Mode and Shared Cultural DNA', async ({ page }) => {
    // Click Preset B button
    const presetBButton = page.locator('button', { hasText: 'B: Three friends, three budgets' });
    await expect(presetBButton).toBeVisible();
    await presetBButton.click();

    // Verify Recommended Consensus Plan card appears
    await expect(page.locator('text=Recommended Consensus Plan')).toBeVisible({ timeout: 35000 });

    // Verify Shared Cultural DNA Card (/v2/insights/compare)
    await expect(page.locator('text=Why Your Squad Clicks')).toBeVisible();

    // Verify Per-Friend Taste & Commute Fairness Scorecard
    await expect(page.locator('text=Per-Friend Taste & Commute Fairness')).toBeVisible();

    // Verify Blind Cap Mode is active by default: LI-10 masked
    await expect(page.locator('text=hidden (binding floor applied)').first()).toBeVisible();

    // Verify 13-Row Split Ledger
    await expect(page.locator('text=13-Row Itemized Pre-Spend Split Ledger')).toBeVisible();
    await expect(page.locator('text=LI-01: Venue Base Spend')).toBeVisible();
    await expect(page.locator('text=LI-09: Total Member Cost')).toBeVisible();

    // Verify Provenance Drawer
    await expect(page.locator('text=Inspect Provenance & Qloo API Telemetry')).toBeVisible();
  });

  test('Preset C: Geographically spread squad consensus', async ({ page }) => {
    // Click Preset C button
    const presetCButton = page.locator('button', { hasText: 'C: Far apart' });
    await expect(presetCButton).toBeVisible();
    await presetCButton.click();

    // Verify consensus plan is reached
    await expect(page.locator('text=Recommended Consensus Plan')).toBeVisible({ timeout: 35000 });
  });

  test('Mobile Responsive: Verify mobile viewport layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('h1')).toBeVisible();
    const presetBButton = page.locator('button', { hasText: 'B: Three friends, three budgets' });
    await expect(presetBButton).toBeVisible();
  });
});
