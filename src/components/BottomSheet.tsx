"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { Camera, ImageIcon, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { compressImage } from "@/lib/image-compression";

interface BottomSheetProps {
  children?: ReactNode;
}

export default function BottomSheet({ children }: BottomSheetProps) {
  const {
    isBottomSheetOpen,
    setBottomSheetOpen,
    setCompressedImage,
    setIsCompressing,
    setError,
    setView,
  } = useAppStore();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setBottomSheetOpen(false);
  }, [setBottomSheetOpen]);

  const handleFileSelected = useCallback(
    async (file: File) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.");
        return;
      }

      // Validate file size (max 20MB raw input)
      if (file.size > 20 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 20MB.");
        return;
      }

      setBottomSheetOpen(false);
      setIsCompressing(true);
      setError(null);

      try {
        const compressed = await compressImage(file);
        setCompressedImage(compressed);
        setView("preview");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memproses gambar.";
        setError(message);
      } finally {
        setIsCompressing(false);
      }
    },
    [setBottomSheetOpen, setCompressedImage, setIsCompressing, setError, setView]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelected(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFileSelected]
  );

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleGalleryClick = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  if (!isBottomSheetOpen) return <>{children}</>;

  return (
    <>
      {children}

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: "var(--overlay)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Pilih sumber gambar"
      >
        <div
          className="mx-auto max-w-md rounded-t-3xl px-6 pt-4 pb-8"
          style={{
            background: "var(--surface)",
            boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Drag handle */}
          <div className="bottom-sheet-handle mb-6" />

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Pilih Sumber Gambar
            </h2>
            <button
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 active:scale-95"
              style={{ background: "var(--border-light)" }}
              aria-label="Tutup"
            >
              <X size={18} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            {/* Camera Option */}
            <button
              onClick={handleCameraClick}
              className="flex flex-1 flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "var(--accent)",
                border: "2px solid transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "transparent")
              }
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  boxShadow: "0 4px 12px rgba(16, 153, 129, 0.3)",
                }}
              >
                <Camera size={26} color="white" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ambil Foto
                </p>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Gunakan kamera
                </p>
              </div>
            </button>

            {/* Gallery Option */}
            <button
              onClick={handleGalleryClick}
              className="flex flex-1 flex-col items-center gap-3 rounded-2xl p-5 transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "var(--accent)",
                border: "2px solid transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "transparent")
              }
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                }}
              >
                <ImageIcon size={26} color="white" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pilih dari Galeri
                </p>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Pilih file gambar
                </p>
              </div>
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleInputChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleInputChange}
          />
        </div>
      </div>
    </>
  );
}
