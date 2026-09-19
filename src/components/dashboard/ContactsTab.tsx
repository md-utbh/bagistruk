"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Phone, User, Loader2, CheckCircle2, Search } from "lucide-react";
import { useDashboard } from "@/app/dashboard/DashboardShell";
import { createClient } from "@/lib/supabase/client";

interface Contact {
  id: string;
  name: string;
  phone_number: string | null;
  created_at: string;
}

export default function ContactsTab() {
  const { userEmail } = useDashboard();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showFeedback = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setContacts(data);
      }
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  const handleAddContact = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name,
        phone_number: newPhone.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        showFeedback("Kontak dengan nama dan nomor ini sudah ada.");
      } else {
        showFeedback("Gagal menambahkan kontak.");
      }
      return;
    }

    if (data) {
      setContacts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewPhone("");
      setIsAdding(false);
      showFeedback("Kontak berhasil ditambahkan!");
    }
  }, [newName, newPhone]);

  const handleDeleteContact = useCallback(async (id: string) => {
    if (!confirm("Hapus kontak ini?")) return;
    setDeletingId(id);

    const supabase = createClient();
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      showFeedback("Kontak berhasil dihapus.");
    } else {
      showFeedback("Gagal menghapus kontak.");
    }
    setDeletingId(null);
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone_number && c.phone_number.includes(searchQuery))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Kontak Teman
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Daftar teman untuk split bill
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
          }}
        >
          <Plus size={14} />
          Tambah
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <Search size={16} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Cari kontak..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <div
          className="rounded-2xl p-4 animate-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--primary-light)",
            boxShadow: "0 2px 10px rgba(16, 153, 129, 0.1)",
          }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--primary)" }}>
            Kontak Baru
          </p>
          <input
            type="text"
            placeholder="Nama teman"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full mb-2.5 p-2.5 text-sm rounded-xl outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <input
            type="tel"
            placeholder="Nomor WhatsApp (opsional)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full mb-3 p-2.5 text-sm rounded-xl outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewName("");
                setNewPhone("");
              }}
              className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              onClick={handleAddContact}
              disabled={!newName.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              }}
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Contact List */}
      {filteredContacts.length > 0 ? (
        <div className="space-y-2">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-xl p-3 animate-fade-in"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: "var(--accent)", color: "var(--primary)" }}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {contact.name}
                  </p>
                  {contact.phone_number && (
                    <a
                      href={`https://wa.me/${contact.phone_number.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      <Phone size={10} />
                      {contact.phone_number}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                disabled={deletingId === contact.id}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {deletingId === contact.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <User size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="text-xs text-gray-400">
            {searchQuery ? "Tidak ada kontak yang cocok." : "Belum ada kontak. Tambahkan teman split bill-mu!"}
          </p>
        </div>
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
