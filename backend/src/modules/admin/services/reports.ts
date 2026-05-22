import {
  generateInsights,
  getAdvancedStats,
  getAudienceStats,
  getCategoryStats,
  getComparisonStats,
  getDashboardStats,
  getTopEvents,
} from './analytics';

export interface BusinessReportSection {
  title: string;
  body: string;
}

export interface BusinessReport {
  title: string;
  generated_at: string;
  model: string;
  source: 'ai' | 'fallback';
  executive_summary: string;
  highlights: string[];
  sections: BusinessReportSection[];
  disclaimer: string;
}

function money(n: number) {
  return `${Math.round(n).toLocaleString('vi-VN')}đ`;
}

function safeJson<T>(text: string): T | null {
  const normalized = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  try {
    return JSON.parse(normalized) as T;
  } catch {
    return null;
  }
}

function fallbackReport(input: {
  dashboard: Awaited<ReturnType<typeof getDashboardStats>>;
  comparison: Awaited<ReturnType<typeof getComparisonStats>>;
  topEvents: Awaited<ReturnType<typeof getTopEvents>>;
  categoryStats: Awaited<ReturnType<typeof getCategoryStats>>;
  advanced: Awaited<ReturnType<typeof getAdvancedStats>>;
  insights: Awaited<ReturnType<typeof generateInsights>>;
}) {
  const topEvent = input.topEvents[0];
  const topCategory = input.categoryStats[0];
  return {
    executive_summary: `Nền tảng ghi nhận ${money(input.comparison.cur_month_revenue)} doanh thu trong tháng hiện tại, với ${input.dashboard.total_bookings.toLocaleString('vi-VN')} đơn đã xác nhận lũy kế. ${topEvent ? `"${topEvent.title}" đang là sự kiện dẫn đầu doanh thu.` : 'Chưa có sự kiện tạo doanh thu nổi bật.'}`,
    highlights: [
      `Doanh thu tháng hiện tại: ${money(input.comparison.cur_month_revenue)}.`,
      `Giá trị đơn trung bình: ${money(input.comparison.avg_order_value)}.`,
      topCategory
        ? `Danh mục đóng góp lớn nhất: ${topCategory.category}, đạt ${money(topCategory.revenue)}.`
        : 'Chưa có danh mục tạo doanh thu đủ lớn để xếp hạng.',
      `Tỷ lệ khách quay lại: ${input.advanced.repeat_customer_pct}%.`,
    ],
    sections: [
      {
        title: 'Tổng quan kinh doanh',
        body: `Hệ thống hiện có ${input.dashboard.events.published} sự kiện đang mở bán và ${input.dashboard.total_customers.toLocaleString('vi-VN')} khách hàng đã phát sinh đơn xác nhận. Doanh thu lũy kế đang ở mức ${money(input.dashboard.revenue)}.`,
      },
      {
        title: 'Hiệu quả bán vé',
        body: `Doanh thu trung bình mỗi vé đạt ${money(input.advanced.revenue_per_ticket)}. Tốc độ bán hiện tại là ${input.advanced.bookings_per_day} đơn/ngày, còn tỷ lệ hủy trong 30 ngày gần nhất là ${input.advanced.cancellation_rate}%.`,
      },
      {
        title: 'Cơ cấu khách hàng và danh mục',
        body: topCategory
          ? `Danh mục ${topCategory.category} đang dẫn đầu với ${money(topCategory.revenue)} doanh thu từ ${topCategory.bookings} đơn. Tỷ lệ mua lặp lại ${input.advanced.repeat_customer_pct}% cho thấy nền tảng đã bắt đầu hình thành tập khách quay lại.`
          : 'Dữ liệu hiện chưa đủ dày để kết luận về cơ cấu danh mục. Nên theo dõi thêm khi số đơn tăng.',
      },
      {
        title: 'Khuyến nghị điều hành',
        body: input.insights.insights.length
          ? input.insights.insights.slice(0, 3).map((insight) => insight.description).join(' ')
          : 'Chưa có cảnh báo vận hành lớn. Nên tiếp tục giữ nhịp theo dõi fill-rate, tỷ lệ hủy và hiệu quả mã giảm giá theo tuần.',
      },
    ],
  };
}

