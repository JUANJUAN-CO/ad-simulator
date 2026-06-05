// ============================================================
// 游戏状态 Store — 职业成长、经验、资金、全局状态
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CareerStage, CareerStageConfig, GameSave, PlayerStats,
  MissionConfig, MissionCondition, CampaignConfig, CampaignMetrics,
  MaterialConfig, AudienceConfig, Platform, SimulationState,
} from '../engine/types';
import { MISSIONS } from '../data/missions';

// ---------- 职业阶段配置 ----------
export const CAREER_STAGES: CareerStageConfig[] = [
  {
    stage: 1,
    title: '投放助理',
    subtitle: '入门学徒 · 从零开始',
    expRequired: 2000,
    dailyBudgetCap: 500,
    availablePlatforms: ['douyin_feed', 'qianchuan', 'kuaishou_feed'],
    mentorId: 'laowang',
    unlockedSkills: ['创建计划', '基础定向', '看懂核心指标', '识别广告'],
    description: '你刚入行，作为投放助理，你的任务是学习基础概念并在小预算下积累第一次投放经验。',
  },
  {
    stage: 2,
    title: '独立优化师',
    subtitle: '独当一面 · 数据驱动',
    expRequired: 6000,
    dailyBudgetCap: 3000,
    availablePlatforms: ['douyin_feed', 'qianchuan', 'xiaohongshu_feed', 'kuaishou_feed', 'kuaishou_live', 'wechat_moments', 'wechat_oa'],
    mentorId: 'kejie',
    unlockedSkills: ['A/B 测试', 'OCPM 出价策略', '人群包组合', '素材优化'],
    description: '你已经能独立负责客户账户，开始接触多平台投放和系统的优化方法论。',
  },
  {
    stage: 3,
    title: '高级优化师',
    subtitle: '运筹帷幄 · 跨平台操盘',
    expRequired: 15000,
    dailyBudgetCap: 20000,
    availablePlatforms: ['douyin_feed', 'douyin_search', 'qianchuan', 'xiaohongshu_feed', 'xiaohongshu_search', 'kuaishou_feed', 'kuaishou_live', 'wechat_moments', 'wechat_oa', 'wechat_channels', 'baidu_search', 'baidu_feed', 'weibo_feed'],
    mentorId: 'chenzong',
    unlockedSkills: ['跨平台组合策略', 'DMP 人群包', '创意矩阵', '预算分配'],
    description: '你管理着大预算、多平台的投放体系，开始涉及策略层面的决策。',
  },
  {
    stage: 4,
    title: '投放总监',
    subtitle: '巅峰之上 · 无尽模式',
    expRequired: Infinity, // 无尽模式
    dailyBudgetCap: Infinity,
    availablePlatforms: ['douyin_feed', 'douyin_search', 'qianchuan', 'xiaohongshu_feed', 'xiaohongshu_search', 'xiaohongshu_live', 'kuaishou_feed', 'kuaishou_live', 'kuaishou_ecom', 'wechat_moments', 'wechat_oa', 'wechat_channels', 'baidu_search', 'baidu_feed', 'weibo_feed', 'bilibili_feed', 'zhihu_feed', 'tiktok_feed', 'tiktok_spark', 'facebook_ads', 'pinduoduo_ads', 'jd_ads'],
    mentorId: 'chenzong',
    unlockedSkills: ['团队管理', '客户汇报', '投放体系搭建', '危机处理'],
    description: '你已经成长为行业顶尖的投放专家。继续经营、冲击排行榜、解锁所有成就！',
  },
];

export function getCurrentStage(exp: number): CareerStageConfig {
  let current = CAREER_STAGES[0];
  for (const stage of CAREER_STAGES) {
    if (exp >= stage.expRequired && stage.stage < 4) continue;
    if (stage.stage === 4) return stage; // 总监
    if (exp < stage.expRequired) {
      current = stage;
      break;
    }
    current = stage;
  }
  return current;
}

// ---------- Store 类型 ----------
interface GameState {
  // 职业
  careerStage: CareerStage;
  exp: number;
  totalMoney: number;
  freeMoney: number;

  // 存档
  saves: GameSave[];
  activeSaveId: string | null;

  // 模拟
  isRunning: boolean;
  simSpeed: 0 | 1 | 5 | 20 | 50 | 100;
  currentTime: number;
  tickCount: number;
  simDays: number;

  // 任务
  completedMissions: string[];
  activeMissionIds: string[];

  // 统计
  stats: PlayerStats;

  // Actions
  newGame: (name: string) => void;
  loadGame: (saveId: string) => void;
  addExp: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  acceptMission: (missionId: string) => boolean;
  completeMission: (missionId: string, rewards: { exp: number; money: number }) => void;
  autoSave: () => void;
  setSimRunning: (running: boolean) => void;
  setSimSpeed: (speed: 0 | 1 | 5 | 20 | 50 | 100) => void;
  setState: (partial: Partial<GameState>) => void;
  advanceTime: (ticks: number) => void;
  activeRandomEvent: any | null;
  updateStats: (partial: Partial<PlayerStats>) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      careerStage: 1,
      exp: 0,
      totalMoney: 2000, // 初始资金
      freeMoney: 2000,
      saves: [],
      activeSaveId: null,
      isRunning: false,
      simSpeed: 0,
      // 从今天 0 点开始，这样 144 tick 后刚好是第二天 0 点
      currentTime: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
      tickCount: 0,
      simDays: 0,
      activeRandomEvent: null,
      completedMissions: [],
      activeMissionIds: [],
      stats: {
        totalSpend: 0,
        totalConversions: 0,
        totalImpressions: 0,
        bestROI: 0,
        bestCPA: 0,
        campaignsCreated: 0,
        missionsCompleted: 0,
        daysPlayed: 0,
        rank: 0,
      },

