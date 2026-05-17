import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { CreateSeatZoneInput, UpdateSeatZoneInput } from './validation';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
type SeatingMode = 'seated' | 'zoned' | 'admission';

interface SeatZoneRow extends RowDataPacket {
  id: number;
  event_id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
  available_seats: number;
  total_seats: number;
}

function normalizeZone(zone: SeatZoneRow) {
  return {
    ...zone,
    price: Number(zone.price),
    available_seats: Number(zone.available_seats ?? 0),
    total_seats: Number(zone.total_seats ?? 0),
  };
}

async function getZoneById(zoneId: number, eventId?: number) {
  const params: number[] = [zoneId];
  const eventClause = eventId ? 'AND sz.event_id = ?' : '';
  if (eventId) params.push(eventId);

  const [rows] = await pool.execute<SeatZoneRow[]>(
    `SELECT sz.id, sz.event_id, sz.name, sz.price, sz.color, sz.total_rows, sz.total_cols,
            COUNT(s.id) AS total_seats,
            SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_seats
     FROM seat_zones sz
     LEFT JOIN seats s ON s.zone_id = sz.id
     WHERE sz.id = ? ${eventClause}
     GROUP BY sz.id`,
    params,
  );

  return rows[0] ? normalizeZone(rows[0]) : null;
}

function assertValidDimensionsForMode(mode: SeatingMode, totalRows: number, totalCols: number) {
  if (mode === 'seated') {
    if (totalRows < 1 || totalRows > 26) {
      throw AppError.badRequest('Khu ghế ngồi chỉ hỗ trợ 1–26 hàng', 'INVALID_SEAT_MATRIX');
    }
    if (totalCols < 1 || totalCols > 50) {
      throw AppError.badRequest('Khu ghế ngồi chỉ hỗ trợ 1–50 cột', 'INVALID_SEAT_MATRIX');
    }
    return;
  }

  if (totalRows !== 1) {
    throw AppError.badRequest('Khu vực/vào cửa phải dùng đúng 1 hàng logic', 'INVALID_ZONE_CAPACITY');
  }
  if (totalCols < 1 || totalCols > 99999) {
    throw AppError.badRequest('Sức chứa khu vực không hợp lệ', 'INVALID_ZONE_CAPACITY');
  }
}

function buildSeatMatrix(zoneId: number, totalRows: number, totalCols: number) {
  const seatValues: (number | string)[] = [];
  const placeholders: string[] = [];
  for (let row = 0; row < totalRows; row += 1) {
    const rowLabel = String.fromCharCode(65 + row);
    for (let col = 1; col <= totalCols; col += 1) {
      placeholders.push('(?, ?, ?)');
      seatValues.push(zoneId, rowLabel, col);
    }
  }
  return { placeholders, seatValues };
}

