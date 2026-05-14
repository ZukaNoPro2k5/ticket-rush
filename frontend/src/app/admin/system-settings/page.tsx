"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Building2, Save, Globe, Shield, Ticket, BellRing } from "lucide-react";

export default function SystemSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm text-stone-500">
            Cấu hình các thông số cốt lõi của nền tảng TicketRush.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700">
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </button>
      </motion.div>

      {/* Settings Sections */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

        {/* General Settings */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex px-6 py-5">
            <div className="mr-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink-900">Thông tin cơ bản</h2>
              <p className="mb-4 text-sm text-stone-500">Hiển thị trong chân trang và email hệ thống.</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-900">Tên công ty / Nền tảng</label>
                  <input type="text" defaultValue="TicketRush VN" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-900">Email hỗ trợ</label>
                  <input type="email" defaultValue="support@ticketrush.vn" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-ink-900">Địa chỉ</label>
                  <input type="text" defaultValue="Q. Cầu Giấy, Hà Nội" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Event Rules */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex px-6 py-5">
            <div className="mr-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink-900">Quy định vé & Sự kiện</h2>
              <p className="mb-4 text-sm text-stone-500">Giới hạn mặc định khi tạo mới sự kiện.</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-900">Thời gian giữ vé (phút)</label>
                  <input type="number" defaultValue="15" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-900">Tối đa vé / giao dịch</label>
                  <input type="number" defaultValue="10" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Localisation */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex px-6 py-5">
            <div className="mr-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink-900">Khu vực & Ngôn ngữ</h2>

              <div className="mt-4 flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">Múi giờ mặc định</p>
                  <p className="text-sm text-stone-500">Sử dụng trên toàn hệ thống đặt vé.</p>
                </div>
                <select className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="Asia/Ho_Chi_Minh">UTC+07:00 (Hồ Chí Minh)</option>
                </select>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">Ngôn ngữ hiển thị</p>
                  <p className="text-sm text-stone-500">Ngôn ngữ chính trên trang khách hàng.</p>
                </div>
                <select className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Maintenance / Security */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          <div className="flex px-6 py-5">
            <div className="mr-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink-900">Bảo mật & Trạng thái</h2>

              <div className="mt-4 flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">Chế độ bảo trì</p>
                  <p className="text-sm text-stone-500">Tạm khóa trang khách hàng, hiển thị thông báo bảo trì.</p>
                </div>
                <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-stone-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
