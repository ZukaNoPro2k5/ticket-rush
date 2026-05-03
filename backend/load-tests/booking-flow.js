// k6 load test cho TicketRush — booking flow
//
// Cài đặt: https://grafana.com/docs/k6/latest/set-up/install-k6/
// Chạy:    k6 run backend/load-tests/booking-flow.js
//
// Kịch bản:
//   1. Browse events list (cached, public)
//   2. Get event detail (cached, public)
//   3. Login (auth)
//   4. Get available seats
//   5. Create booking với 1-2 ghế ngẫu nhiên
//   6. Confirm hoặc cancel (50/50)
//
// Mục tiêu: tìm điểm gãy về throughput + p95 latency. Set ramp-up rồi quan sát.

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE = __ENV.API_URL || 'http://localhost:4000/api';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'test+loadk6@ticketrush.local';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Test12345!';
const EVENT_ID = Number(__ENV.EVENT_ID || 1);

// Custom metrics
const bookingLatency = new Trend('booking_create_duration', true);
const seatConflicts = new Counter('seat_conflicts_409');
const successBookings = new Counter('successful_bookings');

export const options = {
  scenarios: {
    // Steady ramp: warmup → load → spike → cooldown
    booking_flow: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 10 },   // warmup
        { duration: '1m',  target: 50 },   // sustained load
        { duration: '30s', target: 100 },  // spike
        { duration: '1m',  target: 100 },  // hold
        { duration: '30s', target: 0 },    // cooldown
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],                  // <5% failures (excluding 409 expected)
    http_req_duration: ['p(95)<800'],                // p95 < 800ms
    'booking_create_duration': ['p(95)<1000'],       // booking create p95 < 1s
  },
};

// --- Helpers ---

function randomSeats(seats, count) {
  const available = seats.filter((s) => s.status === 'available');
  if (available.length < count) return null;
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => s.id);
}

function login() {
  const res = http.post(
    `${BASE}/auth/login`,
    JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'login 200': (r) => r.status === 200 });
  if (res.status !== 200) return null;
  const body = res.json();
  return body?.data?.token ?? null;
}

// --- Main VU loop ---

export default function () {
  group('1. Browse events', () => {
    const res = http.get(`${BASE}/events?limit=12`);
    check(res, { 'list events 200': (r) => r.status === 200 });
    sleep(0.5);
  });

  group('2. Event detail', () => {
    const res = http.get(`${BASE}/events/${EVENT_ID}`);
    check(res, { 'event detail 200': (r) => r.status === 200 });
    sleep(0.5);
  });

  const token = login();
  if (!token) return;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let seats = [];
  group('3. Seats map', () => {
    const res = http.get(`${BASE}/seats?event_id=${EVENT_ID}`, { headers: authHeaders });
    check(res, { 'seats 200': (r) => r.status === 200 });
    if (res.status === 200) seats = res.json()?.data ?? [];
    sleep(0.3);
  });

  if (seats.length === 0) return;

  const seatIds = randomSeats(seats, 1 + Math.floor(Math.random() * 2));
  if (!seatIds) return;

  let bookingId = null;
  group('4. Create booking', () => {
    const start = Date.now();
    const res = http.post(
      `${BASE}/bookings`,
      JSON.stringify({ event_id: EVENT_ID, seat_ids: seatIds }),
      { headers: authHeaders, tags: { name: 'POST /bookings' } },
    );
    bookingLatency.add(Date.now() - start);

    if (res.status === 409) {
      // Expected under contention — not a bug
      seatConflicts.add(1);
      return;
    }

    check(res, { 'create booking 201': (r) => r.status === 201 || r.status === 200 });
    bookingId = res.json()?.data?.id ?? null;
  });

  if (!bookingId) return;

  // 50/50 confirm or cancel — simulates real user behavior
  const willConfirm = Math.random() < 0.5;
  group(willConfirm ? '5a. Confirm' : '5b. Cancel', () => {
    const path = willConfirm ? 'confirm' : 'cancel';
    const res = http.post(
      `${BASE}/bookings/${bookingId}/${path}`,
      null,
      { headers: authHeaders, tags: { name: `POST /bookings/:id/${path}` } },
    );
    if (res.status === 200 && willConfirm) successBookings.add(1);
  });

  sleep(1 + Math.random());
}
