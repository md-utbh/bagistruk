"use client";

import { useState, useCallback, useRef } from "react";
import {
  Home,
  Wallet,
  Users,
  HandCoins,
  UserCircle,
  ScanLine,
  Camera,
  ImageIcon,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { compressImage } from "@/lib/image-compression";
import PreviewScreen from "@/components/PreviewScreen";
import ResultScreen from "@/components/ResultScreen";
import SplitBillScreen from "@/components/SplitBillScreen";
import BottomSheet from "@/components/BottomSheet";
import LoadingOverlay from "@/components/LoadingOverlay";
import Image from "next/image";
import ErrorToast from "@/components/ErrorToast";

export type DashboardTab = "home" | "transactions" | "contacts" | "profile";

interface DashboardShellProps {
  /** The user's email for greeting */
  userEmail: string;
  /** Content for each tab — passed from server component */
  children: React.ReactNode;
  /** Initial data passed from server component */
  initialData: {
    transactions: any[];
    debts: any[];
    totalExpense: number;
    totalUnpaidDebts: number;
  };
}

const TAB_CONFIG: { id: DashboardTab | "scan"; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "transactions", label: "Transaksi", icon: Wallet },
  { id: "scan", label: "Scan", icon: ScanLine },
  { id: "contacts", label: "Kontak", icon: Users },
  { id: "profile", label: "Profil", icon: UserCircle },
];

export default function DashboardShell({
  userEmail,
  children,
  initialData,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const { currentView, isCompressing, isBottomSheetOpen, setBottomSheetOpen } = useAppStore();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showScanMenu, setShowScanMenu] = useState(false);

  const {
    setCompressedImage,
    setIsCompressing,
    setError,
    setView,
    initManualEntry,
  } = useAppStore();

  const handleFileSelected = useCallback(
    async (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 20MB.");
        return;
      }

      setShowScanMenu(false);
      setIsCompressing(true);
      setError(null);

      try {
        const compressed = await compressImage(file);
        setCompressedImage(compressed);
        setView("preview");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memproses gambar.";
        setError(message);
      } finally {
        setIsCompressing(false);
      }
    },
    [setCompressedImage, setIsCompressing, setError, setView]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
      e.target.value = "";
    },
    [handleFileSelected]
  );

  // If in scan flow (preview/result/split-bill), show those views instead
  const isInScanFlow = currentView !== "landing";

  // Extract username from email
  const username = userEmail.split("@")[0];

  return (
    <div className="relative flex min-h-dvh flex-col" style={{ background: "var(--background)" }}>
      {isInScanFlow ? (
        // ── Scan Flow Views ──
        <div className="mx-auto w-full max-w-md flex-1">
          <BottomSheet>
            {currentView === "preview" && <PreviewScreen />}
            {currentView === "result" && <ResultScreen />}
            {currentView === "split-bill" && <SplitBillScreen />}
          </BottomSheet>
          {isCompressing && <LoadingOverlay />}
          <ErrorToast />
        </div>
      ) : (
        // ── Dashboard Tab Views ──
        <>
          {/* Header */}
          <header
            className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <div className="mx-auto flex w-full max-w-md items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/images/logo1.png" alt="Logo" width={32} height={32} className="h-8 w-auto object-contain drop-shadow-sm" />
                <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  BagiStruk
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                  Halo,
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                  @{username}
                </p>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 px-4 py-6 pb-28">
            <div className="mx-auto max-w-md">
              {/* Pass activeTab and data to children via context provider or render props */}
              <DashboardContext.Provider
                value={{
                  activeTab,
                  ...initialData,
                  userEmail,
                }}
              >
                {children}
              </DashboardContext.Provider>
            </div>
          </main>

          {/* Scan Menu Popup (rendered conditionally above navbar) */}
          {showScanMenu && (
            <div className="fixed bottom-[76px] left-1/2 z-50 -translate-x-1/2">
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowScanMenu(false)}
              />
              {/* Menu */}
              <div
                className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-col gap-2 rounded-2xl p-3 animate-scale-in"
                style={{
                  background: "var(--surface)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  border: "1px solid var(--border-light)",
                  minWidth: "180px",
                }}
              >
                <button
                  onClick={() => {
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Camera size={18} style={{ color: "var(--primary)" }} />
                  Ambil Foto
                </button>
                <button
                  onClick={() => {
                    galleryInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
                  style={{ color: "var(--text-primary)" }}
                >
                  <ImageIcon size={18} style={{ color: "var(--secondary)" }} />
                  Pilih dari Galeri
                </button>
                <div className="h-px my-1" style={{ background: "var(--border-light)" }} />
                <button
                  onClick={() => {
                    setShowScanMenu(false);
                    initManualEntry();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="text-base">✍️</span>
                  Input Manual
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleInputChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleInputChange}
          />

          {/* Bottom Navigation Bar */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-40"
            style={{
              background: "var(--glass-nav)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid var(--border-light)",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
              {TAB_CONFIG.map((tab) => {
                if (tab.id === "scan") {
                  return (
                    <div key="scan" className="relative -top-5 flex flex-col items-center">
                      <button
                        onClick={() => setShowScanMenu(!showScanMenu)}
                        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 active:scale-90"
                        style={{
                          background: "linear-gradient(135deg, #109981, #059669)",
                          boxShadow: "0 6px 20px rgba(16, 153, 129, 0.45)",
                        }}
                        aria-label="Scan Struk"
                      >
                        <ScanLine size={24} strokeWidth={2.2} />
                      </button>
                    </div>
                  );
                }

                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as DashboardTab);
                      setShowScanMenu(false);
                    }}
                    className="flex flex-1 flex-col items-center gap-0.5 py-1 transition-all duration-200"
                    style={{
                      color: isActive ? "var(--primary)" : "var(--text-muted)",
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.3 : 1.8}
                      className="transition-all duration-200"
                      style={{
                        transform: isActive ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                    <span
                      className="text-[10px] font-medium transition-all duration-200"
                      style={{
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {tab.label}
                    </span>
                    {/* Active indicator dot */}
                    {isActive && (
                      <div
                        className="mt-0.5 h-1 w-1 rounded-full animate-scale-in"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {isCompressing && <LoadingOverlay />}
          <ErrorToast />
        </>
      )}
    </div>
  );
}

// ── Dashboard Context ──────────────────────────────────────────
import { createContext, useContext } from "react";

export interface DashboardContextType {
  activeTab: DashboardTab;
  transactions: any[];
  debts: any[];
  totalExpense: number;
  totalUnpaidDebts: number;
  userEmail: string;
}

export const DashboardContext = createContext<DashboardContextType>({
  activeTab: "home",
  transactions: [],
  debts: [],
  totalExpense: 0,
  totalUnpaidDebts: 0,
  userEmail: "",
});

export function useDashboard() {
  return useContext(DashboardContext);
}
