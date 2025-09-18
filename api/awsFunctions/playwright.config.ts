import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries:0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000, // 30 seconds for Lambda cold starts
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['github'] // For CI
  ],

  use: {
    baseURL: process.env.LAMBDA_ENDPOINT || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'unit-tests',
      testMatch: 'src/**/*/test.ts',
      timeout: 10000, // 10 seconds - unit tests should be fast
      use: {
        // Unit tests don't need a browser or web server
        headless: true,
      },
      // TODO(human) - Configure unit test project settings
    },
    {
      name: 'integration-tests', 
      testDir: './tests/integration',
      timeout: 30000, // 30 seconds for Lambda cold starts
      use: {
        baseURL: process.env.LAMBDA_ENDPOINT || 'http://localhost:3000',
      },
      // TODO(human) - Configure integration test dependencies
    },
  ],

  // TODO(human) - Configure web server for integration tests only
});