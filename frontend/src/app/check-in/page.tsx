'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Camera, CheckCircle2, Keyboard, Loader2, ScanLine, TicketCheck, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/providers';
import { checkInTicket } from '@/lib/api/events';

type BarcodeDetectorResult = { rawValue: string };
type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

type CheckInResult = {
  id?: number;
  ticket_id?: number;
  status?: string;
  checked_in_at?: string | null;
  event?: { title?: string; venue?: string; event_date?: string } | string;
  seat?: { zone_name?: string; row_label?: string; col_number?: number; price?: number } | string;
  holder?: { full_name?: string; email?: string } | string;
};

function parseTicketId(raw: string): number | null {
  const value = raw.trim();
  if (/^\d+$/.test(value)) return Number(value);

  try {
    const json = JSON.parse(value) as Record<string, unknown>;
    const candidate = json.ticket_id ?? json.ticketId ?? json.ticketID ?? json.id;
    if (typeof candidate === 'number' && Number.isInteger(candidate)) return candidate;
    if (typeof candidate === 'string' && /^\d+$/.test(candidate)) return Number(candidate);
  } catch {
    // QR can be plain text, URL, or JSON; non-JSON values continue to regex fallback.
  }

  const match = value.match(/(?:ticket_id|ticketId|ticket|id)[=:/-](\d+)/i);
  return match ? Number(match[1]) : null;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Vừa xong';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function CheckInPage() {
  return (
    <ProtectedRoute requireAdmin>
      <CheckInWorkspace />
    </ProtectedRoute>
  );
}

function CheckInWorkspace() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanningRef = useRef(false);
  const [ticketInput, setTicketInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('Camera chưa bật.');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [lastRaw, setLastRaw] = useState('');

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (video) video.srcObject = null;
    setCameraActive(false);
    scanningRef.current = false;
  }, []);

  const submitTicket = useCallback(
    async (ticketId: number) => {
      if (!Number.isInteger(ticketId) || ticketId <= 0) {
        toast.error('Ticket id không hợp lệ.');
        return;
      }
      setSubmitting(true);
      setResult(null);
      try {
        const data = (await checkInTicket(ticketId)) as CheckInResult;
        setResult(data);
        setTicketInput(String(ticketId));
        toast.success('Soát vé thành công.');
      } catch (err) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
          'Không thể soát vé. Kiểm tra ticket id và thử lại.';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const startCamera = async () => {
    setResult(null);
    setLastRaw('');

    if (!window.BarcodeDetector) {
      setCameraMessage('Trình duyệt chưa hỗ trợ BarcodeDetector. Hãy nhập ticket id thủ công.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage('Trình duyệt chưa cho phép truy cập camera. Hãy nhập ticket id thủ công.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraMessage('Đưa QR vào khung hình để quét.');
    } catch {
      setCameraMessage('Không mở được camera. Kiểm tra quyền trình duyệt hoặc nhập ticket id thủ công.');
    }
  };

  useEffect(() => {
    if (!cameraActive || !window.BarcodeDetector || !videoRef.current) return undefined;

    let frame = 0;
    let cancelled = false;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    const scan = async () => {
      if (cancelled || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState >= 2 && !scanningRef.current) {
        try {
          const codes = await detector.detect(video);
          const raw = codes[0]?.rawValue;
          if (raw) {
            scanningRef.current = true;
            setLastRaw(raw);
            const ticketId = parseTicketId(raw);
            if (ticketId) {
              stopCamera();
              await submitTicket(ticketId);
              return;
            }
            setCameraMessage('QR không chứa ticket id. Backend hiện tạo QR theo booking/seat, hãy nhập ticket id thủ công.');
            scanningRef.current = false;
          }
        } catch {
          setCameraMessage('Không đọc được QR trong khung hình hiện tại.');
        }
      }
      frame = window.requestAnimationFrame(scan);
    };

    frame = window.requestAnimationFrame(scan);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [cameraActive, stopCamera, submitTicket]);

  useEffect(() => stopCamera, [stopCamera]);

  const submitManual = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ticketId = parseTicketId(ticketInput);
    if (!ticketId) {
      toast.error('Nhập ticket id dạng số.');
      return;
    }
    void submitTicket(ticketId);
  };

  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/events" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500">
              <TicketCheck className="h-5 w-5" />
            </span>
            TicketRush Check-in
          </Link>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">Admin / Staff</span>
        </header>

        <div className="grid flex-1 gap-5 py-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <div className="relative aspect-[3/4] bg-black sm:aspect-video lg:aspect-[4/5]">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              {!cameraActive && (
                <div className="absolute inset-0 grid place-items-center bg-stone-900">
                  <div className="text-center">
                    <Camera className="mx-auto h-10 w-10 text-white/40" />
                    <p className="mt-3 text-sm text-white/60">{cameraMessage}</p>
                  </div>
                </div>
              )}
              {cameraActive && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-56 w-56 rounded-3xl border-2 border-amber-400 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ScanLine className="h-4 w-4 text-amber-300" />
                {cameraMessage}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void startCamera()}
                  disabled={cameraActive}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:bg-white/10 disabled:text-white/40"
                >
                  Bật camera
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:text-white/30"
                >
                  Tắt
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <form onSubmit={submitManual} className="rounded-2xl border border-white/10 bg-white p-5 text-stone-900 shadow-2xl">
              <div className="mb-4 flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-amber-600" />
                <h1 className="font-display text-lg font-bold">Nhập ticket id</h1>
              </div>
              <input
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="VD: 10"
                inputMode="numeric"
                className="h-12 w-full rounded-xl border border-stone-200 px-4 text-lg font-semibold outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 font-semibold text-white hover:bg-stone-800 disabled:bg-stone-200"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Soát vé
              </button>
              {lastRaw && (
                <p className="mt-3 break-all rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
                  QR vừa đọc: {lastRaw}
                </p>
              )}
            </form>

            <ResultCard result={result} submitting={submitting} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function ResultCard({ result, submitting }: { result: CheckInResult | null; submitting: boolean }) {
  if (submitting) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
        <p className="mt-3 text-sm text-white/70">Đang xác thực vé...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <XCircle className="h-5 w-5 text-white/40" />
        <p className="mt-3 text-sm text-white/70">Kết quả soát vé sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  const holder = typeof result.holder === 'string' ? result.holder : result.holder?.full_name;
  const event = typeof result.event === 'string' ? result.event : result.event?.title;
  const seat =
    typeof result.seat === 'string'
      ? result.seat
      : [result.seat?.zone_name, result.seat?.row_label ? `${result.seat.row_label}${result.seat.col_number}` : null]
          .filter(Boolean)
          .join(' - ');

  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-white">
      <div className="flex items-center gap-2 text-emerald-300">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-semibold">Soát vé thành công</span>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <ResultRow label="Ticket" value={String(result.ticket_id ?? result.id ?? 'N/A')} />
        <ResultRow label="Khách" value={holder || 'Không có dữ liệu'} />
        <ResultRow label="Sự kiện" value={event || 'Không có dữ liệu'} />
        <ResultRow label="Ghế" value={seat || 'Không có dữ liệu'} />
        <ResultRow label="Thời gian" value={formatDate(result.checked_in_at)} />
      </dl>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-0.5 font-semibold text-white">{value}</dd>
    </div>
  );
}