      newGame: (name) => {
        const save: GameSave = {
          id: Date.now().toString(36),
          name,
          careerStage: 1,
          exp: 0,
          totalMoney: 2000,
          freeMoney: 2000,
          completedMissions: [],
          activeMissions: [],
          campaigns: [],
          campaignSnapshots: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          simState: {
            isRunning: false,
            speed: 0,
            currentTime: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
            tickCount: 0,
            marketCondition: {
              competitionIntensity: 0.5,
              timeFactor: 0.5,
              dayOfWeek: new Date().getDay(),
              seasonFactor: 1.0,
              activeEvent: null,
            },
          },
          stats: {
            totalSpend: 0,
            totalConversions: 0,
            totalImpressions: 0,
            bestROI: 0,
            bestCPA: 0,
            campaignsCreated: 0,
            missionsCompleted: 0,
            daysPlayed: 0,
            rank: 0,
          },
        };

        set({
          activeSaveId: save.id,
          careerStage: 1,
          exp: 0,
          totalMoney: 2000,
          freeMoney: 2000,
          completedMissions: [],
          activeMissionIds: [],
          isRunning: false,
          simSpeed: 0,
          currentTime: save.simState.currentTime,
          tickCount: 0,
          simDays: 0,
          stats: save.stats,
          saves: [...get().saves, save],
        });
      },

      loadGame: (saveId) => {
        const save = get().saves.find(s => s.id === saveId);
        if (!save) return;
        set({
          activeSaveId: save.id,
          careerStage: save.careerStage || 1,
          exp: save.exp || 0,
          totalMoney: save.totalMoney ?? 2000,
          freeMoney: save.freeMoney ?? 2000,
          completedMissions: save.completedMissions || [],
          activeMissionIds: save.activeMissions || [],
          currentTime: save.simState?.currentTime || new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          tickCount: save.simState?.tickCount || 0,
          simDays: Math.floor((save.simState?.tickCount || 0) / 144),
          isRunning: false, // 加载时默认暂停
          simSpeed: 0,
          stats: save.stats || {
            totalSpend: 0, totalConversions: 0, totalImpressions: 0,
            bestROI: 0, bestCPA: 0, campaignsCreated: 0,
            missionsCompleted: 0, daysPlayed: 0, rank: 0,
          },
        });
      },

      addExp: (amount) => {
        const { exp } = get();
        const newExp = exp + amount;
        const newStage = getCurrentStage(newExp).stage as CareerStage;
        set({ exp: newExp, careerStage: newStage });
      },

      addMoney: (amount) => set(s => ({
        totalMoney: s.totalMoney + amount,
        freeMoney: s.freeMoney + amount,
      })),

      spendMoney: (amount) => {
        const { freeMoney } = get();
        if (freeMoney < amount) return false;
        set(s => ({ freeMoney: s.freeMoney - amount }));
        return true;
      },

      acceptMission: (missionId) => {
        const mission = MISSIONS.find(m => m.id === missionId);
        if (!mission) return false;
        if (mission.unlockAfter?.length) {
          const completed = get().completedMissions;
          if (!mission.unlockAfter.every(preReq => completed.includes(preReq))) {
            return false; // 前置未完成
          }
        }
        const already = get().activeMissionIds.includes(missionId);
        if (!already) {
          set(s => ({ activeMissionIds: [...s.activeMissionIds, missionId] }));
        }
        return true;
      },

      completeMission: (missionId, rewards) => {
        set(s => ({
          completedMissions: [...s.completedMissions, missionId],
          activeMissionIds: s.activeMissionIds.filter(id => id !== missionId),
          exp: s.exp + rewards.exp,
          freeMoney: s.freeMoney + rewards.money,
          totalMoney: s.totalMoney + rewards.money,
          stats: {
            ...s.stats,
            missionsCompleted: s.stats.missionsCompleted + 1,
          },
        }));
        const newStage = getCurrentStage(get().exp).stage as CareerStage;
        set({ careerStage: newStage });
      },

      setSimRunning: (running) => set({ isRunning: running, simSpeed: running ? 1 : 0 }),
      setSimSpeed: (speed) => set({ simSpeed: speed, isRunning: speed > 0 }),
      setState: (partial) => set(partial),

      advanceTime: (ticks) => set(s => {
        const newTickCount = s.tickCount + ticks;
        const simDays = Math.floor(newTickCount / 144);
        return {
          tickCount: newTickCount,
          simDays,
          currentTime: s.currentTime + ticks * 10 * 60 * 1000,
        };
      }),

      updateStats: (partial) => set(s => ({
        stats: { ...s.stats, ...partial },
      })),

      autoSave: () => {
        const state = get();
        const save = state.saves.find(s => s.id === state.activeSaveId);
        if (!save) return;
        set({
          saves: state.saves.map(s => s.id === state.activeSaveId ? {
            ...s,
            careerStage: state.careerStage,
            exp: state.exp,
            totalMoney: state.totalMoney,
            freeMoney: state.freeMoney,
            completedMissions: state.completedMissions,
            activeMissions: state.activeMissionIds,
            stats: state.stats,
            updatedAt: Date.now(),
            simState: {
              ...s.simState,
              currentTime: state.currentTime,
              tickCount: state.tickCount,
              isRunning: state.isRunning,
              speed: state.simSpeed,
            },
          } : s),
        });
      },
    }),
    {
      name: 'ad-simulator-game',
    }
  )
);
