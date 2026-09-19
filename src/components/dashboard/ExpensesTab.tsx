"use client";

import { useDashboard } from "@/app/dashboard/DashboardShell";
import { Wallet, TrendingDown } from "lucide-react";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Category color mapping */
const CATEGORY_COLORS: Record<string, string> = {
  "F&B": "#f97316",
  Groceries: "#22c55e",
  Transport: "#3b82f6",
  Entertainment: "#a855f7",
  Others: "#64748b",
};

export default function ExpensesTab() {
  const { transactions, totalExpense } = useDashboard();

  // Group transactions by category
  const categoryBreakdown = transactions.reduce(
    (acc: Record<string, number>, tx) => {
      const cat = tx.category || "Others";
      acc[cat] = (acc[cat] || 0) + Number(tx.amount);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Total Expense Header */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
          boxShadow: "0 10px 20px rgba(16, 153, 129, 0.2)",
          color: "white",
        }}
      >
        <TrendingDown size={22} className="mx-auto mb-2 opacity-80" />
        <p className="text-xs font-medium opacity-90 mb-1">Total Pengeluaran Bulan Ini</p>
        <h2 className="text-2xl font-bold">{formatRupiah(totalExpense)}</h2>
      </div>

      {/* Category Breakdown */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Pengeluaran per Kategori
        </h2>

        {sortedCategories.length > 0 ? (
          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => {
              const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
              const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;

              return (
                <div
                  key={category}
                  className="rounded-xl p-3"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {category}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatRupiah(amount)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ background: "var(--border-light)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed p-6 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <Wallet size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-400">
              Belum ada data pengeluaran bulan ini.
            </p>
          </div>
        )}
      </section>

      {/* Transaction List for this month */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Detail Transaksi ({transactions.length})
        </h2>

        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Others,
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {tx.json_data?.store_name || "Toko"}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {tx.date}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatRupiah(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed p-6 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs text-gray-400">Belum ada transaksi bulan ini.</p>
          </div>
        )}
      </section>
    </div>
  );
}
