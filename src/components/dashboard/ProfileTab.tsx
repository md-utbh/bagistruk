"use client";

import { useState, useEffect } from "react";
import {
  UserCircle,
  Moon,
  Sun,
  LogOut,
  Trash2,
  MessageCircle,
  Info,
  Loader2,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { useDashboard } from "@/app/dashboard/DashboardShell";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function ProfileTab() {
  const { userEmail } = useDashboard();
  const username = userEmail.split("@")[0];

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Reset data modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bagistruk-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("bagistruk-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleResetData = async () => {
    if (resetConfirmText !== "HAPUS") return;

    setIsResetting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all user data
      await supabase.from("debts").delete().eq("user_id", user.id);
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("contacts").delete().eq("user_id", user.id);

      showFeedback("Semua data berhasil dihapus.");
      setShowResetModal(false);
      setResetConfirmText("");

      // Refresh page to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showFeedback("Gagal menghapus data.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      setIsLoggingOut(false);
      showFeedback("Gagal logout.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile Card */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--accent)" }}
        >
          <UserCircle size={36} style={{ color: "var(--primary)" }} />
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            @{username}
          </h2>
        </div>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {userEmail}
        </p>
      </div>

      {/* Settings */}
      <section>
        <h3 className="text-xs font-semibold mb-2 px-1" style={{ color: "var(--text-muted)" }}>
          PENGATURAN
        </h3>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3.5 transition-all hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {theme === "light" ? (
                <Sun size={18} style={{ color: "var(--warning)" }} />
              ) : (
                <Moon size={18} style={{ color: "#6366f1" }} />
              )}
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Tema {theme === "light" ? "Terang" : "Gelap"}
              </span>
            </div>
            <div
              className="relative h-6 w-11 rounded-full transition-colors duration-300"
              style={{
                background: theme === "dark" ? "var(--primary)" : "var(--border)",
              }}
            >
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{
                  transform: theme === "dark" ? "translateX(20px)" : "translateX(2px)",
                }}
              />
            </div>
          </button>

          <div className="h-px" style={{ background: "var(--border-light)" }} />

          {/* Feedback */}
          <a
            href="mailto:feedback@bagistruk.app?subject=Feedback%20BagiStruk"
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-gray-50"
          >
            <MessageCircle size={18} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Kirim Feedback
            </span>
          </a>

          <div className="h-px" style={{ background: "var(--border-light)" }} />

          {/* App Info */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Info size={18} style={{ color: "var(--text-muted)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Versi Aplikasi
              </span>
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              v1.0.0-beta
            </span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="text-xs font-semibold mb-2 px-1" style={{ color: "var(--danger)" }}>
          ZONA BERBAHAYA
        </h3>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid #fecaca",
          }}
        >
          {/* Reset Data */}
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-red-50"
          >
            <Trash2 size={18} className="text-red-500" />
            <span className="text-sm font-medium text-red-600">
              Reset Semua Data
            </span>
          </button>

          <div className="h-px bg-red-100" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-red-50 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 size={18} className="animate-spin text-red-500" />
            ) : (
              <LogOut size={18} className="text-red-500" />
            )}
            <span className="text-sm font-medium text-red-600">
              {isLoggingOut ? "Logging out..." : "Keluar"}
            </span>
          </button>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
            style={{
              background: "var(--surface)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <h3 className="text-lg font-bold text-red-600 mb-2">
              ⚠️ Reset Semua Data?
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Semua transaksi, hutang, dan kontak akan dihapus secara permanen. Aksi ini tidak dapat dibatalkan.
            </p>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Ketik <span className="text-red-600 font-mono">HAPUS</span> untuk mengkonfirmasi:
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Ketik HAPUS di sini..."
              className="w-full p-2.5 text-sm rounded-xl outline-none mb-4 font-mono"
              style={{
                background: "var(--background)",
                border: "1px solid var(--danger)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText("");
                }}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                disabled={resetConfirmText !== "HAPUS" || isResetting}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "#dc2626" }}
              >
                {isResetting && <Loader2 size={14} className="animate-spin" />}
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-slide-up rounded-full bg-gray-800 px-5 py-2.5 text-sm text-white shadow-lg flex items-center gap-2 whitespace-nowrap">
          <CheckCircle2 size={16} className="text-green-400" />
          {toastMsg}
        </div>
      )}

      {/* TCC Logos Footer */}
      <div className="pt-8 pb-4 flex items-center justify-center gap-6 opacity-60 grayscale">
        <Image src="/images/logo2.png" alt="TCC Logo 1" width={40} height={40} className="h-10 w-auto object-contain" />
        <Image src="/images/logo3.png" alt="TCC Logo 2" width={40} height={40} className="h-10 w-auto object-contain" />
        <Image src="/images/logo4.png" alt="TCC Logo 3" width={40} height={40} className="h-10 w-auto object-contain" />
      </div>
    </div>
  );
}
