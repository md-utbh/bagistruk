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
