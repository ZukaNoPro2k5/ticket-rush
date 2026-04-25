/**
 * Bookings service barrel. Implementations live under ./services/*.
 * Kept as a re-export so controllers can continue to `import { ... } from './service'`.
 */
export { createBooking } from './services/create';
export { getBooking, listMyBookings } from './services/query';
export { confirmBooking, cancelBooking } from './services/lifecycle';
