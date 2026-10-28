import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@buildco.demo').fill('admin@buildco.demo');
  await page.getByPlaceholder('••••••••').fill('123456');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');
});

test('navigates to the equipment list and filters by status', async ({ page }) => {
  await page.goto('/equipment');

  await expect(page.getByRole('heading', { name: 'Thiết bị' })).toBeVisible();
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  await page.getByRole('combobox').nth(1).selectOption('active');

  await expect(page).toHaveURL(/status=active/);
});
