import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const inboxLatency = new Trend('inbox_latency');
const webhookLatency = new Trend('webhook_latency');
const campaignLatency = new Trend('campaign_latency');
const dashboardLatency = new Trend('dashboard_latency');

const errorRate = new Rate('errors');
const throughput = new Counter('requests');

export const options = {
  scenarios: {
    // 1. 100 concurrent users buka inbox secara bersamaan
    inbox_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
      exec: 'inboxTest',
    },
    // 2. 50 concurrent webhook incoming (simulasi pesan lead)
    webhook_incoming: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      exec: 'webhookTest',
    },
    // 3. Campaign blast 1000 pesan (simulasi endpoint pemicu campaign)
    campaign_blast: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 100, // total 10x100 = 1000 pesan blast trigger
      maxDuration: '1h',
      exec: 'campaignTest',
    },
    // 4. 200 concurrent dashboard load
    dashboard_load: {
      executor: 'constant-vus',
      vus: 200,
      duration: '30s',
      exec: 'dashboardTest',
    },
  },
  thresholds: {
    'inbox_latency': ['p(95)<500'], // target p95 < 500ms
    'dashboard_latency': ['p(95)<300'], // target p95 < 300ms
    'webhook_latency': ['p(95)<5000'], // target processed < 5 detik
    'errors': ['rate<0.001'], // target error rate < 0.1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const TOKEN = __ENV.API_TOKEN || 'test-token-123';

const HEADERS = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export function inboxTest() {
  group('Inbox Load', () => {
    const res = http.get(`${BASE_URL}/conversations?page=1&limit=20`, { headers: HEADERS });
    inboxLatency.add(res.timings.duration);
    throughput.add(1);
    
    const success = check(res, {
      'is status 200': (r) => r.status === 200,
    });
    
    if (!success) errorRate.add(1);
  });
  sleep(1);
}

export function webhookTest() {
  group('Webhook Incoming', () => {
    const payload = JSON.stringify({
      device: 'device_01',
      sender: '081234567890',
      message: 'Halo, saya mau tanya harga mobil',
      text: 'Halo, saya mau tanya harga mobil',
    });

    const res = http.post(`${BASE_URL}/webhook/fonnte`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    webhookLatency.add(res.timings.duration);
    throughput.add(1);
    
    const success = check(res, {
      'is status 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
    
    if (!success) errorRate.add(1);
  });
}

export function campaignTest() {
  group('Campaign Blast', () => {
    const payload = JSON.stringify({
      campaignId: 'camp_123',
      action: 'start_blast',
    });

    const res = http.post(`${BASE_URL}/campaigns/blast`, payload, { headers: HEADERS });
    
    campaignLatency.add(res.timings.duration);
    throughput.add(1);
    
    const success = check(res, {
      'is status 201': (r) => r.status === 201,
    });
    
    if (!success) errorRate.add(1);
  });
}

export function dashboardTest() {
  group('Dashboard Load', () => {
    const res = http.get(`${BASE_URL}/dashboard/summary`, { headers: HEADERS });
    
    dashboardLatency.add(res.timings.duration);
    throughput.add(1);
    
    const success = check(res, {
      'is status 200': (r) => r.status === 200,
    });
    
    if (!success) errorRate.add(1);
  });
  sleep(1);
}
