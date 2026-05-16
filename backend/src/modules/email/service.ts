type BookingForEmail = {
  id: number;
  event?: Record<string, unknown>;
  seats?: Record<string, unknown>[];
  total_amount?: number;
};

type TicketForEmail = {
  id: number;
  seat: string;
  qr_code: string;
};

export async function sendBookingConfirmationDevLog(
  booking: BookingForEmail,
  tickets: TicketForEmail[],
) {
  const event = booking.event ?? {};
  const seatSummary = booking.seats
    ?.map((seat) => `${String(seat.zone_name ?? 'Zone')} ${String(seat.row_label ?? '')}${String(seat.col_number ?? '')}`)
    .join(', ');

  console.log('[Email:dev-log] Booking confirmation', {
    booking_id: booking.id,
    event: event.title,
    venue: event.venue,
    event_date: event.event_date,
    total_amount: booking.total_amount,
    seats: seatSummary,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      seat: ticket.seat,
      qr_preview: ticket.qr_code.slice(0, 32),
    })),
  });
}
