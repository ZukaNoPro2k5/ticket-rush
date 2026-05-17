'use client';

import { useMemo } from 'react';
import { QrCode } from 'lucide-react';

const QR_SIZE = 25;

function hashPayload(payload: string): number {
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function inFinderArea(row: number, col: number): boolean {
  const topLeft = row < 7 && col < 7;
  const topRight = row < 7 && col >= QR_SIZE - 7;
  const bottomLeft = row >= QR_SIZE - 7 && col < 7;
  return topLeft || topRight || bottomLeft;
}

function buildQrCells(payload: string) {
  const seed = hashPayload(payload);
  const cells: { row: number; col: number }[] = [];

  for (let row = 0; row < QR_SIZE; row += 1) {
    for (let col = 0; col < QR_SIZE; col += 1) {
      if (inFinderArea(row, col)) continue;
      const timing = row === 6 || col === 6;
      const value = seed + row * 41 + col * 59 + row * col * 13;
      if ((timing && (row + col) % 2 === 0) || value % 5 === 0 || value % 7 === 0 || value % 17 === 0) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}

function FinderPattern({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="7" height="7" fill="#1c1917" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fafaf9" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1c1917" />
    </>
  );
}

export function PaymentQrMock({ bookingId, amount, expiresAt }: {
  bookingId: number;
  amount: number;
  expiresAt: string;
}) {
  const payload = `TICKETRUSH|BOOKING:${bookingId}|AMOUNT:${amount}|EXP:${expiresAt}`;
  const cells = useMemo(() => buildQrCells(payload), [payload]);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
        <QrCode className="h-4 w-4" />
        Mã QR thanh toán demo
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="rounded-2xl bg-stone-50 p-3 shadow-sm ring-1 ring-amber-100">
          <svg
            viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
            className="h-36 w-36"
            role="img"
            aria-label="QR thanh toán demo"
            shapeRendering="crispEdges"
          >
            <rect width={QR_SIZE} height={QR_SIZE} fill="#fafaf9" />
            <FinderPattern x={0} y={0} />
            <FinderPattern x={QR_SIZE - 7} y={0} />
            <FinderPattern x={0} y={QR_SIZE - 7} />
            {cells.map((cell) => (
              <rect key={`${cell.row}-${cell.col}`} x={cell.col} y={cell.row} width="1" height="1" fill="#1c1917" />
            ))}
          </svg>
        </div>
        <p className="max-w-xs text-sm leading-6 text-stone-600">
          Đây là QR mô phỏng trong môi trường dev. Chọn phương thức rồi bấm thanh toán để hệ thống giả lập giao dịch thành công.
        </p>
      </div>
    </div>
  );
}
