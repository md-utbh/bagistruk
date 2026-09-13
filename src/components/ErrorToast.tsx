"use client";

import { AlertCircle, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function ErrorToast() {
  const { error, setError } = useAppStore();

  if (!error) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 animate-slide-down-reverse">
      <div
        className="flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 animate-scale-in"
        style={{
          background: "var(--surface)",
          border: "1px solid #fecaca",
          boxShadow: "0 8px 24px rgba(239, 68, 68, 0.15)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "#fef2f2" }}
        >
          <AlertCircle size={16} style={{ color: "var(--danger)" }} />
        </div>
        <p
          className="flex-1 text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {error}
        </p>
        <button
          onClick={() => setError(null)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors active:scale-95"
          style={{ background: "var(--border-light)" }}
          aria-label="Tutup pesan error"
        >
          <X size={14} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}
