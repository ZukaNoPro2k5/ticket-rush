import api from './client';
import type { ApiResponse, PublicPromoCode } from '@/types';

export async function listPublicPromoCodes() {
  const res = await api.get<ApiResponse<PublicPromoCode[]>>('/promo-codes/public');
  return res.data.data ?? [];
}
