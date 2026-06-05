// ============================================================
// 计划状态 Store — 广告计划 CRUD、运行状态
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CampaignConfig, CampaignMetrics, CampaignSnapshot,
  Platform, CampaignGoal, BidMode, IndustryType,
} from '../engine/types';

interface CampaignState {
  campaigns: CampaignConfig[];
  metrics: Record<string, CampaignMetrics>; // campaignId -> metrics
  snapshots: Record<string, CampaignSnapshot[]>; // campaignId -> snapshots
  dailySnapshots: Record<string, Record<number, DailySnapshot>>; // campaignId -> { simDay: snapshot }

  // Actions
  createCampaign: (campaign: Omit<CampaignConfig, 'id' | 'status' | 'createdAt' | 'startedAt' | 'endedAt' | 'pauseReason'>) => CampaignConfig;
  updateCampaign: (id: string, partial: Partial<CampaignConfig>) => void;
  deleteCampaign: (id: string) => void;
  startCampaign: (id: string) => void;
  pauseCampaign: (id: string) => void;
  endCampaign: (id: string) => void;
  addBudget: (id: string, amount: number) => boolean;
  updateMetrics: (id: string, metrics: CampaignMetrics) => void;
  addSnapshot: (campaignId: string, snapshot: CampaignSnapshot) => void;
  snapshotDailyMetrics: (campaignId: string, simDay: number) => void;
  getDailySnapshot: (campaignId: string, simDay: number) => DailySnapshot | undefined;
  getYesterdaySnapshot: (campaignId: string, currentSimDay: number) => DailySnapshot | undefined;
  getActiveCampaigns: () => CampaignConfig[];
  getCampaign: (id: string) => CampaignConfig | undefined;
  getMetrics: (id: string) => CampaignMetrics | undefined;
}

export interface DailySnapshot {
  simDay: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  conversionValue: number;
}

function generateId(): string {
  return `camp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMetrics(): CampaignMetrics {
  return {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    dailySpend: 0,
    lastActiveDay: -1,
    ctr: 0,
    cvr: 0,
    cpa: 0,
    roi: 0,
    ecpm: 0,
    conversionValue: 0,
    learningStage: 'cold_start',
    materialFreshness: 1,
    effectiveCtr: 0,
    effectiveCvr: 0,
  };
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      metrics: {},
      snapshots: {},
      dailySnapshots: {},

      createCampaign: (input) => {
        const campaign: CampaignConfig = {
          ...input,
          id: generateId(),
          status: 'draft',
          createdAt: Date.now(),
          startedAt: null,
          endedAt: null,
        };
        set(s => ({
          campaigns: [...s.campaigns, campaign],
          metrics: { ...s.metrics, [campaign.id]: emptyMetrics() },
          snapshots: { ...s.snapshots, [campaign.id]: [] },
        }));
        return campaign;
      },

      updateCampaign: (id, partial) => set(s => ({
        campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...partial } : c),
      })),

      deleteCampaign: (id) => set(s => {
        const { [id]: _, ...restMetrics } = s.metrics;
        const { [id]: __, ...restSnapshots } = s.snapshots;
        return {
          campaigns: s.campaigns.filter(c => c.id !== id),
          metrics: restMetrics,
          snapshots: restSnapshots,
        };
      }),

      startCampaign: (id) => set(s => ({
        campaigns: s.campaigns.map(c =>
          c.id === id ? { ...c, status: 'active' as const, startedAt: Date.now() } : c
        ),
      })),

      pauseCampaign: (id) => set(s => ({
        campaigns: s.campaigns.map(c =>
          c.id === id ? { ...c, status: 'paused' as const } : c
        ),
      })),

      endCampaign: (id) => set(s => ({
        campaigns: s.campaigns.map(c =>
          c.id === id ? { ...c, status: 'ended' as const, endedAt: Date.now(), pauseReason: 'total_budget' as const } : c
        ),
      })),

      addBudget: (id, amount) => {
        set(s => {
          const campaign = s.campaigns.find(c => c.id === id);
          if (!campaign) return s;
          return {
            ...s,
            campaigns: s.campaigns.map(c =>
              c.id === id ? { ...c, totalBudget: c.totalBudget + amount } : c
            ),
          };
        });
        return true;
      },

      updateMetrics: (id, metrics) => set(s => ({
        metrics: { ...s.metrics, [id]: metrics },
      })),

      addSnapshot: (campaignId, snapshot) => set(s => ({
        snapshots: {
          ...s.snapshots,
          [campaignId]: [...(s.snapshots[campaignId] || []), snapshot],
        },
      })),

      snapshotDailyMetrics: (campaignId, simDay) => {
        const metrics = get().metrics[campaignId];
        if (!metrics) return;
        set(s => ({
          dailySnapshots: {
            ...s.dailySnapshots,
            [campaignId]: {
              ...(s.dailySnapshots[campaignId] || {}),
              [simDay]: {
                simDay,
                impressions: metrics.impressions,
                clicks: metrics.clicks,
                conversions: metrics.conversions,
                spend: metrics.spend,
                conversionValue: metrics.conversionValue,
              },
            },
          },
        }));
      },

      getDailySnapshot: (campaignId, simDay) => {
        return get().dailySnapshots[campaignId]?.[simDay];
      },

      getYesterdaySnapshot: (campaignId, currentSimDay) => {
        return get().dailySnapshots[campaignId]?.[currentSimDay - 1];
      },

      getActiveCampaigns: () => get().campaigns.filter(c => c.status === 'active'),

      getCampaign: (id) => get().campaigns.find(c => c.id === id),

      getMetrics: (id) => get().metrics[id],
    }),
    {
      name: 'ad-simulator-campaigns',
    }
  )
);
