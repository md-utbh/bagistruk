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
  initManualEntry: () => void;
  addSplitItem: (item: Omit<SplitItem, "id" | "assignees">) => void;
  removeSplitItem: (id: string) => void;
  updateSplitItem: (id: string, updates: Partial<Omit<SplitItem, "id" | "assignees">>) => void;
  
  resetToLanding: () => void;
  resetToDashboard: () => void;
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

  initManualEntry: () => set(() => {
    const myId = `p-me`;
    const initialParticipants: Participant[] = [{ id: myId, name: "Saya (Kamu)" }];
    
    // Create an empty receipt data shell
    const emptyData: ReceiptData = {
      is_valid_receipt: true,
      error_reason: null,
      document_type: "expense_receipt",
      receipt_category: "Others",
      store_name: "Input Manual",
      date: new Date().toISOString().split("T")[0],
      items: [],
      financials: { discount: 0, tax: 0, service_fee: 0, grand_total: 0 },
    };

    return {
      receiptData: emptyData,
      splitMode: "split",
      participants: initialParticipants,
      splitItems: [],
      currentView: "split-bill",
      error: null,
    };
  }),

  addSplitItem: (item) => set((state) => {
    const newItem: SplitItem = {
      ...item,
      id: `item-manual-${Date.now()}`,
      assignees: [],
    };
    
    const newItems = [...state.splitItems, newItem];
    const newGrandTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    
    return {
      splitItems: newItems,
      receiptData: state.receiptData ? {
        ...state.receiptData,
        financials: { ...state.receiptData.financials, grand_total: newGrandTotal }
      } : null
    };
  }),

  removeSplitItem: (id) => set((state) => {
    const newItems = state.splitItems.filter((i) => i.id !== id);
    const newGrandTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    
    return {
      splitItems: newItems,
      receiptData: state.receiptData ? {
        ...state.receiptData,
        financials: { ...state.receiptData.financials, grand_total: newGrandTotal }
      } : null
    };
  }),

  updateSplitItem: (id, updates) => set((state) => {
    const newItems = state.splitItems.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        updated.subtotal = updated.quantity * updated.unit_price;
      }
      return updated;
    });
    
    const newGrandTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    
    return {
      splitItems: newItems,
      receiptData: state.receiptData ? {
        ...state.receiptData,
        financials: { ...state.receiptData.financials, grand_total: newGrandTotal }
      } : null
    };
  }),

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

  resetToDashboard: () =>
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
