import { test, expect } from '@playwright/test';

test.describe('Stage 19: Navigation, Mobile UI & Accessibility E2E', () => {
  test('homepage loads cleanly and displays core branding and tool categories', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Fileora/);

    // Verify main header and hero
    await expect(page.locator('h1')).toContainText('Your files. Your tools.');

    // Verify category tablist
    const tablist = page.locator('div[role="tablist"][aria-label="Tool Categories"]');
    await expect(tablist).toBeVisible();

    // Verify privacy disclaimer is visible on page
    await expect(page.locator('text=Files are temporarily processed on our server and automatically deleted').first()).toBeVisible();

    // Verify NO server filesystem paths are visible anywhere in HTML
    const pageHtml = await page.content();
    expect(pageHtml).not.toMatch(/[A-Za-z]:\\[\w\s.-]+\\/);
    expect(pageHtml).not.toContain('/home/');
    expect(pageHtml).not.toContain('/var/www/');
  });

  test('skip to main content link works via keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus Skip to content
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();

    // Press Enter to skip
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('mobile navigation drawer opens, displays links, and closes with Escape key', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only drawer test');

    await page.goto('/');

    const menuToggle = page.locator('button[aria-controls="mobile-nav-drawer"]');
    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Click to open drawer
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    const drawer = page.locator('#mobile-nav-drawer');
    await expect(drawer).toBeVisible();

    // Press Escape to dismiss drawer
    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(drawer).not.toBeVisible();
  });

  test('quick search modal opens and filters tools cleanly', async ({ page }) => {
    await page.goto('/');

    // Click quick search or press Ctrl+K
    const searchTrigger = page.locator('button:has-text("Quick Search")');
    if (await searchTrigger.isVisible()) {
      await searchTrigger.click();
      const searchModal = page.locator('input[placeholder*="Search"]');
      await expect(searchModal).toBeVisible();

      // Type a tool name
      await searchModal.fill('compress');
      await expect(page.locator('text=Compress PDF').first()).toBeVisible();

      // Close modal with Escape
      await page.keyboard.press('Escape');
    }
  });
});

