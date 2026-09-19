"use client";

import { useState } from "react";
import { Wallet, Receipt as ReceiptIcon, Loader2, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/app/dashboard/DashboardShell";
import { deleteTransaction } from "@/app/actions/finance";
import DigitalReceipt from "@/components/DigitalReceipt";
import type { ReceiptData } from "@/lib/types";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomeTab() {
  const { transactions, totalExpense, totalUnpaidDebts } = useDashboard();
  const [localTx, setLocalTx] = useState(transactions);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async (txId: string) => {
    if (!confirm("Hapus transaksi ini? Data hutang terkait juga akan dihapus.")) return;
    setDeletingId(txId);
    try {
      const res = await deleteTransaction(txId);
      if (res.success) {
        setLocalTx((prev) => prev.filter((t) => t.id !== txId));
        showFeedback("Transaksi berhasil dihapus.");
      } else {
        showFeedback(res.error || "Gagal menghapus.");
      }
    } catch {
      showFeedback("Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyToWA = (tx: any) => {
    const data = tx.json_data as ReceiptData | null;
    if (!data) return;

    let text = `*Tagihan ${data.store_name}*\n`;
    text += `Tanggal: ${data.date}\n\n`;
    data.items.forEach((item) => {
      text += `• ${item.name} (${item.quantity}x) — ${formatRupiah(item.subtotal)}\n`;
    });
    text += `\n*Grand Total:* ${formatRupiah(data.financials.grand_total)}\n`;
    text += `\n_Dibuat dengan BagiStruk_ 🧾✨`;

    navigator.clipboard?.writeText(text).then(() => {
      showFeedback("Teks disalin ke clipboard!");
    }).catch(() => {
      showFeedback("Gagal menyalin teks.");
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrik Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            boxShadow: "0 10px 20px rgba(16, 153, 129, 0.2)",
            color: "white",
          }}
        >
          <Wallet size={20} className="mb-2 opacity-80" />
          <p className="text-[11px] font-medium opacity-90 mb-1">Pengeluaran Pribadi</p>
          <h2 className="text-lg font-bold">{formatRupiah(totalExpense)}</h2>
          <p className="text-[10px] opacity-75 mt-1">Bulan Ini</p>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Wallet size={20} className="mb-2" style={{ color: "var(--warning)" }} />
          <p className="text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Uang Nyangkut
          </p>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {formatRupiah(totalUnpaidDebts)}
          </h2>
          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
            Belum Dibayar
          </p>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Riwayat Transaksi
          </h2>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent)", color: "var(--primary)" }}
          >
            {localTx.length} transaksi
          </span>
        </div>

        {localTx.length > 0 ? (
          <div className="space-y-3">
            {localTx.map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl overflow-hidden animate-fade-in"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Main row - clickable to view receipt */}
                <button
                  onClick={() => setSelectedReceipt(tx.json_data)}
                  className="w-full flex items-center justify-between p-3 text-left transition-all hover:bg-gray-50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "var(--accent)", color: "var(--primary)" }}
                    >
                      <ReceiptIcon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {tx.json_data?.store_name || "Toko"}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {tx.date} • {tx.category}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {formatRupiah(tx.amount)}
                  </p>
                </button>

                {/* Action buttons row */}
                <div
                  className="flex items-center border-t px-3 py-1.5 gap-1"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <button
                    onClick={() => handleCopyToWA(tx)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all hover:bg-gray-100 active:scale-95"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Copy size={12} />
                    Salin WA
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50 ml-auto"
                    style={{ color: "var(--danger)" }}
                  >
                    {deletingId === tx.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-gray-400">Belum ada riwayat transaksi. Scan struk pertamamu! 📷</p>
          </div>
        )}
      </section>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <DigitalReceipt
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-slide-up rounded-full bg-gray-800 px-5 py-2.5 text-sm text-white shadow-lg flex items-center gap-2 whitespace-nowrap">
          <CheckCircle2 size={16} className="text-green-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
