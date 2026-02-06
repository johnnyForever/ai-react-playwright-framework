import { testCredentials } from '../config/credentials';
import { DEFAULT_THRESHOLDS, expect, test } from '../fixtures/api.fixture';

/**
 * Performance tests for API endpoints
 * These tests measure response times and ensure they meet defined thresholds
 */
test.describe('API Performance Tests @api @performance @regression', () => {
  test.describe('Health endpoint performance', () => {
    test('should respond within 50ms', async ({ api }) => {
      const { metrics } = await api.get('/api/health');

      expect(metrics.responseTime).toBeLessThan(50);
    });

    test('should handle multiple rapid requests', async ({ api }) => {
      const requests = 10;
      const promises = Array.from({ length: requests }, () => api.get('/api/health'));

      await Promise.all(promises);

      const stats = api.calculateStats();
      expect(stats.count).toBe(requests);
      expect(stats.avg).toBeLessThan(100);
      expect(stats.p95).toBeLessThan(150);
    });
  });

  test.describe('Products endpoint performance', () => {
    test('should list all products within 200ms', async ({ api }) => {
      const { metrics } = await api.get('/api/products');

      expect(metrics.responseTime).toBeLessThan(200);
    });

    test('should get single product within 100ms', async ({ api }) => {
      const { metrics } = await api.get('/api/products/1');

      expect(metrics.responseTime).toBeLessThan(100);
    });

    test('should handle concurrent product requests', async ({ api }) => {
      const productIds = ['1', '2', '3', '4'];
      const requests = productIds.map((id) => api.get(`/api/products/${id}`));

      await Promise.all(requests);

      const stats = api.calculateStats();
      expect(stats.count).toBe(productIds.length);
      expect(stats.max).toBeLessThan(300);
    });

    test('should maintain performance under load (20 requests)', async ({ api }) => {
      const requests = 20;
      const promises = Array.from({ length: requests }, (_, i) =>
        api.get(`/api/products/${(i % 4) + 1}`),
      );

      await Promise.all(promises);

      const result = api.assertPerformance({
        maxResponseTime: 500,
        p95ResponseTime: 200,
        p99ResponseTime: 300,
      });

      console.log('Load test stats:', result.stats);
      expect(result.passed).toBe(true);
      if (!result.passed) {
        console.error('Performance violations:', result.violations);
      }
    });
  });

  test.describe('Authentication endpoint performance', () => {
    test('should login within 300ms', async ({ api }) => {
      const { metrics } = await api.post('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });

      expect(metrics.responseTime).toBeLessThan(300);
    });

    test('should verify token within 100ms', async ({ api }) => {
      // Login first
      const { data } = await api.post<{ token: string }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });
      api.setAuthToken(data.token);
      api.clearMetrics(); // Clear login metrics

      // Measure /me endpoint
      const { metrics } = await api.get('/api/auth/me');

      expect(metrics.responseTime).toBeLessThan(100);
    });
  });

  test.describe('Performance thresholds validation', () => {
    test('should meet default thresholds for mixed workload', async ({ api }) => {
      // Simulate mixed API usage
      await api.get('/api/health');
      await api.get('/api/products');
      await api.get('/api/products/1');
      await api.get('/api/products/2');
      await api.post('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });

      const result = api.assertPerformance(DEFAULT_THRESHOLDS);

      console.log('\nMixed workload performance:');
      console.log(`  Total requests: ${result.stats.count}`);
      console.log(`  Avg response time: ${result.stats.avg}ms`);
      console.log(`  P95: ${result.stats.p95}ms`);
      console.log(`  P99: ${result.stats.p99}ms`);

      expect(result.passed).toBe(true);
    });

    test('should generate comprehensive performance report', async ({ api }) => {
      // Run various endpoints
      for (let i = 0; i < 5; i++) {
        await api.get('/api/health');
        await api.get('/api/products');
        await api.get(`/api/products/${(i % 4) + 1}`);
      }

      const report = api.generateReport();

      expect(report).toContain('API Performance Report');
      expect(report).toContain('Total Requests:');
      expect(report).toContain('Response Times:');
      expect(report).toContain('By Endpoint:');

      console.log('\n' + report);
    });
  });

  test.describe('Slow endpoint detection', () => {
    test('should detect artificially slow responses', { tag: ['@slow'] }, async ({ api }) => {
      // Test the slow endpoint (has artificial delay)
      const { metrics } = await api.get('/api/performance/slow');

      // The slow endpoint has 100-600ms delay
      expect(metrics.responseTime).toBeGreaterThan(100);
      console.log(`Slow endpoint responded in ${metrics.responseTime}ms`);
    });

    test('should compare fast vs slow endpoints', { tag: ['@slow'] }, async ({ api }) => {
      const { metrics: fastMetrics } = await api.get('/api/performance/fast');
      const { metrics: slowMetrics } = await api.get('/api/performance/slow');

      expect(fastMetrics.responseTime).toBeLessThan(100);
      expect(slowMetrics.responseTime).toBeGreaterThan(fastMetrics.responseTime);

      console.log(`Fast endpoint: ${fastMetrics.responseTime}ms`);
      console.log(`Slow endpoint: ${slowMetrics.responseTime}ms`);
      console.log(`Difference: ${slowMetrics.responseTime - fastMetrics.responseTime}ms`);
    });
  });

  test.describe('Response time percentiles', () => {
    test('should calculate accurate percentiles', { tag: ['@slow'] }, async ({ api }) => {
      // Run 50 requests for statistical significance
      const promises = Array.from({ length: 50 }, (_, i) => {
        if (i % 10 === 0) return api.get('/api/performance/slow'); // 10% slow
        return api.get('/api/performance/fast'); // 90% fast
      });

      await Promise.all(promises);

      const stats = api.calculateStats();

      expect(stats.count).toBe(50);
      expect(stats.p50).toBeLessThan(stats.p95);
      expect(stats.p95).toBeLessThan(stats.p99);
      expect(stats.p99).toBeLessThanOrEqual(stats.max);

      console.log('\nPercentile distribution:');
      console.log(`  Min: ${stats.min}ms`);
      console.log(`  P50: ${stats.p50}ms`);
      console.log(`  P95: ${stats.p95}ms`);
      console.log(`  P99: ${stats.p99}ms`);
      console.log(`  Max: ${stats.max}ms`);
    });
  });
});

