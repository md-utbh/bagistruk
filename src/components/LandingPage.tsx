"use client";

import {
  ScanLine,
  Receipt,
  Zap,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { setBottomSheetOpen, isCompressing, initManualEntry } = useAppStore();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

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

        {/* Manual Entry Button */}
        <button
          onClick={initManualEntry}
          disabled={isCompressing}
          className="mt-4 px-6 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
          style={{ color: "var(--primary)" }}
        >
          Ketik Manual Saja
        </button>

        {/* Quick Login CTA */}
        {isLoggedIn === false && (
          <div className="mt-8 flex flex-col items-center animate-fade-in">
            <p className="text-xs text-gray-500 mb-2">Sudah punya akun?</p>
            <button 
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 bg-white text-sm font-semibold transition-all active:scale-95 shadow-sm"
              style={{ color: "#333", border: "1px solid #e5e7eb" }}
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk ke Dashboard
            </button>
          </div>
        )}

        {isLoggedIn === true && (
          <div className="mt-8 flex flex-col items-center animate-fade-in">
            <button 
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 bg-white text-sm font-semibold transition-all active:scale-95 shadow-sm"
              style={{ color: "var(--primary-dark)", border: "1px solid var(--primary-light)" }}
              onClick={() => router.push('/dashboard')}
            >
              Lihat Dashboard Anda
            </button>
          </div>
        )}

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
