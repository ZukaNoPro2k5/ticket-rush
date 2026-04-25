export type PwCheck = { label: string; pass: boolean };

export function passwordChecks(pw: string): PwCheck[] {
  return [
    { label: '8+ ký tự',  pass: pw.length >= 8 },
    { label: 'Chữ HOA',   pass: /[A-Z]/.test(pw) },
    { label: 'Chữ số',    pass: /[0-9]/.test(pw) },
  ];
}

export function strengthScore(pw: string): 0 | 1 | 2 | 3 {
  return passwordChecks(pw).filter((c) => c.pass).length as 0 | 1 | 2 | 3;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function extractApiError(err: unknown, fallback: string): string {
  const r = (err as { response?: { data?: { message?: string; error?: { message?: string } } } })?.response?.data;
  return r?.error?.message ?? r?.message ?? fallback;
}
