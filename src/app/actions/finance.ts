"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReceiptData, SplitResult } from "@/lib/types";

export async function saveTransactionData(
  receiptData: ReceiptData,
  splitMode: "split" | "personal",
  splitResults: SplitResult[]
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Harap login terlebih dahulu." };
    }

    // ── Server-side Validation ──────────────────────────────────────
    if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
      // Allow save even with 0 items if splitResults have items assigned
      // But reject if truly empty
      if (splitResults.length === 0 || splitResults.every((r) => r.items.length === 0)) {
        return { success: false, error: "Data transaksi kosong. Tambahkan minimal satu item." };
      }
    }

    if (receiptData.financials.grand_total <= 0) {
      return { success: false, error: "Total transaksi harus lebih dari Rp 0." };
    }

    if (!receiptData.store_name || receiptData.store_name.trim() === "") {
      return { success: false, error: "Nama toko tidak boleh kosong." };
    }
    // ────────────────────────────────────────────────────────────────

    // 1. Dapatkan tagihan milik pengguna yang login ("Saya (Kamu)" dgn id p-me)
    const myResult = splitResults.find((res) => res.participantId === "p-me");
    const myExpense = myResult ? myResult.total : 0;

    // 2. Simpan Transaksi Utama
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "expense",
        amount: myExpense,
        category: receiptData.receipt_category,
        date: receiptData.date,
        json_data: receiptData,
      })
      .select("id")
      .single();

    if (txError) {
      console.error("Gagal menyimpan transaksi:", txError);
      return { success: false, error: "Gagal menyimpan data transaksi." };
    }

    // 3. Simpan Hutang (Debts) jika Mode Patungan
    if (splitMode === "split" && splitResults.length > 0) {
      // Filter out 'Saya (Kamu)' (the user who paid)
      const debtors = splitResults.filter(
        (res) => res.participantId !== "p-me" && res.total > 0
      );

      if (debtors.length > 0) {
        const debtsToInsert = debtors.map((debtor) => ({
          user_id: user.id,
          debtor_name: debtor.name,
          amount: debtor.total,
          status: "pending",
          transaction_id: transaction.id,
        }));

        const { error: debtsError } = await supabase
          .from("debts")
          .insert(debtsToInsert);

        if (debtsError) {
          console.error("Gagal menyimpan data hutang:", debtsError);
          return { success: false, error: "Transaksi tersimpan, namun gagal mencatat hutang." };
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Kesalahan server:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

export async function markDebtAsPaid(debtId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("debts")
      .update({ status: "paid" })
      .eq("id", debtId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Gagal update hutang:", error);
      return { success: false, error: "Gagal menandai lunas." };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Kesalahan server:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete related debts first
    await supabase
      .from("debts")
      .delete()
      .eq("transaction_id", transactionId)
      .eq("user_id", user.id);

    // Delete the transaction
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Gagal menghapus transaksi:", error);
      return { success: false, error: "Gagal menghapus transaksi." };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Kesalahan server:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

