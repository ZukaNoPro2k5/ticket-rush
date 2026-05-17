"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { fadeUp } from "@/lib/motion";
import api from "@/lib/api/client";
import { Eye, Loader2, Save, Settings2, Zap } from "lucide-react";

type TemplateStatus = "active" | "inactive";

type MailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: TemplateStatus;
};

type SmtpSettings = {
  host: string;
  port: number;
  from_name: string;
  from_email: string;
  username: string;
  password: string;
  password_set: boolean;
  encryption: "tls" | "ssl" | "none";
};

type MailSettingsResponse = {
  smtp: Omit<SmtpSettings, "password">;
  templates: MailTemplate[];
};

const SAMPLE_VALUES: Record<string, string> = {
  user_name: "Nguyễn Minh Anh",
  event_name: "Lễ hội âm nhạc mùa hè",
  ticket_code: "TR-8K2M9",
  event_date: "20:00, 18/07/2026",
  reset_link: "https://ticketrush.vn/reset/abc123",
};

export default function MailPage() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [smtp, setSmtp] = useState<SmtpSettings | null>(null);
  const [activeTab, setActiveTab] = useState<string>("booking_confirmation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ success: boolean; data: MailSettingsResponse }>("/admin/settings/mail");
      setTemplates(data.data.templates);
      setSmtp({ ...data.data.smtp, password: "" });
      if (!data.data.templates.some((template) => template.id === activeTab)) {
        setActiveTab(data.data.templates[0]?.id ?? "booking_confirmation");
      }
    } catch {
      toast.error("Không tải được cấu hình mail");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void load();
    // Chỉ cần nạp một lần khi mở trang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTemplate = templates.find((template) => template.id === activeTab) ?? null;

  const previewBody = useMemo(() => {
    if (!activeTemplate) return "";
    return activeTemplate.body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => SAMPLE_VALUES[key] ?? `{{${key}}}`);
  }, [activeTemplate]);

  const updateTemplate = <K extends keyof MailTemplate>(key: K, value: MailTemplate[K]) => {
    if (!activeTemplate) return;
    setTemplates((prev) => prev.map((template) => template.id === activeTemplate.id ? { ...template, [key]: value } : template));
  };

  const saveTemplate = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      const { data } = await api.put<{ success: boolean; data: MailTemplate }>(
        `/admin/settings/mail/templates/${activeTemplate.id}`,
        {
          subject: activeTemplate.subject,
          body: activeTemplate.body,
          status: activeTemplate.status,
        },
      );
      setTemplates((prev) => prev.map((template) => template.id === activeTemplate.id ? data.data : template));
      toast.success("Đã lưu mẫu email");
    } catch {
      toast.error("Không thể lưu mẫu email");
    } finally {
      setSaving(false);
    }
  };

  const saveSmtp = async () => {
    if (!smtp) return;
    setSaving(true);
    try {
      const { data } = await api.put<{ success: boolean; data: Omit<SmtpSettings, "password"> }>(
        "/admin/settings/mail/smtp",
        {
          host: smtp.host,
          port: Number(smtp.port),
          from_name: smtp.from_name,
          from_email: smtp.from_email,
          username: smtp.username,
          ...(smtp.password ? { password: smtp.password } : {}),
          encryption: smtp.encryption,
        },
      );
      setSmtp({ ...data.data, password: "" });
      toast.success("Đã lưu cấu hình SMTP");
    } catch {
      toast.error("Không thể lưu cấu hình SMTP");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="page-title">Tùy chỉnh mail</h1>
        <p className="mt-1 text-sm text-stone-500">
          Quản lý nội dung email tự động và cấu hình máy chủ gửi thư.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Mẫu email</div>
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-stone-100" />)
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setActiveTab(template.id);
                    setShowPreview(false);
                  }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === template.id
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
                      : "text-stone-600 hover:bg-stone-50 hover:text-ink-900"
                  }`}
                >
                  <span>{template.name}</span>
                  {activeTab === template.id && <Zap className="h-4 w-4" />}
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setActiveTab("smtp_config");
              setShowPreview(false);
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
              activeTab === "smtp_config"
                ? "border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
                : "border-dashed border-stone-200 text-stone-500 hover:border-solid hover:bg-stone-50 hover:text-ink-900"
            }`}
          >
            <Settings2 className="h-4 w-4" /> Cấu hình SMTP
          </button>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
          {activeTab === "smtp_config" ? (
            <SmtpEditor smtp={smtp} loading={loading} saving={saving} onChange={setSmtp} onSave={saveSmtp} />
          ) : (
            <TemplateEditor
              template={activeTemplate}
              preview={previewBody}
              showPreview={showPreview}
              loading={loading}
              saving={saving}
              onChange={updateTemplate}
              onTogglePreview={() => setShowPreview((value) => !value)}
              onSave={saveTemplate}
            />
          )}
        </section>
      </motion.div>
    </div>
  );
}

