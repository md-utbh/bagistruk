"use client";

import { useState } from "react";
import ExpensesTab from "./ExpensesTab";
import DebtsTab from "./DebtsTab";

export default function TransactionsTab() {
  const [subTab, setSubTab] = useState<"expenses" | "debts">("expenses");

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div 
        className="flex rounded-xl p-1"
        style={{ background: "var(--border-light)" }}
      >
        <button
          onClick={() => setSubTab("expenses")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            subTab === "expenses" ? "shadow-sm" : ""
          }`}
          style={{
            background: subTab === "expenses" ? "var(--surface)" : "transparent",
            color: subTab === "expenses" ? "var(--primary)" : "var(--text-muted)"
          }}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => setSubTab("debts")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            subTab === "debts" ? "shadow-sm" : ""
          }`}
          style={{
            background: subTab === "debts" ? "var(--surface)" : "transparent",
            color: subTab === "debts" ? "var(--primary)" : "var(--text-muted)"
          }}
        >
          Uang Nyangkut
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {subTab === "expenses" ? <ExpensesTab /> : <DebtsTab />}
      </div>
    </div>
  );
}
