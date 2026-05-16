const EVENT_FALLBACK_POSTERS: Record<string, string> = {
  music: '/images/event-fallbacks/music.svg',
  stage: '/images/event-fallbacks/stage.svg',
  sports: '/images/event-fallbacks/sports.svg',
  workshop: '/images/event-fallbacks/workshop.svg',
  arts: '/images/event-fallbacks/stage.svg',
  tech: '/images/event-fallbacks/workshop.svg',
  food: '/images/event-fallbacks/other.svg',
  entertainment: '/images/event-fallbacks/stage.svg',
  other: '/images/event-fallbacks/other.svg',
};

export function getEventFallbackPoster(category?: string | null): string {
  return EVENT_FALLBACK_POSTERS[category ?? ''] ?? EVENT_FALLBACK_POSTERS.other;
}

export function resolveEventPoster(src?: string | null, category?: string | null): string {
  const value = src?.trim();
  return value || getEventFallbackPoster(category);
}
