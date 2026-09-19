"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Users,
  CheckCircle2,
  Copy,
  Save,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { calculateSplit } from "@/lib/split-math";
import { saveTransactionData } from "@/app/actions/finance";

/** Formats a number as Indonesian Rupiah */
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SplitBillScreen() {
  const {
    receiptData,
    splitMode,
    participants,
    splitItems,
    addParticipant,
    removeParticipant,
    toggleItemAssignee,
    toggleAllAssignees,
    setView,
    addSplitItem,
    removeSplitItem,
  } = useAppStore();

  const [newParticipantName, setNewParticipantName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Teks disalin ke clipboard!");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // States for new item form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");

  const handleBack = useCallback(() => {
    setView("result");
  }, [setView]);

  const handleAddParticipant = useCallback(() => {
    const trimmed = newParticipantName.trim();
    if (trimmed) {
      addParticipant(trimmed);
      setNewParticipantName("");
    }
  }, [newParticipantName, addParticipant]);

  const splitResults = useMemo(() => {
    if (!receiptData) return [];
    return calculateSplit(splitItems, receiptData.financials, participants);
  }, [receiptData, splitItems, participants]);

  const showFeedback = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleCopyToWhatsApp = useCallback(() => {
    if (!receiptData || splitResults.length === 0) return;

    // Client-side validation
    if (splitItems.length === 0 || receiptData.financials.grand_total <= 0) {
      showFeedback("Tidak ada item untuk disalin. Tambahkan minimal satu item.", "error");
      return;
    }
    
    let text = `*Tagihan ${receiptData.store_name}*\n`;
    text += `Tanggal: ${receiptData.date}\n\n`;
    
    if (splitMode === "split") {
      text += `Rincian per orang:\n`;
      splitResults.forEach((result) => {
        text += `• *${result.name}*: ${formatRupiah(result.total)}\n`;
      });
    } else {
      text += `Total Pengeluaran: *${formatRupiah(splitResults[0].total)}*\n`;
    }
    
    text += `\n*Grand Total:* ${formatRupiah(receiptData.financials.grand_total)}\n`;
    text += `\n_Dibuat dengan BagiStruk_ 🧾✨`;

    const copyFallback = (textToCopy: string) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // Move element out of screen visually
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    const copyPromise = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text)
      : copyFallback(text);

    copyPromise
      .then(() => {
        showFeedback("Teks disalin ke clipboard!");
      })
      .catch((err) => {
        console.error("Gagal menyalin teks:", err);
        showFeedback("Gagal menyalin teks. Browser Anda mungkin tidak mendukung fitur ini.", "error");
      });
  }, [receiptData, splitResults, splitMode, splitItems, showFeedback]);

  const handleSave = useCallback(async () => {
    if (!receiptData || !splitMode || isSaved) return;

    // Client-side validation
    if (splitItems.length === 0) {
      showFeedback("Data kosong. Tambahkan minimal satu item sebelum menyimpan.", "error");
      return;
    }

    if (receiptData.financials.grand_total <= 0) {
      showFeedback("Total transaksi harus lebih dari Rp 0.", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await saveTransactionData(receiptData, splitMode, splitResults);
      if (result.success) {
        setIsSaved(true);
        showFeedback("✅ Data berhasil disimpan!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showFeedback(result.error || "Gagal menyimpan data.", "error");
      }
    } catch (error) {
      console.error(error);
      showFeedback("Terjadi kesalahan koneksi.", "error");
    } finally {
      setIsSaving(false);
    }
  }, [receiptData, splitMode, splitResults, splitItems, isSaved, showFeedback]);

  if (!receiptData) return null;

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
            Split Bill
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Bagi tagihan ke teman-teman
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        <div className="mx-auto max-w-md space-y-6">
          
          {/* Bagian 1 & 2 hanya untuk Mode Split */}
          {splitMode === "split" && (
            <>
              {/* Bagian 1: Partisipan */}
              <section>
            <div className="mb-3 flex items-center gap-2">
              <Users size={16} style={{ color: "var(--primary)" }} />
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Siapa Saja yang Ikut?
              </h2>
            </div>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                placeholder="Masukkan nama..."
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--primary-light)",
                } as any}
              />
              <button
                onClick={handleAddParticipant}
                disabled={!newParticipantName.trim()}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-xl text-white transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                }}
              >
                <Plus size={20} />
              </button>
            </div>

            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span>{p.name}</span>
                    {p.id !== "p-me" && (
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {participants.length === 0 && (
              <p className="text-xs text-center p-3 rounded-xl border border-dashed" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                Belum ada teman yang ditambahkan.
              </p>
            )}
          </section>

          {/* Bagian 2: Rincian Item & Penugasan */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Bagikan Item
              </h2>
            </div>
            
            <div className="space-y-4">
              {splitItems.map((item) => {
                const allSelected = participants.length > 0 && item.assignees.length === participants.length;
                
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 transition-all"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-light)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {/* Item Info */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {item.quantity}x @ {formatRupiah(item.unit_price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
                          {formatRupiah(item.subtotal)}
                        </p>
                        <button onClick={() => removeSplitItem(item.id)} className="text-red-400 hover:text-red-500 p-0.5 transition-colors" title="Hapus item">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Scrollable Assignees */}
                    {participants.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                        {/* Select All Chip */}
                        <button
                          onClick={() => toggleAllAssignees(item.id, !allSelected)}
                          className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                            allSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-transparent border-gray-200 text-gray-500"
                          }`}
                        >
                          {allSelected && <Check size={12} strokeWidth={3} />}
                          Semua
                        </button>

                        <div className="w-px h-5 bg-gray-200 shrink-0 mx-1" />

                        {/* Participant Chips */}
                        {participants.map((p) => {
                          const isActive = item.assignees.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => toggleItemAssignee(item.id, p.id)}
                              className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                                isActive
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-transparent border-gray-200 text-gray-500"
                              }`}
                            >
                              {isActive && <Check size={12} strokeWidth={3} />}
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Item Form */}
              {isAddingItem ? (
                <div className="rounded-2xl p-4 animate-fade-in" style={{ background: "var(--surface)", border: "1px solid var(--primary-light)", boxShadow: "0 2px 10px rgba(16, 153, 129, 0.1)" }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "var(--primary)" }}>Item Baru</p>
                  <input
                    type="text"
                    placeholder="Nama makanan/minuman"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full mb-3 p-2.5 text-sm rounded-xl outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 ml-1">Kuantitas</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                        className="w-full p-2.5 text-sm rounded-xl outline-none mt-1"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-[10px] text-gray-500 ml-1">Harga Satuan</label>
                      <input
                        type="number"
                        placeholder="Rp 0"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="w-full p-2.5 text-sm rounded-xl outline-none mt-1"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setIsAddingItem(false)}
                      className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        const name = newItemName.trim();
                        const price = parseInt(newItemPrice) || 0;
                        if (!name) return;
                        
                        addSplitItem({
                          name: name,
                          category: "Others",
                          quantity: newItemQty,
                          unit_price: price,
                          subtotal: newItemQty * price,
                        });
                        
                        setIsAddingItem(false);
                        setNewItemName("");
                        setNewItemPrice("");
                        setNewItemQty(1);
                      }}
                      disabled={!newItemName.trim() || !newItemPrice}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="w-full py-3.5 rounded-2xl border border-dashed text-sm font-medium flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "rgba(0,0,0,0.01)" }}
                >
                  <Plus size={16} />
                  Tambah Item Baru
                </button>
              )}
            </div>
          </section>
          </>
          )}

          {/* Bagian 3: Hasil Pembagian */}
          {participants.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ringkasan Tagihan
                  </h2>
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                  {formatRupiah(receiptData.financials.grand_total)}
                </span>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                  background: "var(--surface)",
                }}
              >
                {splitResults.length > 0 ? (
                  splitResults.map((result, idx) => (
                    <div
                      key={result.participantId}
                      className="flex items-center justify-between p-4"
                      style={{
                        borderBottom: idx < splitResults.length - 1 ? "1px solid var(--border-light)" : "none",
                      }}
                    >
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{result.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {result.items.length} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[15px]" style={{ color: "var(--primary-dark)" }}>
                          {formatRupiah(result.total)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Silakan bagikan item terlebih dahulu.
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleCopyToWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
                  }}
                >
                  <Copy size={18} />
                  Salin ke WhatsApp
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-all active:scale-[0.98] disabled:opacity-70"
                  style={{
                    background: isSaved ? "var(--success)" : "var(--surface)",
                    border: isSaved ? "1px solid var(--success)" : "1px solid var(--primary)",
                    color: isSaved ? "white" : "var(--primary-dark)",
                  }}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <Check size={18} /> : <Save size={18} />}
                  {isSaving ? "Menyimpan..." : isSaved ? "Tersimpan ✓" : "Simpan ke Database"}
                </button>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-slide-up rounded-full px-5 py-2.5 text-sm text-white shadow-lg flex items-center gap-2 whitespace-nowrap"
          style={{ background: toastType === "error" ? "#dc2626" : "#1f2937" }}
        >
          <CheckCircle2 size={16} className={toastType === "error" ? "text-red-200" : "text-green-400"} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
