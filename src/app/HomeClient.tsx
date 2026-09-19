"use client";

import { useAppStore } from "@/store/app-store";
import LandingPage from "@/components/LandingPage";
import PreviewScreen from "@/components/PreviewScreen";
import ResultScreen from "@/components/ResultScreen";
import SplitBillScreen from "@/components/SplitBillScreen";
import BottomSheet from "@/components/BottomSheet";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorToast from "@/components/ErrorToast";

/**
 * Client-side shell for the landing/guest flow.
 * Handles scan, preview, result, and split-bill views for non-logged-in users.
 */
export default function HomeClient() {
  const { currentView, isCompressing } = useAppStore();

  return (
    <div className="mx-auto w-full max-w-md">
      <BottomSheet>
        {currentView === "landing" && <LandingPage />}
        {currentView === "preview" && <PreviewScreen />}
        {currentView === "result" && <ResultScreen />}
        {currentView === "split-bill" && <SplitBillScreen />}
      </BottomSheet>

      {isCompressing && <LoadingOverlay />}
      <ErrorToast />
    </div>
  );
}
