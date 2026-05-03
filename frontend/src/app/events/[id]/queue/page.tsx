'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { Card, Button } from '@/components/ui';
import { enterQueue, getQueueStatus, leaveQueue, type QueueStatus } from '@/lib/api';

const POLL_INTERVAL_MS = 2500;

function QueueContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const enteredRef = useRef(false);

  // Enter queue once on mount
  useEffect(() => {
    if (!eventId || enteredRef.current) return;
    enteredRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const result = await enterQueue(eventId);
        if (cancelled) return;
        setStatus(result);
        if (result.position > 0) setInitialPosition(result.position);
        if (result.granted) router.replace(`/events/${eventId}/seats`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không thể vào phòng chờ';
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, router]);

  // Poll status
  useEffect(() => {
    if (!eventId || !status || status.granted) return;

    const interval = setInterval(async () => {
      try {
        const next = await getQueueStatus(eventId);
        setStatus(next);
        if (next.granted) {
          clearInterval(interval);
          router.replace(`/events/${eventId}/seats`);
        }
      } catch {
        // swallow transient errors, keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [eventId, status, router]);

  const handleLeave = async () => {
    try {
      await leaveQueue(eventId);
    } finally {
      router.push(`/events/${eventId}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Đang kết nối phòng chờ...</div>
      </div>
    );
  }

  const progress = initialPosition && initialPosition > 0
    ? Math.max(0, Math.min(100, ((initialPosition - status.position) / initialPosition) * 100))
    : 0;

  const minutes = Math.floor(status.estimatedWaitSec / 60);
  const seconds = status.estimatedWaitSec % 60;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Card className="max-w-xl w-full p-8 md:p-12 shadow-xl border border-indigo-100">
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
          Phòng chờ ảo
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sự kiện đang có lượng truy cập lớn. Vui lòng giữ trang này để giữ vị trí của bạn.
        </p>

        {/* Position badge */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center mb-6">
          <div className="text-sm opacity-80 uppercase tracking-wider mb-1">Vị trí của bạn</div>
          <motion.div
            key={status.position}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-bold tabular-nums"
          >
            #{status.position}
          </motion.div>
          <div className="text-sm opacity-80 mt-2">
            trong tổng số {status.totalWaiting.toLocaleString('vi-VN')} người đang chờ
          </div>
        </div>

        {/* Progress bar */}
        {initialPosition && initialPosition > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
            <div className="text-xs text-gray-500 mb-1">Trước bạn</div>
            <div className="text-lg font-semibold text-gray-900 tabular-nums">
              {status.ahead.toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
            <div className="text-xs text-gray-500 mb-1">Thời gian chờ ước tính</div>
            <div className="text-lg font-semibold text-gray-900 tabular-nums">
              {minutes > 0 ? `${minutes}p ` : ''}{seconds}s
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-center text-gray-500">
            Hệ thống sẽ tự động chuyển bạn sang trang chọn ghế khi đến lượt.
            Đừng tải lại hoặc tắt trang.
          </p>
          <Button onClick={handleLeave} variant="ghost" className="text-gray-500 hover:text-red-600">
            Rời khỏi phòng chờ
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function QueuePage() {
  return (
    <ProtectedRoute>
      <QueueContent />
    </ProtectedRoute>
  );
}
