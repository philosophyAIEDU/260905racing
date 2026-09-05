import { expect, test } from '@playwright/test';

test('safety consent, physical driving, pause, results and fresh consent', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PINE LOOP.' })).toBeVisible();
  await expect(page.getByRole('button', { name: '주행 시작', exact: true })).toBeDisabled({
    timeout: 20000,
  });
  await page.getByRole('button', { name: '자유 주행 시간 제한 없이 연습' }).click();
  await page.getByRole('checkbox', { name: '안전한 장소에서 게임을 이용하겠습니다.' }).check();
  await page.getByRole('button', { name: '주행 시작', exact: true }).click();
  await expect(page.locator('.countdown')).toBeHidden({ timeout: 6000 });
  await page.keyboard.down('w');
  await expect
    .poll(async () => Number(await page.locator('[data-speed]').textContent()), { timeout: 7000 })
    .toBeGreaterThan(15);
  await page.keyboard.up('w');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: '잠시 쉬어가세요.' })).toBeVisible();
  await page.getByRole('button', { name: '계속 주행' }).click();
  await page.getByRole('button', { name: '주행 마치기' }).click();
  await expect(page.getByRole('heading', { name: '멋진 연습이었습니다.' })).toBeVisible();
  await page.getByRole('button', { name: '차고로 돌아가기' }).click();
  await expect(
    page.getByRole('checkbox', { name: '안전한 장소에서 게임을 이용하겠습니다.' }),
  ).not.toBeChecked();
  expect(errors).toEqual([]);
});

test('keyboard settings and UI language are usable without microphone access', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('switch', { name: /주행 보조/ }).uncheck();
  await page.getByLabel('화면 언어').selectOption('en');
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'Start driving', exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('switch', { name: /Driving assists/ })).not.toBeChecked();
});
