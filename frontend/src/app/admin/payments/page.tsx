"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fadeUp, staggerContainer } from "@/lib/motion";
import api from "@/lib/api/client";
import {
  CreditCard,
  Wallet,
  Landmark,
  ChevronDown,
  CheckCircle2,
  Copy,
  Loader2,
  Save,
} from "lucide-react";

type GatewayId = "vnpay" | "momo" | "stripe";

type Gateway = {
  id: GatewayId;
  name: string;
  description: string;
  enabled: boolean;
  partner_code: string | null;
  access_key: string | null;
  secret_key_set: boolean;
  secret_key: string;
  webhook_url: string;
};

type PaymentsResponse = {
  payment_sandbox_mode: boolean;
  gateways: Omit<Gateway, "secret_key">[];
};

const GATEWAY_META: Record<GatewayId, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  vnpay: { icon: Landmark, color: "bg-blue-50 text-blue-600" },
  momo: { icon: Wallet, color: "bg-pink-50 text-pink-600" },
  stripe: { icon: CreditCard, color: "bg-indigo-50 text-indigo-600" },
};

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [expandedId, setExpandedId] = useState<GatewayId | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sandboxSaving, setSandboxSaving] = useState(false);
  const [savingId, setSavingId] = useState<GatewayId | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ success: boolean; data: PaymentsResponse }>("/admin/settings/payments");
      setIsSandbox(data.data.payment_sandbox_mode);
      setGateways(data.data.gateways.map((gateway) => ({ ...gateway, secret_key: "" })));
    } catch {
      toast.error("Không tải được cấu hình thanh toán");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateGateway = <K extends keyof Gateway>(id: GatewayId, key: K, value: Gateway[K]) => {
    setGateways((prev) => prev.map((gateway) => gateway.id === id ? { ...gateway, [key]: value } : gateway));
  };

  const saveGateway = async (gateway: Gateway, nextEnabled = gateway.enabled) => {
    setSavingId(gateway.id);
    try {
      const payload = {
        enabled: nextEnabled,
        partner_code: gateway.partner_code?.trim() || null,
        access_key: gateway.access_key?.trim() || null,
        ...(gateway.secret_key ? { secret_key: gateway.secret_key } : {}),
      };
      const { data } = await api.put<{ success: boolean; data: Omit<Gateway, "secret_key"> }>(
        `/admin/settings/payments/${gateway.id}`,
        payload,
      );
      setGateways((prev) => prev.map((item) => item.id === gateway.id
        ? { ...data.data, secret_key: "" }
        : item));
      toast.success("Đã lưu cấu hình cổng thanh toán");
    } catch {
      toast.error("Không thể lưu cổng thanh toán");
    } finally {
      setSavingId(null);
    }
  };

  const toggleGateway = async (gateway: Gateway, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveGateway(gateway, !gateway.enabled);
  };

  const toggleSandbox = async () => {
    const next = !isSandbox;
    setSandboxSaving(true);
    try {
      await api.put("/admin/settings/payments/environment", { payment_sandbox_mode: next });
      setIsSandbox(next);
      toast.success(next ? "Đã bật môi trường sandbox" : "Đã chuyển sang môi trường thật");
    } catch {
      toast.error("Không thể cập nhật môi trường thanh toán");
    } finally {
      setSandboxSaving(false);
    }
  };

  const copyWebhook = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép webhook URL");
    } catch {
      toast.error("Không thể sao chép URL");
    }
  };

  const activeGatewayCount = useMemo(
    () => gateways.filter((gateway) => gateway.enabled).length,
    [gateways],
  );

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Thanh toán</h1>
          <p className="mt-1 text-sm text-stone-500">
            {loading ? "Đang tải cấu hình…" : `${activeGatewayCount}/${gateways.length} cổng đang hoạt động`}
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2 shadow-soft">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink-900">Môi trường Sandbox</span>
            <span className="text-xs text-stone-500">Dùng để test giao dịch</span>
          </div>
          <button
            type="button"
            onClick={toggleSandbox}
            disabled={loading || sandboxSaving}
            className={`relative ml-2 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 ${
              isSandbox ? "bg-amber-500" : "bg-stone-200"
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              isSandbox ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : (
        <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-4">
          {gateways.map((gateway) => {
            const Icon = GATEWAY_META[gateway.id].icon;
            const isExpanded = expandedId === gateway.id;
            const isSaving = savingId === gateway.id;

            return (
              <motion.div
                key={gateway.id}
                variants={fadeUp}
                className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition-colors ${
                  isExpanded ? "border-amber-200 ring-1 ring-amber-500/10" : "border-stone-200 hover:border-amber-200"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center gap-4 px-5 py-4"
                  onClick={() => setExpandedId(isExpanded ? null : gateway.id)}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${GATEWAY_META[gateway.id].color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink-900">{gateway.name}</h2>
                      {gateway.enabled && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-stone-500">{gateway.description}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm font-medium text-stone-600">{gateway.enabled ? "Bật" : "Tắt"}</span>
                      <button
                        type="button"
                        onClick={(e) => void toggleGateway(gateway, e)}
                        disabled={isSaving}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
                          gateway.enabled ? "bg-emerald-500" : "bg-stone-200"
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          gateway.enabled ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <ChevronDown className={`h-5 w-5 text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 bg-stone-50/50"
                    >
                      <div className="space-y-5 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Partner Code / Merchant ID">
                            <input
                              value={gateway.partner_code ?? ""}
                              onChange={(e) => updateGateway(gateway.id, "partner_code", e.target.value)}
                              className="admin-input"
                            />
                          </Field>
                          <Field label="Access Key">
                            <input
                              value={gateway.access_key ?? ""}
                              onChange={(e) => updateGateway(gateway.id, "access_key", e.target.value)}
                              className="admin-input"
                            />
                          </Field>
                          <Field label="Secret Key / Hash Secret" className="md:col-span-2">
                            <input
                              type="password"
                              value={gateway.secret_key}
                              onChange={(e) => updateGateway(gateway.id, "secret_key", e.target.value)}
                              placeholder={gateway.secret_key_set ? "Đã lưu khóa bí mật, để trống nếu không đổi" : "Nhập khóa bí mật"}
                              className="admin-input"
                            />
                          </Field>
                          <Field label="Webhook URL" className="md:col-span-2">
                            <div className="flex overflow-hidden rounded-xl border border-stone-200 bg-surface-50">
                              <input
                                readOnly
                                value={gateway.webhook_url}
                                className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void copyWebhook(gateway.webhook_url)}
                                className="flex items-center gap-1 border-l border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 hover:bg-stone-50"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </button>
                            </div>
                          </Field>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-stone-200 pt-4">
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                          >
                            Đóng
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveGateway(gateway)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu cấu hình
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function Field({ label, className, children }: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-ink-900">{label}</label>
      {children}
    </div>
  );
}
