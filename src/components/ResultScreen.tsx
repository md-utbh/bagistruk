"use client";

import { useCallback } from "react";
import {
  ArrowLeft,
  Store,
  Calendar,
  Tag,
  Receipt,
  ShoppingCart,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

/** Formats a number as Indonesian Rupiah */
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ResultScreen() {
  const { receiptData, resetToLanding } = useAppStore();

  const handleBack = useCallback(() => {
    resetToLanding();
  }, [resetToLanding]);

  if (!receiptData) return null;

  const { store_name, date, receipt_category, items, financials, document_type } =
    receiptData;

  const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(248, 250, 249, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 active:scale-95"
          style={{ background: "var(--accent)" }}
          aria-label="Kembali"
        >
          <ArrowLeft size={20} style={{ color: "var(--primary)" }} />
        </button>
        <div className="flex-1">
          <h1
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Hasil Analisis
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Data berhasil diekstrak oleh AI
          </p>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "var(--accent)" }}
        >
          <CheckCircle2 size={18} style={{ color: "var(--primary)" }} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5">
        <div className="mx-auto max-w-md space-y-4">
          {/* Store Info Card */}
          <div
            className="rounded-2xl p-4 animate-scale-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Store name & icon */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  boxShadow: "0 4px 12px rgba(16, 153, 129, 0.25)",
                }}
              >
                <Store size={22} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg font-bold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {store_name || "Toko Tidak Diketahui"}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {document_type === "expense_receipt"
                    ? "Struk Pembelian"
                    : "Bukti Transfer"}
                </p>
              </div>
            </div>

            {/* Meta info row */}
            <div className="flex gap-2">
              <MetaBadge
                icon={<Calendar size={12} />}
                label={formatDate(date)}
              />
              <MetaBadge
                icon={<Tag size={12} />}
                label={receipt_category}
              />
            </div>
          </div>

          {/* Ringkasan Transaksi */}
          <div
            className="rounded-2xl p-4 animate-fade-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={14} style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Ringkasan Transaksi
              </span>
            </div>

            <div className="space-y-2">
              <SummaryRow label="Total Belanja" value={formatRupiah(itemsSubtotal)} />
              {financials.discount > 0 && (
                <SummaryRow
                  label="Diskon"
                  value={`-${formatRupiah(financials.discount)}`}
                  variant="discount"
                />
              )}
              {financials.tax > 0 && (
                <SummaryRow label="Pajak" value={formatRupiah(financials.tax)} />
              )}
              {financials.service_fee > 0 && (
                <SummaryRow
                  label="Biaya Layanan"
                  value={formatRupiah(financials.service_fee)}
                />
              )}
              <div
                className="mt-2 border-t pt-2"
                style={{ borderColor: "var(--border-light)" }}
              >
                <SummaryRow
                  label="Grand Total"
                  value={formatRupiah(financials.grand_total)}
                  variant="total"
                />
              </div>
            </div>
          </div>

          {/* Rincian Item */}
          <div
            className="rounded-2xl p-4 animate-fade-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
              animationDelay: "0.1s",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={14} style={{ color: "var(--primary)" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rincian Item
                </span>
              </div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent)",
                  color: "var(--primary)",
                }}
              >
                {items.length} item
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "var(--background)" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: "var(--accent)",
                      color: "var(--primary)",
                    }}
                  >
                    {item.quantity}×
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {item.category && (
                        <span>{item.category} · </span>
                      )}
                      {formatRupiah(item.unit_price)} / pcs
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold shrink-0"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div
        className="sticky bottom-0 px-4 pb-6 pt-4"
        style={{
          background:
            "linear-gradient(to top, var(--background) 80%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={handleBack}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
            aria-label="Scan struk baru"
          >
            <RotateCcw size={20} style={{ color: "var(--text-secondary)" }} />
          </button>

          <div className="flex flex-1 gap-2">
            <button
              className="flex flex-1 flex-col items-center justify-center rounded-2xl p-2 font-semibold text-white transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                boxShadow: "0 6px 20px rgba(16, 153, 129, 0.35)",
              }}
              onClick={() => {
                const { initSplitBill } = useAppStore.getState();
                initSplitBill(receiptData);
              }}
            >
              <span className="text-sm">Mode Patungan</span>
              <span className="text-[10px] font-normal opacity-80">(Split Bill)</span>
            </button>

            <button
              className="flex flex-1 flex-col items-center justify-center rounded-2xl p-2 font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--primary)",
                color: "var(--primary-dark)",
              }}
              onClick={() => {
                const { initPersonalRecord } = useAppStore.getState();
                initPersonalRecord(receiptData);
              }}
            >
              <span className="text-sm">Catat Pribadi</span>
              <span className="text-[10px] font-normal opacity-80">(Tanpa Split)</span>
            </button>
          </div>
        </div>

        {/* Google Login Placeholder Card */}
        <div className="mx-auto max-w-md mt-4">
          <div 
            className="rounded-2xl p-4 text-center"
            style={{
              background: "var(--accent)",
              border: "1px dashed var(--primary)",
            }}
          >
            <p className="text-xs font-medium mb-3" style={{ color: "var(--text-primary)" }}>
              Ingin menyimpan catatan ini dan melacak utang teman?
            </p>
            <button 
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 bg-white text-sm font-semibold transition-all active:scale-95 shadow-sm"
              style={{ color: "#333", border: "1px solid #ddd" }}
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
            >
              {/* Google G logo simplified */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login dengan Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Sub Components ===== */

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
      style={{ background: "var(--background)" }}
    >
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  variant?: "default" | "discount" | "total";
}

function SummaryRow({ label, value, variant = "default" }: SummaryRowProps) {
  const valueColor =
    variant === "discount"
      ? "var(--danger)"
      : variant === "total"
        ? "var(--primary)"
        : "var(--text-primary)";

  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${variant === "total" ? "font-semibold" : ""}`}
        style={{
          color:
            variant === "total" ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        {label}
      </span>
      <span
        className={`text-sm ${variant === "total" ? "font-bold" : "font-medium"}`}
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

/** Formats YYYY-MM-DD to a readable Indonesian date */
function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return `${day} ${months[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}
