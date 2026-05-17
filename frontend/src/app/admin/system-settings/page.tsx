"use client";

import { motion } from "framer-motion";
import { MonitorCog, PanelLeft, Palette, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  type AdminDensity,
  type AdminWorkspaceTone,
  useAdminPreferencesStore,
} from "@/stores/adminPreferencesStore";

const TONES: { value: AdminWorkspaceTone; label: string; description: string; swatch: string }[] = [
  { value: "stone", label: "Stone", description: "Trung tính, tập trung dữ liệu.", swatch: "bg-stone-100" },
  { value: "paper", label: "Paper", description: "Sáng hơn, thoáng hơn.", swatch: "bg-white" },
  { value: "sand", label: "Sand", description: "Ấm nhẹ, dịu mắt khi làm lâu.", swatch: "bg-amber-50" },
];

const DENSITIES: { value: AdminDensity; label: string; description: string }[] = [
  { value: "comfortable", label: "Thoải mái", description: "Khoảng thở rộng, dễ rà soát." },
  { value: "compact", label: "Gọn", description: "Nhiều dữ liệu hơn trên một màn hình." },
];

export default function SystemSettingsPage() {
  const {
    workspaceTone,
    density,
    sidebarExpanded,
    reducedMotion,
    setWorkspaceTone,
    setDensity,
    setSidebarExpanded,
    setReducedMotion,
  } = useAdminPreferencesStore();

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="page-title">Tùy chỉnh giao diện</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">
          Chỉ điều chỉnh cách khu admin hiện ra với bạn. Không đụng vào luật đặt vé, email hay thanh toán.
        </p>
      </motion.div>

      <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-5">
        <PreferenceCard
          icon={Palette}
          title="Sắc độ không gian làm việc"
          description="Đổi nền của khu quản trị theo cảm giác bạn muốn khi ngồi làm."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {TONES.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setWorkspaceTone(tone.value)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  workspaceTone === tone.value
                    ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-500/10"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <span className={`mb-3 block h-8 rounded-xl border border-stone-200 ${tone.swatch}`} />
                <span className="block text-sm font-semibold text-ink-900">{tone.label}</span>
                <span className="mt-1 block text-xs text-stone-500">{tone.description}</span>
              </button>
            ))}
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={MonitorCog}
          title="Mật độ hiển thị"
          description="Chọn nhịp bố cục phù hợp với kiểu làm việc của bạn."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {DENSITIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setDensity(item.value)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  density === item.value
                    ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-500/10"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <span className="block text-sm font-semibold text-ink-900">{item.label}</span>
                <span className="mt-1 block text-xs text-stone-500">{item.description}</span>
              </button>
            ))}
          </div>
        </PreferenceCard>

        <PreferenceCard
          icon={PanelLeft}
          title="Thanh điều hướng"
          description="Giữ thanh bên mở sẵn nếu bạn thường xuyên nhảy giữa nhiều mục."
        >
          <ToggleRow
            title="Mở thanh bên mặc định"
            description="Áp dụng cho lần vào admin tiếp theo."
            checked={sidebarExpanded}
            onChange={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </PreferenceCard>

        <PreferenceCard
          icon={Sparkles}
          title="Chuyển động"
          description="Giảm hiệu ứng nếu bạn thích giao diện tĩnh hơn."
        >
          <ToggleRow
            title="Giảm chuyển động"
            description="Rút ngắn animation và transition trong khu admin."
            checked={reducedMotion}
            onChange={() => setReducedMotion(!reducedMotion)}
          />
        </PreferenceCard>
      </motion.div>
    </div>
  );
}

function PreferenceCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
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

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink-900">{title}</p>
        <p className="text-xs text-stone-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-amber-500" : "bg-stone-200"
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}
