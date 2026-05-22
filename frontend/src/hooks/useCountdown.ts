import { useState, useEffect } from 'react';

/**
 * Countdown timer — returns seconds remaining until expiresAt.
 * Returns 0 when expired or expiresAt is null.
 */
export function useCountdown(expiresAt: string | null): number {
  const calculate = (expireString: string | null) => {
    if (!expireString) return 0;
    return Math.max(0, Math.floor((new Date(expireString).getTime() - Date.now()) / 1000));
  };

  const [seconds, setSeconds] = useState(() => calculate(expiresAt));

  useEffect(() => {
    setSeconds(calculate(expiresAt)); // Cập nhật ngay khi expiresAt đổi
    if (!expiresAt) return;

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
