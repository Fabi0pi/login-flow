import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});


/**
 * NOTE
  
  fullyParallel: false
  I test E2E su auth condividono lo stesso server e lo stesso DB. Con parallelismo potresti avere race conditions (due test che usano la stessa email o interferiscono sui cookie). In serie è più lento
  ma deterministico.

  reuseExistingServer: true
  In locale hai già pnpm dev in esecuzione. Con true, Playwright usa il server esistente invece di avviarne uno nuovo — il test parte subito. In CI dove non c'è un server attivo, il command: 'pnpm 
  dev' lo avvia automaticamente.
 */