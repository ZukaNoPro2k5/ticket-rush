import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';

async function assertExists(table: 'events' | 'posts', id: number) {
  const record = table === 'events'
    ? await prisma.events.findUnique({ where: { id }, select: { id: true } })
    : await prisma.posts.findUnique({ where: { id }, select: { id: true } });
  if (!record) {
    throw AppError.notFound(table === 'events' ? 'Sự kiện không tồn tại' : 'Bài đăng không tồn tại');
  }
}

export async function getEventFavorite(userId: number, eventId: number) {
  await assertExists('events', eventId);
  const favorite = await prisma.event_favorites.findUnique({
    where: { user_id_event_id: { user_id: userId, event_id: eventId } },
    select: { event_id: true },
  });
  return { saved: !!favorite };
}

export async function listEventFavorites(userId: number) {
  const favorites = await prisma.event_favorites.findMany({
    where: { user_id: userId, events: { status: 'published' } },
    orderBy: { created_at: 'desc' },
    include: {
      events: {
        include: {
          seat_zones: {
            include: {
              seats: { select: { status: true } },
            },
          },
        },
      },
    },
  });

  return favorites.map(({ events: event }) => {
    const prices = event.seat_zones.map((zone) => Number(zone.price));
    const allSeats = event.seat_zones.flatMap((zone) => zone.seats);
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      seating_mode: event.seating_mode,
      venue: event.venue,
      event_date: event.event_date,
      poster_url: event.poster_url,
      status: event.status,
      queue_enabled: event.queue_enabled,
      created_by: event.created_by,
      created_at: event.created_at,
      min_price: prices.length ? Math.min(...prices) : null,
      max_price: prices.length ? Math.max(...prices) : null,
      available_seats: allSeats.filter((seat) => seat.status === 'available').length,
      total_seats: allSeats.length,
    };
  });
}

export async function saveEventFavorite(userId: number, eventId: number) {
  await assertExists('events', eventId);
  await prisma.event_favorites.upsert({
    where: { user_id_event_id: { user_id: userId, event_id: eventId } },
    update: {},
    create: { user_id: userId, event_id: eventId },
  });
  return { saved: true };
}

export async function removeEventFavorite(userId: number, eventId: number) {
  await prisma.event_favorites.deleteMany({ where: { user_id: userId, event_id: eventId } });
  return { saved: false };
}

export async function getPostBookmark(userId: number, postId: number) {
  await assertExists('posts', postId);
  const bookmark = await prisma.post_bookmarks.findUnique({
    where: { user_id_post_id: { user_id: userId, post_id: postId } },
    select: { post_id: true },
  });
  return { saved: !!bookmark };
}

export async function savePostBookmark(userId: number, postId: number) {
  await assertExists('posts', postId);
  await prisma.post_bookmarks.upsert({
    where: { user_id_post_id: { user_id: userId, post_id: postId } },
    update: {},
    create: { user_id: userId, post_id: postId },
  });
  return { saved: true };
}

export async function removePostBookmark(userId: number, postId: number) {
  await prisma.post_bookmarks.deleteMany({ where: { user_id: userId, post_id: postId } });
  return { saved: false };
}

export async function subscribeNewsletter(email: string, userId?: number) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.newsletter_subscriptions.findUnique({
    where: { email: normalizedEmail },
    select: { user_id: true },
  });
  await prisma.newsletter_subscriptions.upsert({
    where: { email: normalizedEmail },
    update: {
      user_id: userId ?? existing?.user_id ?? null,
      status: 'active',
      unsubscribed_at: null,
    },
    create: {
      email: normalizedEmail,
      user_id: userId ?? null,
      status: 'active',
    },
  });
  return { subscribed: true };
}
