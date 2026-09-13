import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  Camera, 
  Wallet, 
  Users, 
  LogOut, 
  CheckCircle2, 
  Receipt as ReceiptIcon 
} from "lucide-react";
import DashboardClient from "./DashboardClient";

/** Formats a number as Indonesian Rupiah */
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  // 1. Fetch Transaksi (Bulan ini)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .order("date", { ascending: false });

  // 2. Fetch Piutang (Debts) yang statusnya 'pending'
  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Calculate Metrics
  const totalExpense = transactions
    ?.filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  const totalUnpaidDebts = debts
    ?.reduce((sum, debt) => sum + Number(debt.amount), 0) || 0;

  return (
    <div 
      className="flex min-h-dvh flex-col pb-24" 
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-4"
        style={{
          background: "rgba(248, 250, 249, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Ringkasan Keuangan Anda
          </p>
        </div>
        <form action={async () => {
          "use server";
          const sup = await createClient();
          await sup.auth.signOut();
          redirect("/");
        }}>
          <button 
            type="submit"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <LogOut size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md space-y-8">
          
          {/* Metrik Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                boxShadow: "0 10px 20px rgba(16, 153, 129, 0.2)",
                color: "white"
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
              <Users size={20} className="mb-2" style={{ color: "var(--warning)" }} />
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

          <DashboardClient 
            initialDebts={debts || []} 
            transactions={transactions || []} 
          />

        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-6 py-3.5 shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #109981, #059669)",
            color: "white",
            boxShadow: "0 10px 25px rgba(16, 153, 129, 0.4)",
          }}
        >
          <Camera size={22} />
          <span className="font-semibold text-sm">Scan Struk</span>
        </Link>
      </div>

    </div>
  );
}
