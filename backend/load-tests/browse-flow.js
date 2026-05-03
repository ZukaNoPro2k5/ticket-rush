// k6 load test — chỉ test các endpoint đã hoàn thiện:
//   1. GET /api/events            (list, public, có cache)
//   2. GET /api/events/:id        (detail, public, có cache)
//   3. POST /api/auth/login       (auth)
//   4. GET /api/events/:id/seats  (seat map, auth)
//
// Chạy:
//   k6 run backend/load-tests/browse-flow.js

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE = __ENV.API_URL || 'http://localhost:4000/api';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'loadtest@ticketrush.local';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Test12345!';
const EVENT_ID = Number(__ENV.EVENT_ID || 1);

const eventsListLatency = new Trend('events_list_duration', true);
const eventDetailLatency = new Trend('event_detail_duration', true);
const seatsLatency = new Trend('seats_map_duration', true);

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '20s', target: 20 },
        { duration: '40s', target: 50 },
        { duration: '20s', target: 100 },
        { duration: '40s', target: 100 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
    'events_list_duration': ['p(95)<300'],
    'event_detail_duration': ['p(95)<300'],
  },
};

export default function () {
  group('1. Browse events list', () => {
    const start = Date.now();
    const res = http.get(`${BASE}/events?limit=12`);
    eventsListLatency.add(Date.now() - start);
    check(res, { 'list events 200': (r) => r.status === 200 });
    sleep(0.3);
  });

  group('2. Event detail', () => {
    const start = Date.now();
    const res = http.get(`${BASE}/events/${EVENT_ID}`);
    eventDetailLatency.add(Date.now() - start);
    check(res, { 'event detail 200': (r) => r.status === 200 });
    sleep(0.3);
  });

  let token = null;
  group('3. Login', () => {
    const res = http.post(
      `${BASE}/auth/login`,
      JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    check(res, { 'login 200': (r) => r.status === 200 });
    if (res.status === 200) token = res.json()?.data?.token ?? null;
    sleep(0.2);
  });

  if (!token) return;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  group('4. Seats map', () => {
    const start = Date.now();
    const res = http.get(`${BASE}/events/${EVENT_ID}/seats`, { headers: authHeaders });
    seatsLatency.add(Date.now() - start);
    check(res, { 'seats 200': (r) => r.status === 200 });
    sleep(0.3);
  });

  sleep(0.5);
}
