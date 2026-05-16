'use client';

import { ImgHTMLAttributes, useEffect, useMemo, useState } from 'react';
import { getEventFallbackPoster, resolveEventPoster } from '@/lib/utils/eventImages';

type EventPosterImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  src?: string | null;
  category?: string | null;
  fallbackSrc?: string;
};

export function EventPosterImage({
  src,
  category,
  fallbackSrc,
  alt,
  ...props
}: EventPosterImageProps) {
  const fallback = useMemo(
    () => fallbackSrc ?? getEventFallbackPoster(category),
    [category, fallbackSrc],
  );
  const resolvedSrc = useMemo(
    () => resolveEventPoster(src, category),
    [category, src],
  );
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
