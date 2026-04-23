import { useState, useEffect } from 'react';

/**
 * Countdown timer — returns seconds remaining until expiresAt.
 * Returns 0 when expired or expiresAt is null.
 */
export function useCountdown(expiresAt: string | null): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSeconds(0);
      return;
    }

    const calc = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setSeconds(remaining);
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return seconds;
}
