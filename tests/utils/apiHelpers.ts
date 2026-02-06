import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Performance metrics for API requests
 */
export interface PerformanceMetrics {
  responseTime: number;
  statusCode: number;
  endpoint: string;
  method: string;
  timestamp: number;
}

/**
 * Performance thresholds configuration
 */
export interface PerformanceThresholds {
  maxResponseTime: number;
  p95ResponseTime?: number;
  p99ResponseTime?: number;
}

/**
 * Default performance thresholds
 */
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxResponseTime: 500, // 500ms max
  p95ResponseTime: 200, // 95th percentile under 200ms
  p99ResponseTime: 400, // 99th percentile under 400ms
};

/**
 * API Helper class for making requests and tracking performance
 */
export class ApiHelper {
  private request: APIRequestContext;
  private baseUrl: string;
  private metrics: PerformanceMetrics[] = [];
  private authToken: string | null = null;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear collected metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get default headers including auth if available
   */
  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Track performance metrics for a request
   */
  private trackPerformance(
    method: string,
    endpoint: string,
    startTime: number,
    response: APIResponse,
  ): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      responseTime: Date.now() - startTime,
      statusCode: response.status(),
      endpoint,
      method,
      timestamp: startTime,
    };
    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Make a GET request with performance tracking
   */
  async get<T = unknown>(
    endpoint: string,
    options?: { headers?: Record<string, string> },
  ): Promise<{ response: APIResponse; data: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
    });
    const metrics = this.trackPerformance('GET', endpoint, startTime, response);
    const data = await response.json();
    return { response, data, metrics };
  }

  /**
   * Make a POST request with performance tracking
   */
  async post<T = unknown>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: { headers?: Record<string, string> },
  ): Promise<{ response: APIResponse; data: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
      data: body,
    });
    const metrics = this.trackPerformance('POST', endpoint, startTime, response);
    const data = await response.json();
    return { response, data, metrics };
  }

  /**
   * Make a PUT request with performance tracking
   */
  async put<T = unknown>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: { headers?: Record<string, string> },
  ): Promise<{ response: APIResponse; data: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
      data: body,
    });
    const metrics = this.trackPerformance('PUT', endpoint, startTime, response);
    const data = await response.json();
    return { response, data, metrics };
  }

  /**
   * Make a DELETE request with performance tracking
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: { headers?: Record<string, string> },
  ): Promise<{ response: APIResponse; data: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(options?.headers),
    });
    const metrics = this.trackPerformance('DELETE', endpoint, startTime, response);
    const data = await response.json();
    return { response, data, metrics };
  }

  /**
   * Calculate performance statistics
   */
  calculateStats(): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const times = this.metrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const count = times.length;

    if (count === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sum = times.reduce((a, b) => a + b, 0);
    const percentile = (p: number) => times[Math.floor((count - 1) * p)] || times[count - 1];

    return {
      count,
      min: times[0],
      max: times[count - 1],
      avg: Math.round(sum / count),
      p50: percentile(0.5),
      p95: percentile(0.95),
      p99: percentile(0.99),
    };
  }

  /**
   * Assert performance meets thresholds
   */
  assertPerformance(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS): {
    passed: boolean;
    violations: string[];
    stats: ReturnType<ApiHelper['calculateStats']>;
  } {
    const stats = this.calculateStats();
    const violations: string[] = [];

    if (stats.max > thresholds.maxResponseTime) {
      violations.push(
        `Max response time ${stats.max}ms exceeds threshold ${thresholds.maxResponseTime}ms`,
      );
    }

    if (thresholds.p95ResponseTime && stats.p95 > thresholds.p95ResponseTime) {
      violations.push(
        `P95 response time ${stats.p95}ms exceeds threshold ${thresholds.p95ResponseTime}ms`,
      );
    }

    if (thresholds.p99ResponseTime && stats.p99 > thresholds.p99ResponseTime) {
      violations.push(
        `P99 response time ${stats.p99}ms exceeds threshold ${thresholds.p99ResponseTime}ms`,
      );
    }

    return {
      passed: violations.length === 0,
      violations,
      stats,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const stats = this.calculateStats();
    const byEndpoint = new Map<string, number[]>();

    for (const m of this.metrics) {
      const key = `${m.method} ${m.endpoint}`;
      if (!byEndpoint.has(key)) {
        byEndpoint.set(key, []);
      }
      byEndpoint.get(key)!.push(m.responseTime);
    }

    let report = '=== API Performance Report ===\n\n';
    report += `Total Requests: ${stats.count}\n`;
    report += `Response Times:\n`;
    report += `  Min: ${stats.min}ms\n`;
    report += `  Max: ${stats.max}ms\n`;
    report += `  Avg: ${stats.avg}ms\n`;
    report += `  P50: ${stats.p50}ms\n`;
    report += `  P95: ${stats.p95}ms\n`;
    report += `  P99: ${stats.p99}ms\n\n`;

    report += 'By Endpoint:\n';
    for (const [endpoint, times] of byEndpoint) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      report += `  ${endpoint}: ${times.length} requests, avg ${avg}ms\n`;
    }

    return report;
  }
}

/**
 * Login and get auth token
 */
export async function loginAndGetToken(
  api: ApiHelper,
  email: string,
  password: string,
): Promise<string> {
  const { data } = await api.post<{ token: string; success: boolean }>('/api/auth/login', {
    email,
    password,
  });
  if (!data.success || !data.token) {
    throw new Error('Login failed');
  }
  api.setAuthToken(data.token);
  return data.token;
}
