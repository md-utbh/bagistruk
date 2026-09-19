"use client";

import { useState } from "react";
import { CheckCircle2, User, Loader2, HandCoins } from "lucide-react";
import { useDashboard } from "@/app/dashboard/DashboardShell";
import { markDebtAsPaid } from "@/app/actions/finance";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DebtsTab() {
  const { debts: initialDebts, totalUnpaidDebts } = useDashboard();
  const [debts, setDebts] = useState(initialDebts);
  const [loadingDebtId, setLoadingDebtId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMarkAsPaid = async (debtId: string) => {
    setLoadingDebtId(debtId);
    try {
      const res = await markDebtAsPaid(debtId);
      if (res.success) {
        setDebts((prev) => prev.filter((d) => d.id !== debtId));
        showFeedback("Hutang berhasil dilunasi! 🎉");
      } else {
        showFeedback(res.error || "Gagal menandai lunas.");
      }
    } catch {
      showFeedback("Terjadi kesalahan.");
    } finally {
      setLoadingDebtId(null);
    }
  };

  // Calculate current total from local state
  const currentTotal = debts.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: currentTotal > 0
            ? "linear-gradient(135deg, #f59e0b, #d97706)"
            : "linear-gradient(135deg, var(--success), #059669)",
          boxShadow: currentTotal > 0
            ? "0 10px 20px rgba(245, 158, 11, 0.2)"
            : "0 10px 20px rgba(16, 153, 129, 0.2)",
          color: "white",
        }}
      >
        <HandCoins size={22} className="mx-auto mb-2 opacity-80" />
        <p className="text-xs font-medium opacity-90 mb-1">
          {currentTotal > 0 ? "Total Uang Nyangkut" : "Semua Sudah Lunas!"}
        </p>
        <h2 className="text-2xl font-bold">{formatRupiah(currentTotal)}</h2>
        {currentTotal > 0 && (
          <p className="text-[10px] opacity-75 mt-1">{debts.length} tagihan belum dibayar</p>
        )}
      </div>

      {/* Debt List */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Daftar Hutang Teman
        </h2>

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
          <div
            className="rounded-xl border border-dashed p-8 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <HandCoins size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-400">
              Tidak ada utang teman yang nyangkut. Mantap! 🎉
            </p>
          </div>
        )}
      </section>

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