test.describe('API Stress Tests @api @stress', () => {
  test('should handle burst of 50 concurrent requests', { tag: ['@slow'] }, async ({ api }) => {
    const burstSize = 50;
    const startTime = Date.now();

    const promises = Array.from({ length: burstSize }, () => api.get('/api/products'));

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    // All requests should succeed
    for (const result of results) {
      expect(result.response.status()).toBe(200);
    }

    const stats = api.calculateStats();

    console.log('\nBurst test results:');
    console.log(`  Total requests: ${burstSize}`);
    console.log(`  Total time: ${totalTime}ms`);
    console.log(`  Requests/second: ${Math.round((burstSize / totalTime) * 1000)}`);
    console.log(`  Avg response time: ${stats.avg}ms`);
    console.log(`  Max response time: ${stats.max}ms`);

    expect(stats.avg).toBeLessThan(500);
  });

  test('should maintain stability over sustained load', { tag: ['@slow'] }, async ({ api }) => {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    let requestCount = 0;

    while (Date.now() - startTime < duration) {
      await api.get('/api/health');
      requestCount++;
    }

    const stats = api.calculateStats();

    console.log('\nSustained load test:');
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Total requests: ${requestCount}`);
    console.log(`  Requests/second: ${Math.round((requestCount / duration) * 1000)}`);
    console.log(`  Avg response time: ${stats.avg}ms`);

    expect(requestCount).toBeGreaterThan(10);
    expect(stats.avg).toBeLessThan(200);
  });
});
