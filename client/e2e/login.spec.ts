import { test, expect } from '@playwright/test';

test('logs in with a seeded admin account and lands on the dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('admin@buildco.demo').fill('admin@buildco.demo');
  await page.getByPlaceholder('••••••••').fill('123456');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Tổng quan' })).toBeVisible();
});
