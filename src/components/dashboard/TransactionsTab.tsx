"use client";

import { useState } from "react";
import ExpensesTab from "./ExpensesTab";
import DebtsTab from "./DebtsTab";

export default function TransactionsTab() {
  const [subTab, setSubTab] = useState<"expenses" | "debts">("expenses");

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setSubTab("expenses")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            subTab === "expenses"
              ? "bg-white text-[var(--primary)] shadow-sm dark:bg-[var(--surface)]"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => setSubTab("debts")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
            subTab === "debts"
              ? "bg-white text-[var(--primary)] shadow-sm dark:bg-[var(--surface)]"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
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
