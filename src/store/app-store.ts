import { create } from "zustand";
import type { CompressedImage } from "@/lib/image-compression";
import type { ReceiptData, Participant, SplitItem } from "@/lib/types";

/** Application view states */
export type AppView = "landing" | "preview" | "result" | "split-bill";

interface AppState {
  /** Current active view */
  currentView: AppView;
  /** Compressed image ready for processing */
  compressedImage: CompressedImage | null;
  /** Whether image compression is in progress */
  isCompressing: boolean;
  /** Whether AI processing is in progress */
  isProcessing: boolean;
  /** Error message to display */
  error: string | null;
  /** Whether the bottom sheet (image source picker) is visible */
  isBottomSheetOpen: boolean;
  
  /** Parsed receipt data from Gemini AI */
  receiptData: ReceiptData | null;
  
  // --- Split Bill States ---
  splitMode: "split" | "personal" | null;
  participants: Participant[];
  splitItems: SplitItem[];

  // Actions
  setView: (view: AppView) => void;
  setCompressedImage: (image: CompressedImage | null) => void;
  setIsCompressing: (loading: boolean) => void;
  setIsProcessing: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBottomSheetOpen: (open: boolean) => void;
  
  setReceiptData: (data: ReceiptData | null) => void;
  
  // --- Split Bill Actions ---
  initSplitBill: (data: ReceiptData) => void;
  initPersonalRecord: (data: ReceiptData) => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  toggleItemAssignee: (itemId: string, participantId: string) => void;
  toggleAllAssignees: (itemId: string, selectAll: boolean) => void;
  
  resetToLanding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "landing",
  compressedImage: null,
  isCompressing: false,
  isProcessing: false,
  error: null,
  isBottomSheetOpen: false,
  
  receiptData: null,
  
  splitMode: null,
  participants: [],
  splitItems: [],

  setView: (view) => set({ currentView: view }),
  setCompressedImage: (image) => set({ compressedImage: image }),
  setIsCompressing: (loading) => set({ isCompressing: loading }),
  setIsProcessing: (loading) => set({ isProcessing: loading }),
  setError: (error) => set({ error }),
  setBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),
  
  setReceiptData: (data) => set({ receiptData: data }),
  
  initSplitBill: (data) => set((state) => {
    const myId = `p-me`;
    const initialParticipants: Participant[] = [{ id: myId, name: "Saya (Kamu)" }];
    
    const initialSplitItems: SplitItem[] = data.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
      assignees: [], // Initially empty
    }));

    return {
      splitMode: "split",
      participants: initialParticipants,
      splitItems: initialSplitItems,
      currentView: "split-bill",
    };
  }),

  initPersonalRecord: (data) => set((state) => {
    const myId = `p-me`;
    const initialParticipants: Participant[] = [{ id: myId, name: "Saya (Kamu)" }];
    
    const initialSplitItems: SplitItem[] = data.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
      assignees: [myId], // Auto assign to "Saya (Kamu)"
    }));

    return {
      splitMode: "personal",
      participants: initialParticipants,
      splitItems: initialSplitItems,
      currentView: "split-bill",
    };
  }),

  addParticipant: (name) => set((state) => ({
    participants: [...state.participants, { id: `p-${Date.now()}`, name }],
  })),

  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter((p) => p.id !== id),
    splitItems: state.splitItems.map((item) => ({
      ...item,
      assignees: item.assignees.filter((aId) => aId !== id),
    })),
  })),

  toggleItemAssignee: (itemId, participantId) => set((state) => ({
    splitItems: state.splitItems.map((item) => {
      if (item.id !== itemId) return item;
      
      const isAssigned = item.assignees.includes(participantId);
      return {
        ...item,
        assignees: isAssigned 
          ? item.assignees.filter((id) => id !== participantId)
          : [...item.assignees, participantId],
      };
    }),
  })),
  
  toggleAllAssignees: (itemId, selectAll) => set((state) => ({
    splitItems: state.splitItems.map((item) => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        assignees: selectAll ? state.participants.map((p) => p.id) : [],
      };
    })
  })),

  resetToLanding: () =>
    set({
      currentView: "landing",
      compressedImage: null,
      isCompressing: false,
      isProcessing: false,
      error: null,
      isBottomSheetOpen: false,
      receiptData: null,
      splitMode: null,
      participants: [],
      splitItems: [],
    }),
}));