export async function generateBusinessReport(): Promise<BusinessReport> {
  const [
    dashboard,
    comparison,
    topEvents,
    categoryStats,
    audience,
    advanced,
    insights,
  ] = await Promise.all([
    getDashboardStats(),
    getComparisonStats(),
    getTopEvents(3),
    getCategoryStats(),
    getAudienceStats(),
    getAdvancedStats(),
    generateInsights(),
  ]);

  const generatedAt = new Date().toISOString();
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const fallback = fallbackReport({ dashboard, comparison, topEvents, categoryStats, advanced, insights });
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const prompt = `Bạn là chuyên gia phân tích kinh tế cho nền tảng bán vé sự kiện TicketRush tại Việt Nam.
Nhiệm vụ: viết báo cáo điều hành cho chủ hệ thống, chỉ dựa trên dữ liệu đầu vào.
Nguyên tắc:
- Không bịa thêm số liệu, không suy diễn quá dữ liệu.
- Nếu dữ liệu bằng 0 hoặc còn mỏng, phải nói rõ mức độ hạn chế.
- Giọng văn chuyên nghiệp, ngắn gọn, hữu ích cho quyết định vận hành.
- "highlights" phải là đúng 4 ý ngắn, mỗi ý gắn với một tín hiệu kinh doanh cụ thể.
- "sections" phải theo đúng thứ tự: Tổng quan kinh doanh, Hiệu quả bán vé, Cơ cấu khách hàng và danh mục, Khuyến nghị điều hành, Triển vọng kỳ tới.
Dữ liệu đầu vào:
- Dashboard: ${JSON.stringify(dashboard)}
- So sánh kỳ: ${JSON.stringify(comparison)}
- Top events: ${JSON.stringify(topEvents)}
- Danh mục: ${JSON.stringify(categoryStats)}
- Khán giả: ${JSON.stringify(audience)}
- Chỉ số vận hành: ${JSON.stringify(advanced)}
- Insight hệ thống: ${JSON.stringify(insights)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  executive_summary: { type: 'STRING' },
                  highlights: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    minItems: 4,
                    maxItems: 4,
                  },
                  sections: {
                    type: 'ARRAY',
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: 'OBJECT',
                      properties: {
                        title: { type: 'STRING' },
                        body: { type: 'STRING' },
                      },
                      required: ['title', 'body'],
                    },
                  },
                },
                required: ['executive_summary', 'highlights', 'sections'],
              },
              temperature: 0.35,
              maxOutputTokens: 1800,
            },
          }),
        },
      );
      if (response.ok) {
        const json = await response.json() as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
        const report = raw ? safeJson<typeof fallback>(raw) : null;
        if (
          report
          && typeof report.executive_summary === 'string'
          && Array.isArray(report.highlights)
          && Array.isArray(report.sections)
        ) {
          return {
            title: 'Báo cáo kinh tế vận hành TicketRush',
            generated_at: generatedAt,
            model,
            source: 'ai',
            executive_summary: report.executive_summary,
            highlights: report.highlights.slice(0, 4),
            sections: report.sections.slice(0, 5),
            disclaimer: 'Báo cáo do AI hỗ trợ tạo từ dữ liệu vận hành hiện có, dùng để tham khảo khi ra quyết định.',
          };
        }
      }
    } catch {
      // Gemini is optional; deterministic report keeps the screen useful.
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    title: 'Báo cáo kinh tế vận hành TicketRush',
    generated_at: generatedAt,
    model,
    source: 'fallback',
    ...fallback,
    disclaimer: 'Báo cáo tham khảo được dựng từ dữ liệu vận hành hiện có khi AI chưa sẵn sàng.',
  };
}
