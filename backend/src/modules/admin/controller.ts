import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { sendSuccess } from '../../shared/response';
import * as adminService from './service';

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const revenueByMonth = asyncHandler(async (req: Request, res: Response) => {
  const year  = req.query.year  ? Number(req.query.year)  : new Date().getFullYear();
  const month = req.query.month ? Number(req.query.month) : undefined;
  const data  = month
    ? await adminService.getRevenueByDay(year, month)
    : await adminService.getRevenueByMonth(year);
  sendSuccess(res, data);
});

export const fillRates = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getFillRates();
  sendSuccess(res, data);
});

export const audienceStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getAudienceStats();
  sendSuccess(res, data);
});

export const comparisonStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getComparisonStats();
  sendSuccess(res, data);
});

export const topEvents = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const data  = await adminService.getTopEvents(limit);
  sendSuccess(res, data);
});

export const listAdminEvents = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, search, page, limit } = req.query;
  const data = await adminService.listAdminEvents({
    status:   typeof status   === 'string' ? status   : undefined,
    category: typeof category === 'string' ? category : undefined,
    search:   typeof search   === 'string' ? search   : undefined,
    page:     page  ? Number(page)  : 1,
    limit:    limit ? Number(limit) : 20,
  });
  sendSuccess(res, data);
});

export const recentBookings = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const data  = await adminService.getRecentBookings(limit);
  sendSuccess(res, data);
});

export const categoryStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getCategoryStats();
  sendSuccess(res, data);
});

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  const [comparison, topEvts, dashStats] = await Promise.all([
    adminService.getComparisonStats(),
    adminService.getTopEvents(1),
    adminService.getDashboardStats(),
  ]);
  const text = await adminService.generateSummary({
    curMonthRev:     comparison.cur_month_revenue,
    prevMonthRev:    comparison.prev_month_revenue,
    revChangePct:    comparison.revenue_change_pct,
    ytdRev:          comparison.ytd_revenue,
    ytdChangePct:    comparison.ytd_change_pct,
    avgOrder:        comparison.avg_order_value,
    topEventTitle:   topEvts[0]?.title ?? null,
    publishedEvents: dashStats.events.published,
  });
  sendSuccess(res, { text });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const search = req.query.search as string | undefined;
  const data = await adminService.listUsers(page, limit, search);
  sendSuccess(res, data);
});

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const page   = req.query.page   ? Number(req.query.page)  : 1;
  const limit  = req.query.limit  ? Number(req.query.limit) : 20;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const data   = await adminService.listAdminBookings(page, limit, status, search);
  sendSuccess(res, data);
});

export const advancedStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getAdvancedStats();
  sendSuccess(res, data);
});

export const todayStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getTodayStats();
  sendSuccess(res, data);
});

export const insights = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.generateInsights();
  sendSuccess(res, data);
});

export const systemSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getSystemSettings();
  sendSuccess(res, data);
});

export const updateSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.updateSystemSettings(req.body);
  sendSuccess(res, data, 'Đã cập nhật cài đặt hệ thống');
});

export const paymentSettings = asyncHandler(async (_req: Request, res: Response) => {
  const [system, gateways] = await Promise.all([
    adminService.getSystemSettings(),
    adminService.listPaymentGateways(),
  ]);
  sendSuccess(res, {
    payment_sandbox_mode: system.payment_sandbox_mode,
    gateways,
  });
});

export const updatePaymentSandbox = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.updatePaymentSandboxMode(req.body.payment_sandbox_mode);
  sendSuccess(res, { payment_sandbox_mode: data.payment_sandbox_mode }, 'Đã cập nhật môi trường thanh toán');
});

export const updatePaymentGateway = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.updatePaymentGateway(req.params.id, req.body);
  sendSuccess(res, data, 'Đã cập nhật cổng thanh toán');
});

export const mailSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getMailSettings();
  sendSuccess(res, data);
});

export const updateSmtpSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.updateSmtpSettings(req.body);
  sendSuccess(res, data, 'Đã cập nhật cấu hình SMTP');
});

export const updateEmailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.updateEmailTemplate(req.params.id, req.body);
  sendSuccess(res, data, 'Đã cập nhật mẫu email');
});
