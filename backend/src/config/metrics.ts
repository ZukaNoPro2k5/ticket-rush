type MetricLabels = Record<string, string | number>;

interface CounterLike {
  inc(value?: number): void;
  inc(labels?: MetricLabels, value?: number): void;
}

interface GaugeLike {
  set(value: number): void;
  set(labels: MetricLabels, value: number): void;
}

function createNoopCounter(): CounterLike {
  return {
    inc: () => undefined,
  };
}

function createNoopGauge(): GaugeLike {
  return {
    set: () => undefined,
  };
}

export const bookingsCreatedTotal = createNoopCounter();
export const bookingsFailedTotal = createNoopCounter();
export const bookingsConfirmedTotal = createNoopCounter();
export const seatLockContentionTotal = createNoopCounter();
export const queueGrantedTotal = createNoopCounter();
export const queueWaitingGauge = createNoopGauge();
