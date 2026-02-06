import { test as base, expect } from '@playwright/test';
import { ApiHelper, DEFAULT_THRESHOLDS, type PerformanceThresholds } from '../utils/apiHelpers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

/**
 * Extended test fixture with API helper
 */
export const test = base.extend<{
  api: ApiHelper;
  apiBaseUrl: string;
}>({
  apiBaseUrl: API_BASE_URL,

  api: async ({ request }, use) => {
    const api = new ApiHelper(request, API_BASE_URL);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(api);

    // Log performance report after each test
    const report = api.generateReport();
    console.log('\n' + report);
  },
});

export { expect, DEFAULT_THRESHOLDS, type PerformanceThresholds };
