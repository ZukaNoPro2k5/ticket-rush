import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { CreateBookingInput } from './validation';

interface BookingRow extends RowDataPacket {
  id: number;
  user_id: number;
  event_id: number;
  promo_code_id: number | null;
  discount_amount: number;
  total_amount: number;
  status: string;
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
}

interface SeatPriceRow extends RowDataPacket {
  id: number;
  zone_id: number;
  price: number;
}

interface PromoRow extends RowDataPacket {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  event_id: number | null;
  min_amount: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface BookingSeatRow extends RowDataPacket {
  seat_id: number;
}

export async function createBooking(userId: number, input: CreateBookingInput) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lock ghế (SELECT ... FOR UPDATE bên trong)
    const placeholders = input.seat_ids.map(() => '?').join(', ');
    const [seatRows] = await conn.execute<SeatPriceRow[]>(
      `SELECT s.id, s.zone_id, sz.price
       FROM seats s
       JOIN seat_zones sz ON sz.id = s.zone_id
       WHERE s.id IN (${placeholders}) AND sz.event_id = ?
       FOR UPDATE`,
      [...input.seat_ids, input.event_id],
    );

    if (seatRows.length !== input.seat_ids.length) {
      throw AppError.badRequest('Một số ghế không thuộc sự kiện này');
    }

    // Check available
    const [statusRows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, status FROM seats WHERE id IN (${placeholders})`,
      input.seat_ids,
    );
    const unavailable = statusRows.filter((r) => r.status !== 'available');
    if (unavailable.length > 0) {
      throw AppError.conflict(
        `${unavailable.length} ghế đã bị người khác giữ hoặc đã bán`,
        'SEATS_UNAVAILABLE',
      );
    }

    // 2. Tính subtotal
    const subtotal = seatRows.reduce((sum, s) => sum + Number(s.price), 0);

    // 3. Validate promo code nếu có
    let promoCodeId: number | null = null;
    let discountAmount = 0;

    if (input.promo_code) {
      const [promos] = await conn.execute<PromoRow[]>(
        `SELECT id, code, discount_type, discount_value, max_uses, used_count,
                event_id, min_amount, starts_at, expires_at, is_active
         FROM promo_codes
         WHERE code = ? AND is_active = TRUE
         AND starts_at <= NOW() AND expires_at >= NOW()`,
        [input.promo_code],
      );

      if (promos.length === 0) {
        throw AppError.badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_PROMO');
      }

      const promo = promos[0];

      if (promo.event_id && promo.event_id !== input.event_id) {
        throw AppError.badRequest('Mã giảm giá không áp dụng cho sự kiện này', 'INVALID_PROMO');
      }
      if (promo.max_uses && promo.used_count >= promo.max_uses) {
        throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng', 'MAX_USES_REACHED');
      }
      if (subtotal < Number(promo.min_amount)) {
        throw AppError.badRequest(
          `Đơn tối thiểu ${Number(promo.min_amount).toLocaleString('vi-VN')}đ để áp mã này`,
          'MIN_AMOUNT_NOT_MET',
        );
      }

      discountAmount = promo.discount_type === 'percent'
        ? Math.round(subtotal * Number(promo.discount_value) / 100)
        : Number(promo.discount_value);
      discountAmount = Math.min(discountAmount, subtotal); // không giảm quá tổng

      promoCodeId = promo.id;

      // Tăng used_count
      await conn.execute('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
    }

    const totalAmount = subtotal - discountAmount;

    // 4. Tạo booking
    const [bookingResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO bookings (user_id, event_id, promo_code_id, discount_amount, total_amount, expires_at)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [userId, input.event_id, promoCodeId, discountAmount, totalAmount],
    );
    const bookingId = bookingResult.insertId;

    // 5. Tạo booking_seats (snapshot giá)
    const bsValues: (string | number | boolean | null)[] = [];
    const bsPlaceholders: string[] = [];
    for (const seat of seatRows) {
      bsPlaceholders.push('(?, ?, ?)');
      bsValues.push(bookingId, seat.id, seat.price);
    }
    await conn.execute(
      `INSERT INTO booking_seats (booking_id, seat_id, price) VALUES ${bsPlaceholders.join(', ')}`,
      bsValues,
    );

    // 6. Lock ghế
    await conn.execute(
      `UPDATE seats SET status = 'locked', locked_by = ?, locked_at = NOW()
       WHERE id IN (${placeholders})`,
      [userId, ...input.seat_ids],
    );

    await conn.commit();

    return {
      id: bookingId,
      event_id: input.event_id,
      seat_ids: input.seat_ids,
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      promo_code: input.promo_code ?? null,
      status: 'pending',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getBooking(bookingId: number, userId?: number) {
  const [rows] = await pool.execute<BookingRow[]>(
    'SELECT id, user_id, event_id, promo_code_id, discount_amount, total_amount, status, expires_at, confirmed_at, created_at FROM bookings WHERE id = ?',
    [bookingId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
  }
  const booking = rows[0];

  if (userId && booking.user_id !== userId) {
    throw AppError.forbidden('Bạn không có quyền xem đơn này');
  }

  // Lấy thông tin event
  const [eventRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, title, venue, event_date FROM events WHERE id = ?',
    [booking.event_id],
  );

  // Lấy ghế
  const [seatRows] = await pool.execute<RowDataPacket[]>(
    `SELECT bs.seat_id AS id, sz.name AS zone_name, s.row_label, s.col_number, bs.price
     FROM booking_seats bs
     JOIN seats s ON s.id = bs.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE bs.booking_id = ?`,
    [bookingId],
  );

  // Promo code
  let promoCode: string | null = null;
  if (booking.promo_code_id) {
    const [promoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT code FROM promo_codes WHERE id = ?',
      [booking.promo_code_id],
    );
    if (promoRows.length > 0) promoCode = promoRows[0].code;
  }

  const subtotal = seatRows.reduce((sum, s) => sum + Number(s.price), 0);

  return {
    id: booking.id,
    user_id: booking.user_id,
    event: eventRows[0],
    seats: seatRows,
    subtotal,
    discount_amount: Number(booking.discount_amount),
    total_amount: Number(booking.total_amount),
    promo_code: promoCode,
    status: booking.status,
    expires_at: booking.expires_at,
    confirmed_at: booking.confirmed_at,
  };
}

export async function listMyBookings(userId: number, status?: string, page = 1, limit = 10) {
  const conditions = ['b.user_id = ?'];
  const params: (string | number | boolean | null)[] = [userId];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM bookings b ${where}`,
    params,
  );
  const total = countRows[0].total as number;

