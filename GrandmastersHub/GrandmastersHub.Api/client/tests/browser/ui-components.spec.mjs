import { expect, test } from '@playwright/test';

const APP_ROOT = '/SEN371-Ecommerce-App/';

function cart(quantity = 1) {
  return {
    items: quantity > 0 ? [{
      cartItemId: 1,
      productId: 1,
      productVariantId: 1,
      name: 'Tournament board',
      categoryName: 'Boards',
      variantName: 'Walnut',
      imageUrl: '/images/Shopping-plain-chess-board.jpg',
      unitPrice: 1250,
      quantity,
      lineTotal: quantity * 1250,
      stockQuantity: 10,
      isAvailable: true,
    }] : [],
    totalQuantity: quantity,
    subtotal: quantity * 1250,
  };
}

async function authenticate(context) {
  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'ui-test-token');
    localStorage.setItem('user', JSON.stringify({
      userId: 1,
      email: 'ui-test@example.test',
      role: 'Customer',
    }));
  });
}

test.describe('frontend component TDD', () => {
  test('compact Home renders its primary action and opens Shop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/v1/products', (route) => route.fulfill({ json: [] }));

    await page.goto(APP_ROOT);

    await expect(page.locator('.home-compact')).toBeVisible();
    const primaryAction = page.getByRole('link', { name: 'Explore the collection' });
    await expect(primaryAction).toBeVisible();

    await primaryAction.click();

    await expect(page).toHaveURL(/\/SEN371-Ecommerce-App\/boards$/);
    await expect(page.locator('.adaptive-category-nav')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Boards', exact: true })).toBeVisible();
  });

  test('cart retry button recovers from an error state', async ({ page, context }) => {
    await authenticate(context);
    let allowRead = false;

    await page.route('**/api/v1/cart', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();

      if (!allowRead) {
        await route.fulfill({ status: 503, json: { message: 'Cart temporarily unavailable.' } });
        return;
      }

      await route.fulfill({ json: cart(1) });
    });

    await page.goto(`${APP_ROOT}cart`);
    await expect(page.getByRole('heading', { name: 'Unable to load your cart' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();

    allowRead = true;
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('heading', { name: 'Your cart', exact: true })).toBeVisible();
    await expect(page.locator('[aria-label="Quantity: 1"]')).toHaveText('1');
  });

  test('cart quantity and remove buttons update rendered state', async ({ page, context }) => {
    await authenticate(context);
    let currentCart = cart(1);

    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (url.pathname === '/api/v1/cart' && request.method() === 'GET') {
        await route.fulfill({ json: currentCart });
        return;
      }

      if (url.pathname === '/api/v1/cart/items/1' && request.method() === 'PUT') {
        const body = request.postDataJSON();
        currentCart = cart(body.quantity);
        await route.fulfill({ json: currentCart });
        return;
      }

      if (url.pathname === '/api/v1/cart/items/1' && request.method() === 'DELETE') {
        currentCart = cart(0);
        await route.fulfill({ json: currentCart });
        return;
      }

      await route.fulfill({
        status: 404,
        json: { message: `Unexpected UI test request: ${request.method()} ${url.pathname}` },
      });
    });

    await page.goto(`${APP_ROOT}cart`);
    await expect(page.locator('[aria-label="Quantity: 1"]')).toHaveText('1');

    await page.getByRole('button', { name: 'Increase quantity of Tournament board' }).click();
    await expect(page.locator('[aria-label="Quantity: 2"]')).toHaveText('2');
    await expect(page.getByRole('status')).toContainText('Quantity updated.');

    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
  });
});
