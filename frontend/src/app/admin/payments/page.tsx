"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CreditCard, Wallet, Landmark, ChevronDown, CheckCircle2, Copy, Save } from "lucide-react";

type Gateway = {
  id: string;
  name: string;
  icon: any;
  description: string;
  enabled: boolean;
  color: string;
};

const INITIAL_GATEWAYS: Gateway[] = [
  {
    id: "vnpay",
    name: "VNPay",
    icon: Landmark,
    description: "Thanh toán qua mã QR, thẻ ATM và tài khoản ngân hàng nội địa.",
    enabled: true,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    icon: Wallet,
    description: "Cổng thanh toán điện tử ví MoMo phổ biến nhất tại Việt Nam.",
    enabled: true,
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    description: "Thanh toán quốc tế bằng thẻ Visa, Mastercard, AMEX.",
    enabled: false,
    color: "bg-indigo-50 text-indigo-600",
  },
];

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>(INITIAL_GATEWAYS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);

  const toggleGateway = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Thanh toán</h1>
          <p className="mt-1 text-sm text-stone-500">
            Quản lý các cổng thanh toán và cấu hình API giao dịch.
          </p>
        </div>

        {/* Global Sandbox Toggle */}
        <div className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink-900">Môi trường Sandbox</span>
            <span className="text-xs text-stone-500">Dùng để test giao dịch</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSandbox(!isSandbox)}
            className={`relative ml-2 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              isSandbox ? "bg-amber-500" : "bg-stone-200"
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isSandbox ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </motion.div>

      {/* Gateway List */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {gateways.map((gateway) => {
          const Icon = gateway.icon;
          const isExpanded = expandedId === gateway.id;

          return (
            <motion.div
              key={gateway.id}
              variants={fadeUp}
              className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition-colors ${
                isExpanded ? "border-amber-200 ring-1 ring-amber-500/10" : "border-stone-200 hover:border-amber-200"
              }`}
            >
              {/* Card Header (Clickable) */}
              <div
                className="flex cursor-pointer items-center px-6 py-5"
                onClick={() => setExpandedId(isExpanded ? null : gateway.id)}
              >
                <div className={`mr-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${gateway.color}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-ink-900">{gateway.name}</h2>
                    {gateway.enabled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{gateway.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-medium text-stone-600">{gateway.enabled ? "Bật" : "Tắt"}</span>
                    <button
                      type="button"
                      onClick={(e) => toggleGateway(gateway.id, e)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        gateway.enabled ? "bg-emerald-500" : "bg-stone-200"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        gateway.enabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-ink-900">
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>

              {/* Card Expanded Settings */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-stone-100 bg-stone-50/50"
                  >
                    <div className="p-6">
                      <div className="mb-6 grid gap-6 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-ink-900">Partner Code / Merchant ID</label>
                          <input
                            type="text"
                            defaultValue="MOMO_123456789"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-ink-900">Access Key</label>
                          <input
                            type="password"
                            defaultValue="•••••••••••••••••••••••••"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-sm font-semibold text-ink-900">Secret Key / Hash Secret</label>
                          <input
                            type="password"
                            defaultValue="••••••••••••••••••••••••••••••••"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-sm font-semibold text-ink-900">Webhook URL (Read-only)</label>
                          <div className="flex w-full overflow-hidden rounded-xl border border-stone-200 bg-surface-50">
                            <input
                              type="text"
                              readOnly
                              value={`https://api.ticketrush.vn/webhooks/${gateway.id}`}
                              className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-500 outline-none"
                            />
                            <button className="flex items-center gap-1 border-l border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 hover:bg-stone-50">
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-stone-200 pt-5">
                        <button
                          className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                          onClick={() => setExpandedId(null)}
                        >
                          Hủy
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                          <Save className="h-4 w-4" />
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
    </div>
  );
}
