"use client";

import { useState } from "react";
import { Receipt as ReceiptIcon, CheckCircle2, User, Loader2 } from "lucide-react";
import { markDebtAsPaid } from "@/app/actions/finance";
import DigitalReceipt from "@/components/DigitalReceipt";
import type { ReceiptData } from "@/lib/types";

/** Formats a number as Indonesian Rupiah */
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardClient({ 
  initialDebts, 
  transactions 
}: { 
  initialDebts: any[];
  transactions: any[];
}) {
  const [debts, setDebts] = useState(initialDebts);
  const [loadingDebtId, setLoadingDebtId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  const handleMarkAsPaid = async (debtId: string) => {
    setLoadingDebtId(debtId);
    try {
      const res = await markDebtAsPaid(debtId);
      if (res.success) {
        // Remove from local state to reflect UI instantly
        setDebts((prev) => prev.filter(d => d.id !== debtId));
      } else {
        alert(res.error || "Gagal menandai lunas.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoadingDebtId(null);
    }
  };

  return (
    <>
      {/* Daftar Piutang */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Daftar Piutang
          </h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
            {debts.length} tagihan
          </span>
        </div>

        {debts.length > 0 ? (
          <div className="space-y-3">
            {debts.map((debt) => (
              <div 
                key={debt.id}
                className="flex items-center justify-between rounded-xl p-3 animate-fade-in"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {debt.debtor_name}
                    </p>
                    <p className="font-bold text-sm" style={{ color: "var(--warning)" }}>
                      {formatRupiah(debt.amount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkAsPaid(debt.id)}
                  disabled={loadingDebtId === debt.id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: "var(--success)" }}
                >
                  {loadingDebtId === debt.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Lunas
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-gray-400">Tidak ada utang teman yang nyangkut. Mantap! 🎉</p>
          </div>
        )}
      </section>

      {/* Riwayat Transaksi */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Riwayat Transaksi
          </h2>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedReceipt(tx.json_data)}
                className="w-full flex items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-gray-50 active:scale-[0.98]"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                }}
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
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {formatRupiah(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Lihat Struk</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-gray-400">Belum ada riwayat transaksi.</p>
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
    </>
  );
}
