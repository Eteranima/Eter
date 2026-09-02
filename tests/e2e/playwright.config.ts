import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', timeout: 120000, retries: 0, workers: 1,
  use: { viewport: { width: 1366, height: 768 }, headless: true },
  reporter: [['list']],
});
