import { RowDataPacket } from 'mysql2';
import pool from './database';

interface BookingRulesRow extends RowDataPacket {
  ticket_hold_minutes: number;
  max_tickets_per_booking: number;
}

interface RuntimeSystemSettingsRow extends BookingRulesRow {
  maintenance_mode: number | boolean;
}

const FALLBACK_RULES = {
  ticketHoldMinutes: 10,
  maxTicketsPerBooking: 10,
};

const FALLBACK_SYSTEM_SETTINGS = {
  ...FALLBACK_RULES,
  maintenanceMode: false,
};

let runtimeSettingsCache: {
  value: typeof FALLBACK_SYSTEM_SETTINGS;
  expiresAt: number;
} | null = null;

export async function getBookingRules() {
  try {
    const [rows] = await pool.query<BookingRulesRow[]>(
      `SELECT ticket_hold_minutes, max_tickets_per_booking
       FROM admin_system_settings
       WHERE id = 1`,
    );
    if (rows.length === 0) return FALLBACK_RULES;

    return {
      ticketHoldMinutes: Number(rows[0].ticket_hold_minutes) || FALLBACK_RULES.ticketHoldMinutes,
      maxTicketsPerBooking: Number(rows[0].max_tickets_per_booking) || FALLBACK_RULES.maxTicketsPerBooking,
    };
  } catch {
    // Existing environments may not have applied migration 012 yet.
    return FALLBACK_RULES;
  }
}

export async function getRuntimeSystemSettings() {
  const now = Date.now();
  if (runtimeSettingsCache && runtimeSettingsCache.expiresAt > now) {
    return runtimeSettingsCache.value;
  }

  try {
    const [rows] = await pool.query<RuntimeSystemSettingsRow[]>(
      `SELECT ticket_hold_minutes, max_tickets_per_booking, maintenance_mode
       FROM admin_system_settings
       WHERE id = 1`,
    );
    const row = rows[0];
    const value = row
      ? {
          ticketHoldMinutes: Number(row.ticket_hold_minutes) || FALLBACK_RULES.ticketHoldMinutes,
          maxTicketsPerBooking: Number(row.max_tickets_per_booking) || FALLBACK_RULES.maxTicketsPerBooking,
          maintenanceMode: Boolean(row.maintenance_mode),
        }
      : FALLBACK_SYSTEM_SETTINGS;

    runtimeSettingsCache = { value, expiresAt: now + 15_000 };
    return value;
  } catch {
    return FALLBACK_SYSTEM_SETTINGS;
  }
}

export function invalidateRuntimeSystemSettingsCache() {
  runtimeSettingsCache = null;
}
