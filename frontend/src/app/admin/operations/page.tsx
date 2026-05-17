"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fadeUp, staggerContainer } from "@/lib/motion";
import api from "@/lib/api/client";
import { Building2, Loader2, Save, Shield, Ticket } from "lucide-react";

type SystemSettings = {
  company_name: string;
  support_email: string;
  address: string;
  ticket_hold_minutes: number;
  max_tickets_per_booking: number;
  timezone: string;
  language: "vi" | "en";
  maintenance_mode: boolean;
  payment_sandbox_mode: boolean;
};

export default function OperationsSettingsPage() {
  const [form, setForm] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ success: boolean; data: SystemSettings }>("/admin/settings/system");
      setForm(data.data);
    } catch {
      toast.error("Không tải được cấu hình vận hành");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        company_name: form.company_name,
        support_email: form.support_email,
        address: form.address,
        ticket_hold_minutes: Number(form.ticket_hold_minutes),
        max_tickets_per_booking: Number(form.max_tickets_per_booking),
        timezone: form.timezone,
        language: form.language,
        maintenance_mode: form.maintenance_mode,
      };
      const { data } = await api.put<{ success: boolean; data: SystemSettings }>("/admin/settings/system", payload);
      setForm(data.data);
      toast.success("Đã lưu cấu hình vận hành");
    } catch {
      toast.error("Không thể lưu cấu hình vận hành");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-stone-100" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Vận hành hệ thống</h1>
          <p className="mt-1 text-sm text-stone-500">
            Những luật nền ảnh hưởng trực tiếp đến luồng đặt vé và trạng thái nền tảng.
          </p>
        </div>
        <button
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </button>
      </motion.div>

      <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-5">
        <SettingsCard
          icon={Building2}
          accent="bg-stone-100 text-stone-600"
          title="Thông tin nền tảng"
          description="Dùng cho email hệ thống và khu vực hỗ trợ."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên công ty / nền tảng">
              <input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Email hỗ trợ">
              <input type="email" value={form.support_email} onChange={(e) => set("support_email", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Địa chỉ" className="md:col-span-2">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className="admin-input" />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Ticket}
          accent="bg-amber-50 text-amber-600"
          title="Quy định vé"
          description="Giới hạn mặc định khi khách bắt đầu đặt vé."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Thời gian giữ vé (phút)">
              <input
                type="number"
                min={1}
                value={form.ticket_hold_minutes}
                onChange={(e) => set("ticket_hold_minutes", Number(e.target.value))}
                className="admin-input"
              />
            </Field>
            <Field label="Tối đa vé / giao dịch">
              <input
                type="number"
                min={1}
                value={form.max_tickets_per_booking}
                onChange={(e) => set("max_tickets_per_booking", Number(e.target.value))}
                className="admin-input"
              />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Shield}
          accent="bg-red-50 text-red-600"
          title="Trạng thái nền tảng"
          description="Dành cho tình huống cần can thiệp vận hành."
        >
          <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-900">Chế độ bảo trì</p>
              <p className="text-xs text-stone-500">Tạm khóa trang khách hàng, chỉ admin vẫn truy cập được.</p>
            </div>
            <button
              onClick={() => set("maintenance_mode", !form.maintenance_mode)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                form.maintenance_mode ? "bg-red-500" : "bg-stone-200"
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                form.maintenance_mode ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </SettingsCard>
      </motion.div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  accent,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function Field({ label, className, children }: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-stone-600">{label}</span>
      {children}
    </label>
  );
}