  const offset = (page - 1) * limit;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.id, b.total_amount, b.status, b.confirmed_at,
            e.id AS event_id, e.title AS event_title, e.event_date, e.poster_url,
            (SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id = b.id) AS seat_count
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const items = rows.map((r) => ({
    id: r.id,
    event: { id: r.event_id, title: r.event_title, event_date: r.event_date, poster_url: r.poster_url },
    total_amount: Number(r.total_amount),
    status: r.status,
    seat_count: r.seat_count,
    confirmed_at: r.confirmed_at,
  }));

  return {
    items,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function confirmBooking(bookingId: number, userId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      'SELECT id, user_id, status, expires_at FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền xác nhận đơn này');
    }
    if (booking.status === 'confirmed') {
      throw AppError.conflict('Đơn đã được thanh toán', 'BOOKING_ALREADY_CONFIRMED');
    }
    if (booking.status === 'cancelled') {
      throw AppError.conflict('Đơn đã bị hủy', 'BOOKING_NOT_CANCELLABLE');
    }
    if (new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }

    // Xác nhận booking
    await conn.execute(
      'UPDATE bookings SET status = ?, confirmed_at = NOW() WHERE id = ?',
      ['confirmed', bookingId],
    );

    // Lấy seat_ids
    const [seatRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const seatIds = seatRows.map((r) => r.seat_id);

    // Mark ghế sold
    if (seatIds.length > 0) {
      const ph = seatIds.map(() => '?').join(', ');
      await conn.execute(
        `UPDATE seats SET status = 'sold', locked_by = NULL, locked_at = NULL WHERE id IN (${ph})`,
        seatIds,
      );
    }

    await conn.commit();
    return { bookingId, seatIds };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function cancelBooking(bookingId: number, userId: number, isAdmin = false) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      'SELECT id, user_id, status, promo_code_id FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (!isAdmin && booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền hủy đơn này');
    }
    if (booking.status !== 'pending') {
      throw AppError.conflict('Chỉ có thể hủy đơn đang chờ thanh toán', 'BOOKING_NOT_CANCELLABLE');
    }

    // Hủy booking
    await conn.execute('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', bookingId]);

    // Release ghế
    const [seatRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const seatIds = seatRows.map((r) => r.seat_id);
    if (seatIds.length > 0) {
      const ph = seatIds.map(() => '?').join(', ');
      await conn.execute(
        `UPDATE seats SET status = 'available', locked_by = NULL, locked_at = NULL WHERE id IN (${ph})`,
        seatIds,
      );
    }

    // Hoàn lại used_count promo nếu có
    if (booking.promo_code_id) {
      await conn.execute(
        'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
        [booking.promo_code_id],
      );
    }

    await conn.commit();
    return { bookingId, seatIds };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
