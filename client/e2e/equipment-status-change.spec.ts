import { test, expect } from '@playwright/test';

test('changes an equipment status from its detail page', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@buildco.demo').fill('admin@buildco.demo');
  await page.getByPlaceholder('••••••••').fill('123456');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/equipment');
  await page.locator('table tbody tr').first().click();

  await expect(page.getByText('Chuyển trạng thái')).toBeVisible();

  const transitionButton = page.locator('button', { hasText: '→' }).first();
  await transitionButton.click();

  await expect(page.getByText('Đã cập nhật trạng thái')).toBeVisible();
});
