'use client';

import { useMemo } from 'react';
import { CreditCard, QrCode } from 'lucide-react';
import { formatVnd, type PendingBooking } from '@/lib/utils/seatUtils';

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
      <rect x={x} y={y} width="7" height="7" fill="#111827" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#111827" />
    </>
  );
}

interface Props {
  booking: PendingBooking;
}

export function PaymentQrMock({ booking }: Props) {
  const payload = `TICKETRUSH|BOOKING:${booking.id}|AMOUNT:${booking.total_amount}|EXP:${booking.expires_at}`;
  const cells = useMemo(() => buildQrCells(payload), [payload]);

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
        <QrCode className="h-4 w-4" />
        QR thanh toán demo
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-amber-100">
          <svg
            viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
            className="h-40 w-40"
            role="img"
            aria-label="QR thanh toán demo"
            shapeRendering="crispEdges"
          >
            <rect width={QR_SIZE} height={QR_SIZE} fill="#ffffff" />
            <FinderPattern x={0} y={0} />
            <FinderPattern x={QR_SIZE - 7} y={0} />
            <FinderPattern x={0} y={QR_SIZE - 7} />
            {cells.map((cell) => (
              <rect
                key={`${cell.row}-${cell.col}`}
                x={cell.col}
                y={cell.row}
                width="1"
                height="1"
                fill="#111827"
              />
            ))}
          </svg>
        </div>

        <div className="min-w-0 flex-1 text-sm text-stone-700">
          <div className="flex items-center gap-2 text-stone-900">
            <CreditCard className="h-4 w-4 text-amber-600" />
            <span className="font-semibold">TicketRush Payment</span>
          </div>
          <dl className="mt-3 space-y-1.5">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Mã đặt vé</dt>
              <dd className="font-mono font-semibold">#{booking.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Số tiền</dt>
              <dd className="font-semibold tabular-nums text-orange-600">{formatVnd(booking.total_amount)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            Đây là QR mô phỏng cho môi trường dev. Nút xác nhận bên dưới vẫn dùng flow confirm hiện tại, chưa đối soát ngân hàng thật.
          </p>
        </div>
      </div>
    </div>
  );
}