function TemplateEditor({
  template,
  preview,
  showPreview,
  loading,
  saving,
  onChange,
  onTogglePreview,
  onSave,
}: {
  template: MailTemplate | null;
  preview: string;
  showPreview: boolean;
  loading: boolean;
  saving: boolean;
  onChange: <K extends keyof MailTemplate>(key: K, value: MailTemplate[K]) => void;
  onTogglePreview: () => void;
  onSave: () => void;
}) {
  if (loading || !template) {
    return <div className="h-[520px] animate-pulse bg-stone-50" />;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">{template.name}</h2>
          <button
            type="button"
            onClick={() => onChange("status", template.status === "active" ? "inactive" : "active")}
            className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              template.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {template.status === "active" ? "Đang hoạt động" : "Đang tắt"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePreview}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
          >
            <Eye className="h-4 w-4" /> {showPreview ? "Sửa nội dung" : "Xem trước"}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <Field label="Tiêu đề (Subject)">
          <input
            value={template.subject}
            onChange={(e) => onChange("subject", e.target.value)}
            className="admin-input"
          />
        </Field>

        {showPreview ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Bản xem trước</p>
            <div className="rounded-xl bg-white p-4 text-sm leading-7 text-stone-700 shadow-sm whitespace-pre-wrap">
              {preview}
            </div>
          </div>
        ) : (
          <Field label="Nội dung (HTML/Text)">
            <textarea
              rows={14}
              value={template.body}
              onChange={(e) => onChange("body", e.target.value)}
              className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </Field>
        )}

        <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Biến hỗ trợ</h4>
          <p className="mt-2 text-sm text-stone-600">
            Dùng <Code>{"{{user_name}}"}</Code>, <Code>{"{{event_name}}"}</Code>, <Code>{"{{ticket_code}}"}</Code>,
            {" "}<Code>{"{{event_date}}"}</Code> hoặc <Code>{"{{reset_link}}"}</Code> để cá nhân hóa nội dung.
          </p>
        </div>
      </div>
    </>
  );
}

function SmtpEditor({
  smtp,
  loading,
  saving,
  onChange,
  onSave,
}: {
  smtp: SmtpSettings | null;
  loading: boolean;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<SmtpSettings | null>>;
  onSave: () => void;
}) {
  if (loading || !smtp) {
    return <div className="h-[420px] animate-pulse bg-stone-50" />;
  }

  const set = <K extends keyof SmtpSettings>(key: K, value: SmtpSettings[K]) => {
    onChange((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
        <h2 className="text-base font-semibold text-ink-900">Cấu hình máy chủ gửi mail</h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu cấu hình
        </button>
      </div>
      <div className="space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Máy chủ SMTP">
            <input value={smtp.host} onChange={(e) => set("host", e.target.value)} className="admin-input" />
          </Field>
          <Field label="Cổng">
            <input
              type="number"
              value={smtp.port}
              onChange={(e) => set("port", Number(e.target.value))}
              className="admin-input"
            />
          </Field>
          <Field label="Tên người gửi">
            <input value={smtp.from_name} onChange={(e) => set("from_name", e.target.value)} className="admin-input" />
          </Field>
          <Field label="Email người gửi">
            <input value={smtp.from_email} onChange={(e) => set("from_email", e.target.value)} className="admin-input" />
          </Field>
          <Field label="Tên đăng nhập" className="md:col-span-2">
            <input value={smtp.username} onChange={(e) => set("username", e.target.value)} className="admin-input" />
          </Field>
          <Field label="Mật khẩu / App Password" className="md:col-span-2">
            <input
              type="password"
              value={smtp.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={smtp.password_set ? "Đã lưu mật khẩu, để trống nếu không đổi" : "Nhập mật khẩu"}
              className="admin-input"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <div>
            <p className="text-sm font-medium text-ink-900">Bảo mật kết nối</p>
            <p className="text-xs text-stone-500">Chọn cơ chế mã hóa SMTP.</p>
          </div>
          <select
            value={smtp.encryption}
            onChange={(e) => set("encryption", e.target.value as SmtpSettings["encryption"])}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="tls">STARTTLS</option>
            <option value="ssl">SSL/TLS</option>
            <option value="none">Không mã hóa</option>
          </select>
        </div>
      </div>
    </>
  );
}

function Field({ label, className, children }: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink-900">{label}</label>
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-xs text-ink-700">
      {children}
    </code>
  );
}
