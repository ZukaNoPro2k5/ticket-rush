import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export const registry = new Registry();
registry.setDefaultLabels({ app: 'ticketrush-backend' });

// CPU/memory/event-loop/GC — provided by prom-client
collectDefaultMetrics({ register: registry });

// ---------------------------------------------------------------------------
// HTTP layer
// ---------------------------------------------------------------------------
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests received',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  // Tuned for web app: 1ms → 5s, p95-friendly buckets
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

// ---------------------------------------------------------------------------
// Business metrics — the story for academic defense
// ---------------------------------------------------------------------------
export const bookingsCreatedTotal = new Counter({
  name: 'bookings_created_total',
  help: 'Bookings successfully created (status=pending)',
  labelNames: ['event_id'] as const,
  registers: [registry],
});

export const bookingsConfirmedTotal = new Counter({
  name: 'bookings_confirmed_total',
  help: 'Bookings successfully confirmed (status=confirmed)',
  registers: [registry],
});

export const bookingsFailedTotal = new Counter({
  name: 'bookings_failed_total',
  help: 'Booking attempts that failed',
  labelNames: ['reason'] as const,
  registers: [registry],
});

export const seatLockContentionTotal = new Counter({
  name: 'seat_lock_contention_total',
  help: 'Seat reservations rejected because of Redis lock conflict',
  registers: [registry],
});

export const queueWaitingGauge = new Gauge({
  name: 'queue_users_waiting',
  help: 'Current users in virtual queue per event',
  labelNames: ['event_id'] as const,
  registers: [registry],
});

export const queueGrantedTotal = new Counter({
  name: 'queue_granted_total',
  help: 'Tokens granted from virtual queue',
  registers: [registry],
});
