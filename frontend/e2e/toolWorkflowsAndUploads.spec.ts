import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Stage 19: Tool Workflows, File Uploads & Error Handling E2E', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const validPdfPath = path.join(fixturesDir, 'valid-test.pdf');
  const validPngPath = path.join(fixturesDir, 'valid-test.png');
  const emptyPdfPath = path.join(fixturesDir, 'empty-test.pdf');
  const invalidExePath = path.join(fixturesDir, 'invalid-test.exe');

  test('executes end-to-end PDF compression: Upload -> Configure -> Process -> Result -> Download -> Reset', async ({ page }) => {
    await page.goto('/pdf-compressor');

    // 1. Verify Page & Privacy Banner
    await expect(page.locator('h1')).toContainText('PDF Compressor');
    await expect(page.locator('text=Files are temporarily processed on our server and automatically deleted').first()).toBeVisible();

    // 2. Upload valid PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(validPdfPath);

    // 3. Configure: Verify file details card appears
    await expect(page.locator('text=valid-test.pdf')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Select Compression Level')).toBeVisible();

    // 4. Select Basic mode and trigger compression
    const compressBtn = page.locator('button:has-text("Compress PDF")');
    await expect(compressBtn).toBeVisible();
    await compressBtn.click();

    // 5. Result View: Verify success card & metrics
    await expect(page.locator('text=PDF Compressed Successfully')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Original:')).toBeVisible();
    await expect(page.locator('text=Result:')).toBeVisible();

    // 6. Verify Download button has proper download link
    const downloadBtn = page.locator('a:has-text("Download Compressed PDF")');
    await expect(downloadBtn).toBeVisible();
    const href = await downloadBtn.getAttribute('href');
    expect(href).toMatch(/\/api\/download\//);

    // 7. Verify no internal filesystem paths are visible
    const content = await page.content();
    expect(content).not.toMatch(/[A-Za-z]:\\[\w\s.-]+\\/);

    // 8. Reset workflow
    const processAnotherBtn = page.locator('button:has-text("Process Another File")');
    await processAnotherBtn.click();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('handles invalid file upload with accessible error alert and no leaked stack traces', async ({ page }) => {
    await page.goto('/pdf-compressor');

    // Upload an invalid executable file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidExePath);

    // Verify error banner is presented with role="alert"
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    const alertText = await errorAlert.textContent();
    expect(alertText).toMatch(/prohibited|unsupported|invalid/i);

    // Verify no raw stack trace or server paths
    expect(alertText).not.toContain('node_modules');
    expect(alertText).not.toContain('at Object.<anonymous>');
    expect(alertText).not.toMatch(/[A-Za-z]:\\[\w\s.-]+\\/);
  });

  test('handles empty (0-byte) file upload with clear validation message', async ({ page }) => {
    await page.goto('/pdf-compressor');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(emptyPdfPath);

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    const alertText = await errorAlert.textContent();
    expect(alertText).toContain('File is empty (0 bytes)');
  });

  test('executes end-to-end Image compression workflow: Upload -> Options -> Process -> Result', async ({ page }) => {
    await page.goto('/image-compressor');

    await expect(page.locator('h1')).toContainText('Image Compressor');

    // Upload valid PNG image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(validPngPath);

    // Should advance to step 2 (Requirements / Options)
    await expect(page.locator('text=Optimization Preset')).toBeVisible({ timeout: 10000 });

    // Click process image now
    const processBtn = page.locator('button:has-text("Process Image Now")');
    await expect(processBtn).toBeVisible();
    await processBtn.click();

    // Verify Result View
    await expect(page.locator('text=Image Compressed Successfully')).toBeVisible({ timeout: 15000 });
    const dlBtn = page.locator('a:has-text("Download")');
    await expect(dlBtn).toBeVisible();
  });
});