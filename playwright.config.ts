import { defineConfig, devices } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:4173/Terra-Do-Sol/'

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: BASE, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npx vite preview --port 4173 --strictPort', url: BASE, reuseExistingServer: true },
})
