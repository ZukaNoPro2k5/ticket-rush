"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Settings2, Eye, Save, Code, Zap } from "lucide-react";
import { useState } from "react";

const TEMPLATES = [
  { id: "booking_confirmation", name: "Xác nhận đặt vé", status: "active" },
  { id: "booking_reminder", name: "Nhắc nhở sự kiện", status: "active" },
  { id: "account_welcome", name: "Chào mừng tài khoản mới", status: "active" },
  { id: "password_reset", name: "Quên mật khẩu", status: "active" },
];

export default function MailPage() {
  const [activeTab, setActiveTab] = useState("booking_confirmation");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Tùy chỉnh mail</h1>
          <p className="mt-1 text-sm text-stone-500">
            Thiết kế nội dung và giao diện các email tự động gửi cho khách hàng.
          </p>
        </div>
      </motion.div>

      {/* Main Mail Settings Layout */}
      <motion.div
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-8 md:grid-cols-12"
      >
        {/* Left Col: Template List */}
        <div className="space-y-4 md:col-span-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Mẫu Email
          </div>
          <div className="flex flex-col gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setActiveTab(tmpl.id)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tmpl.id
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
                    : "text-stone-600 hover:bg-stone-50 hover:text-ink-900"
                }`}
              >
                <span>{tmpl.name}</span>
                {activeTab === tmpl.id && <Zap className="h-4 w-4" />}
              </button>
            ))}
          </div>

          <div className="pt-6">
            <button
              onClick={() => setActiveTab("smtp_config")}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
                activeTab === "smtp_config"
                  ? "border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
                  : "border-dashed border-stone-200 text-stone-500 hover:border-solid hover:bg-stone-50 hover:text-ink-900"
              }`}
            >
              <Settings2 className="h-4 w-4" /> Cấu hình Server (SMTP)
            </button>
          </div>
        </div>

        {/* Right Col: Editor */}
        <div className="md:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
            {activeTab === "smtp_config" ? (
              <>
                <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
                  <h2 className="text-base font-semibold text-ink-900">
                    Cấu hình máy chủ gửi Mail (SMTP)
                  </h2>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                    <Save className="h-4 w-4" /> Lưu cấu hình
                  </button>
                </div>
                <div className="space-y-6 p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-ink-900">Máy chủ SMTP (Host)</label>
                      <input type="text" defaultValue="smtp.gmail.com" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-ink-900">Cổng (Port)</label>
                      <input type="text" defaultValue="587" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-ink-900">Tên người gửi (From Name)</label>
                      <input type="text" defaultValue="TicketRush VN" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-ink-900">Email người gửi (From Email)</label>
                      <input type="text" defaultValue="no-reply@ticketrush.vn" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-ink-900">Tên đăng nhập (Username)</label>
                      <input type="text" defaultValue="apikey" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-ink-900">Mật khẩu (Password / App Password)</label>
                      <input type="password" defaultValue="••••••••••••••••••••••••" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-900">Bảo mật kết nối</p>
                      <p className="text-xs text-stone-500">Sử dụng mã hóa TLS/SSL</p>
                    </div>
                    <select className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                      <option value="tls">STARTTLS</option>
                      <option value="ssl">SSL/TLS</option>
                      <option value="none">Không mã hóa</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-base font-semibold text-ink-900">
                {TEMPLATES.find((t) => t.id === activeTab)?.name}
              </h2>
              <div className="flex items-center gap-2">
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50">
                  <Eye className="h-4 w-4" /> Xem trước
                </button>
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                  <Save className="h-4 w-4" /> Lưu
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="space-y-6 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-900">Tiêu đề (Subject)</label>
                <input
                  type="text"
                  defaultValue={activeTab === "booking_confirmation" ? "Xác nhận đặt vé thành công từ TicketRush" : ""}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-900">Nội dung (HTML/Text)</label>
                  <button className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
                    <Code className="h-3 w-3" /> Biến hỗ trợ
                  </button>
                </div>
                <textarea
                  rows={14}
                  defaultValue={activeTab === "booking_confirmation" ? `Xin chào {{user_name}},\n\nCảm ơn bạn đã đặt vé sự kiện {{event_name}}. Mã vé của bạn là: {{ticket_code}}.\n\nVui lòng đưa mã này tại quầy check-in.\n\nHẹn gặp bạn tại sự kiện!` : ""}
                  className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ghi chú</h4>
                <p className="mt-2 text-sm text-stone-600">
                  Bạn có thể sử dụng các biến như <code className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-xs text-ink-700">{`{{user_name}}`}</code>, <code className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-xs text-ink-700">{`{{event_name}}`}</code>, và <code className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-xs text-ink-700">{`{{ticket_code}}`}</code> để cá nhân hóa nội dung. Hệ thống sẽ tự động điền giá trị thực tế khi gửi thư.
                </p>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
