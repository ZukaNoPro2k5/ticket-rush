import api from './client';

export interface QueueStatus {
  enabled: boolean;
  position: number;
  ahead: number;
  totalWaiting: number;
  granted: boolean;
  estimatedWaitSec: number;
}

export async function enterQueue(eventId: number): Promise<QueueStatus> {
  const res = await api.post(`/events/${eventId}/queue/enter`);
  return res.data.data;
}

export async function getQueueStatus(eventId: number): Promise<QueueStatus> {
  const res = await api.get(`/events/${eventId}/queue/status`);
  return res.data.data;
}

export async function leaveQueue(eventId: number): Promise<void> {
  await api.post(`/events/${eventId}/queue/leave`);
}
