"use client";

import {
  ScanLine,
  Receipt,
  Zap,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function LandingPage() {
  const { setBottomSheetOpen, isCompressing } = useAppStore();

  const handleScanClick = () => {
    setBottomSheetOpen(true);
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-12">
        {/* Logo & Brand */}
        <div className="mb-10 flex flex-col items-center animate-fade-in">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              boxShadow: "0 8px 24px rgba(16, 153, 129, 0.35)",
            }}
          >
            <Receipt size={38} color="white" strokeWidth={1.8} />
          </div>
          <h1
            className="mb-2 text-center text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            BagiStruk
          </h1>
          <p
            className="text-center text-base font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Smart Receipt Splitter &<br />
            Personal Finance Tracker
          </p>
        </div>

        {/* Tagline */}
        <p
          className="mb-10 max-w-xs text-center text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Scan struk belanja, bagi tagihan dengan mudah, dan lacak pengeluaranmu secara otomatis.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleScanClick}
          disabled={isCompressing}
          className="group relative flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white transition-all duration-300 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            boxShadow: "0 6px 20px rgba(16, 153, 129, 0.35)",
            minHeight: "56px",
          }}
          id="scan-receipt-cta"
        >
          {/* Pulse ring animation */}
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />

          {isCompressing ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <ScanLine size={22} strokeWidth={2.2} />
              <span>Scan Struk</span>
            </>
          )}
        </button>

        {/* Scroll indicator */}
        <div
          className="mt-12 flex flex-col items-center gap-1 animate-float"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-xs">Fitur Utama</span>
          <ChevronDown size={16} />
        </div>
      </main>

      {/* Features Section */}
      <section
        className="px-6 pb-12 pt-8"
        style={{ background: "var(--surface)" }}
      >
        <div className="mx-auto max-w-md">
          <h2
            className="mb-6 text-center text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Kenapa BagiStruk?
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <FeatureCard
              icon={<ScanLine size={22} color="white" />}
              gradient="linear-gradient(135deg, var(--primary), var(--primary-light))"
              title="AI Scan Struk"
              description="AI membaca struk belanja secara otomatis. Tidak perlu input manual."
            />
            <FeatureCard
              icon={<Zap size={22} color="white" />}
              gradient="linear-gradient(135deg, var(--secondary), #10b981)"
              title="Split Bill Instan"
              description="Bagi tagihan secara rata, persentase, atau custom ke teman-teman."
            />
            <FeatureCard
              icon={<Shield size={22} color="white" />}
              gradient="linear-gradient(135deg, #6366f1, #818cf8)"
              title="Privasi Terjaga"
              description="Gambar tidak pernah disimpan. Hanya data teks yang diproses."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-6 text-center"
        style={{ background: "var(--surface)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Simple. Smart. Split. ✨
        </p>
      </footer>
    </div>
  );
}

/* ===== Feature Card Sub-Component ===== */
interface FeatureCardProps {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, gradient, title, description }: FeatureCardProps) {
  return (
    <div
      className="flex items-start gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{
        background: "var(--background)",
        border: "1px solid var(--border-light)",
      }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: gradient,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
