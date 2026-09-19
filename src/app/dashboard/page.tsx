import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./DashboardShell";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  // Fetch Transaksi (Bulan ini)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .order("date", { ascending: false });

  // Fetch Piutang (Debts) yang statusnya 'pending'
  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Calculate Metrics
  const totalExpense = transactions
    ?.filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  const totalUnpaidDebts = debts
    ?.reduce((sum, debt) => sum + Number(debt.amount), 0) || 0;

  return (
    <DashboardShell
      userEmail={user.email || "user"}
      initialData={{
        transactions: transactions || [],
        debts: debts || [],
        totalExpense,
        totalUnpaidDebts,
      }}
    >
      <DashboardTabs />
    </DashboardShell>
  );
}
