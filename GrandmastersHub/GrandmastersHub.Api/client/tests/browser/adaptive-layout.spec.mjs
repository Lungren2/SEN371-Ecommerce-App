import { test, expect } from '@playwright/test';

const APP_ROOT = '/SEN371-Ecommerce-App/';

const views = {
  compact: '.adaptive-view-compact',
  medium: '.adaptive-view-medium',
  expanded: '.adaptive-view-expanded',
};

async function openHome(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(APP_ROOT);
  await expect(page.locator('.adaptive-shell')).toBeVisible();
}

async function expectOnlyView(page, expected) {
  for (const [name, selector] of Object.entries(views)) {
    const locator = page.locator(selector);
    if (name === expected) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).toBeHidden();
    }
  }
}

async function attachLayoutDiagnostics(page, testInfo) {
  const diagnostics = await page.evaluate(() => {
    const display = (selector) => {
      const element = document.querySelector(selector);
      return element ? getComputedStyle(element).display : 'missing';
    };

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      documentWidth: document.documentElement.scrollWidth,
      compactView: display('.adaptive-view-compact'),
      mediumView: display('.adaptive-view-medium'),
      expandedView: display('.adaptive-view-expanded'),
      desktopHeader: display('.adaptive-desktop-header'),
      topBar: display('.adaptive-topbar'),
      rail: display('.adaptive-navigation-rail'),
      bottomNavigation: display('.adaptive-bottom-navigation'),
    };
  });

  await testInfo.attach('layout-diagnostics.json', {
    body: Buffer.from(JSON.stringify(diagnostics, null, 2)),
    contentType: 'application/json',
  });
}

test.describe('adaptive application shell', () => {
  test('phone renders the compact interface and thumb navigation', async ({ page }, testInfo) => {
    await openHome(page, { width: 390, height: 844 });
    await attachLayoutDiagnostics(page, testInfo);

    await expectOnlyView(page, 'compact');
    await expect(page.locator('.home-compact')).toBeVisible();
    await expect(page.locator('.home-medium')).toBeHidden();
    await expect(page.locator('.hero-section')).toBeHidden();

    await expect(page.locator('.adaptive-topbar')).toBeVisible();
    await expect(page.locator('.adaptive-bottom-navigation')).toBeVisible();
    await expect(page.locator('.adaptive-navigation-rail')).toBeHidden();
    await expect(page.locator('.adaptive-desktop-header')).toBeHidden();
    await expect(page.locator('.adaptive-desktop-footer')).toBeHidden();

    const bottomNavigation = page.locator('.adaptive-primary-nav-bottom');
    await expect(bottomNavigation.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(bottomNavigation.getByRole('link', { name: 'Shop', exact: true })).toBeVisible();
    await expect(bottomNavigation.getByRole('link', { name: 'Cart', exact: true })).toBeVisible();
    await expect(bottomNavigation.getByRole('link', { name: 'Account', exact: true })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('small tablet renders the medium interface and navigation rail', async ({ page }, testInfo) => {
    await openHome(page, { width: 820, height: 1180 });
    await attachLayoutDiagnostics(page, testInfo);

    await expectOnlyView(page, 'medium');
    await expect(page.locator('.home-medium')).toBeVisible();
    await expect(page.locator('.home-compact')).toBeHidden();
    await expect(page.locator('.hero-section')).toBeHidden();

    await expect(page.locator('.adaptive-topbar')).toBeVisible();
    await expect(page.locator('.adaptive-navigation-rail')).toBeVisible();
    await expect(page.locator('.adaptive-bottom-navigation')).toBeHidden();
    await expect(page.locator('.adaptive-desktop-header')).toBeHidden();
    await expect(page.locator('.adaptive-desktop-footer')).toBeHidden();
  });

  test('desktop renders the expanded interface and desktop chrome', async ({ page }, testInfo) => {
    await openHome(page, { width: 1280, height: 900 });
    await attachLayoutDiagnostics(page, testInfo);

    await expectOnlyView(page, 'expanded');
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.home-compact')).toBeHidden();
    await expect(page.locator('.home-medium')).toBeHidden();

    await expect(page.locator('.adaptive-desktop-header')).toBeVisible();
    await expect(page.locator('.adaptive-desktop-footer')).toBeVisible();
    await expect(page.locator('.adaptive-topbar')).toBeHidden();
    await expect(page.locator('.adaptive-navigation-rail')).toBeHidden();
    await expect(page.locator('.adaptive-bottom-navigation')).toBeHidden();
  });

  test('composition switches at the exact 48rem and 64rem boundaries', async ({ page }) => {
    await openHome(page, { width: 768, height: 900 });
    await expectOnlyView(page, 'compact');

    await page.setViewportSize({ width: 769, height: 900 });
    await expectOnlyView(page, 'medium');

    await page.setViewportSize({ width: 1024, height: 900 });
    await expectOnlyView(page, 'medium');

    await page.setViewportSize({ width: 1025, height: 900 });
    await expectOnlyView(page, 'expanded');
  });

  test('phone Shop uses local category navigation instead of desktop category chrome', async ({ page }) => {
    await page.route(/\/api\/v1\/products(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
    });

    await openHome(page, { width: 390, height: 844 });
    await page
      .locator('.adaptive-primary-nav-bottom')
      .getByRole('link', { name: 'Shop', exact: true })
      .click();

    await expect(page).toHaveURL(/\/SEN371-Ecommerce-App\/boards$/);
    await expect(page.locator('.adaptive-catalog-header')).toBeVisible();
    await expect(page.locator('.adaptive-catalog-desktop-title')).toBeHidden();
    await expect(page.locator('.adaptive-category-nav')).toBeVisible();
    await expect(page.locator('.adaptive-category-link')).toHaveCount(4);
  });
});
