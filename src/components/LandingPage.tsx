"use client";

import {
  ScanLine,
  Receipt,
  Zap,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LandingPage() {
  const { setBottomSheetOpen, isCompressing, initManualEntry } = useAppStore();

  const handleScanClick = () => {
    setBottomSheetOpen(true);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-12">
        {/* Logo & Brand */}
        <div className="mb-10 flex flex-col items-center animate-fade-in">
          <div
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
            style={{
              background: "var(--surface)",
              boxShadow: "0 8px 24px rgba(16, 153, 129, 0.25)",
            }}
          >
            <Image src="/images/logo1.png" alt="BagiStruk Logo" width={64} height={64} className="h-16 w-16 object-contain" />
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

        {/* PRIMARY CTA: Login Google */}
        <button
          onClick={handleGoogleLogin}
          className="group relative flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white transition-all duration-300 active:scale-[0.96]"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            boxShadow: "0 6px 20px rgba(16, 153, 129, 0.35)",
            minHeight: "56px",
          }}
          id="login-cta"
        >
          {/* Pulse ring animation */}
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity="0.9"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity="0.8"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" fillOpacity="0.85"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" fillOpacity="0.9"/>
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        {/* Subtitle info */}
        <p
          className="mt-3 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Login untuk menyimpan histori & lacak pengeluaranmu
        </p>

        {/* Divider */}
        <div className="mt-8 mb-4 flex w-full max-w-xs items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>atau</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* SECONDARY CTA: Scan Struk (tanpa login) */}
        <button
          onClick={handleScanClick}
          disabled={isCompressing}
          className="flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-sm)",
          }}
          id="scan-receipt-cta"
        >
          {isCompressing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <ScanLine size={18} strokeWidth={2} />
              <span>Scan Struk Tanpa Login</span>
            </>
          )}
        </button>

        {/* Manual Entry Button */}
        <button
          onClick={initManualEntry}
          disabled={isCompressing}
          className="mt-3 px-6 py-2 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ color: "var(--text-muted)" }}
        >
          Ketik Manual Saja
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

      {/* Footer & TCC Logos */}
      <footer
        className="px-6 py-10 flex flex-col items-center gap-6"
        style={{ background: "var(--surface)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Simple. Smart. Split. ✨
        </p>
        <div className="flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          <Image src="/images/logo2.png" alt="TCC Logo 1" width={40} height={40} className="h-10 w-auto object-contain" />
          <Image src="/images/logo3.png" alt="TCC Logo 2" width={40} height={40} className="h-10 w-auto object-contain" />
          <Image src="/images/logo4.png" alt="TCC Logo 3" width={40} height={40} className="h-10 w-auto object-contain" />
        </div>
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
