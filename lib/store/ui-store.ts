// UI 临时状态 — 创建向导草稿等
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform, AdType, CampaignGoal, BidMode } from '../engine/types';

interface WizardDraft {
  step: number;
  platform: Platform;
  adType: AdType;
  goal: CampaignGoal;
  audienceId: string;
  bidMode: BidMode;
  bidPrice: number;
  dailyBudget: number;
  totalBudget: number;
  materialId: string;
  campaignName: string;
}

interface UIState {
  wizardDraft: WizardDraft | null;
  hasHydrated: boolean;
  setHydrated: () => void;
  saveWizardDraft: (draft: WizardDraft) => void;
  clearWizardDraft: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      wizardDraft: null,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),
      saveWizardDraft: (draft) => set({ wizardDraft: draft }),
      clearWizardDraft: () => set({ wizardDraft: null }),
    }),
    { name: 'ad-simulator-ui' }
  )
);