async function ensureDraftEvent(eventId: number) {
  const [rows] = await pool.execute<(RowDataPacket & { id: number; status: EventStatus; seating_mode: SeatingMode })[]>(
    'SELECT id, status, seating_mode FROM events WHERE id = ?',
    [eventId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  }
  if (rows[0].status !== 'draft') {
    throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
  }
  return rows[0];
}

async function ensureZoneEditable(zoneId: number, eventId: number) {
  const [rows] = await pool.execute<(RowDataPacket & {
    status: EventStatus;
    seating_mode: SeatingMode;
    total_rows: number;
    total_cols: number;
  })[]>(
    `SELECT e.status, e.seating_mode, sz.total_rows, sz.total_cols
     FROM seat_zones sz
     JOIN events e ON e.id = sz.event_id
     WHERE sz.id = ? AND sz.event_id = ?`,
    [zoneId, eventId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Seat zone not found', 'SEAT_ZONE_NOT_FOUND');
  }
  if (rows[0].status !== 'draft') {
    throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
  }
  return rows[0];
}

export async function listSeatZones(eventId: number) {
  const [eventRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM events WHERE id = ?',
    [eventId],
  );
  if (eventRows.length === 0) {
    throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  }

  const [rows] = await pool.execute<SeatZoneRow[]>(
    `SELECT sz.id, sz.event_id, sz.name, sz.price, sz.color, sz.total_rows, sz.total_cols,
            COUNT(s.id) AS total_seats,
            SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_seats
     FROM seat_zones sz
     LEFT JOIN seats s ON s.zone_id = sz.id
     WHERE sz.event_id = ?
     GROUP BY sz.id
     ORDER BY sz.id ASC`,
    [eventId],
  );

  return rows.map(normalizeZone);
}

export async function createSeatZone(eventId: number, input: CreateSeatZoneInput) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [eventRows] = await conn.execute<(RowDataPacket & {
      id: number;
      status: EventStatus;
      seating_mode: SeatingMode;
    })[]>(
      'SELECT id, status, seating_mode FROM events WHERE id = ? FOR UPDATE',
      [eventId],
    );
    if (eventRows.length === 0) {
      throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    }
    if (eventRows[0].status !== 'draft') {
      throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
    }
    assertValidDimensionsForMode(eventRows[0].seating_mode, input.total_rows, input.total_cols);

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, input.name, input.price, input.color, input.total_rows, input.total_cols],
    );
    const zoneId = result.insertId;

    const { placeholders, seatValues } = buildSeatMatrix(zoneId, input.total_rows, input.total_cols);

    if (placeholders.length > 0) {
      await conn.execute(
        `INSERT INTO seats (zone_id, row_label, col_number) VALUES ${placeholders.join(', ')}`,
        seatValues,
      );
    }

    await conn.commit();
    return getZoneById(zoneId, eventId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateSeatZone(eventId: number, zoneId: number, input: UpdateSeatZoneInput) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<(RowDataPacket & {
      status: EventStatus;
      seating_mode: SeatingMode;
      total_rows: number;
      total_cols: number;
    })[]>(
      `SELECT e.status, e.seating_mode, sz.total_rows, sz.total_cols
       FROM seat_zones sz
       JOIN events e ON e.id = sz.event_id
       WHERE sz.id = ? AND sz.event_id = ?
       FOR UPDATE`,
      [zoneId, eventId],
    );

    if (rows.length === 0) {
      throw AppError.notFound('Seat zone not found', 'SEAT_ZONE_NOT_FOUND');
    }
    if (rows[0].status !== 'draft') {
      throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
    }

    const nextRows = input.total_rows ?? rows[0].total_rows;
    const nextCols = input.total_cols ?? rows[0].total_cols;
    assertValidDimensionsForMode(rows[0].seating_mode, nextRows, nextCols);

    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (input.name !== undefined) fields.push('name = ?'), values.push(input.name);
    if (input.price !== undefined) fields.push('price = ?'), values.push(input.price);
    if (input.color !== undefined) fields.push('color = ?'), values.push(input.color);
    if (input.total_rows !== undefined) fields.push('total_rows = ?'), values.push(input.total_rows);
    if (input.total_cols !== undefined) fields.push('total_cols = ?'), values.push(input.total_cols);

    values.push(zoneId, eventId);
    await conn.execute(
      `UPDATE seat_zones SET ${fields.join(', ')} WHERE id = ? AND event_id = ?`,
      values,
    );

    const dimensionsChanged = nextRows !== rows[0].total_rows || nextCols !== rows[0].total_cols;
    if (dimensionsChanged) {
      await conn.execute('DELETE FROM seats WHERE zone_id = ?', [zoneId]);
      const { placeholders, seatValues } = buildSeatMatrix(zoneId, nextRows, nextCols);
      if (placeholders.length > 0) {
        await conn.execute(
          `INSERT INTO seats (zone_id, row_label, col_number) VALUES ${placeholders.join(', ')}`,
          seatValues,
        );
      }
    }

    await conn.commit();
    return getZoneById(zoneId, eventId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteSeatZone(eventId: number, zoneId: number) {
  await ensureZoneEditable(zoneId, eventId);

  await pool.execute<ResultSetHeader>(
    'DELETE FROM seat_zones WHERE id = ? AND event_id = ?',
    [zoneId, eventId],
  );
}

export async function assertEventCanReceiveZones(eventId: number) {
  await ensureDraftEvent(eventId);
}
