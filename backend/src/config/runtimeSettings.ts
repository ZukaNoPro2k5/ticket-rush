import prisma from './prisma';

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
    const row = await prisma.admin_system_settings.findUnique({
      where: { id: 1 },
      select: { ticket_hold_minutes: true, max_tickets_per_booking: true },
    });
    if (!row) return FALLBACK_RULES;

    return {
      ticketHoldMinutes: Number(row.ticket_hold_minutes) || FALLBACK_RULES.ticketHoldMinutes,
      maxTicketsPerBooking: Number(row.max_tickets_per_booking) || FALLBACK_RULES.maxTicketsPerBooking,
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
    const row = await prisma.admin_system_settings.findUnique({
      where: { id: 1 },
      select: { ticket_hold_minutes: true, max_tickets_per_booking: true, maintenance_mode: true },
    });
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
