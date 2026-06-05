// ============================================================
// 成就系统 Store
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'skill' | 'challenge' | 'secret';
  condition: (stats: AchievementStats) => boolean;
  reward?: string;  // 称号奖励
}

export interface AchievementStats {
  totalSpend: number;
  totalConversions: number;
  totalImpressions: number;
  bestROI: number;
  bestCPA: number;
  campaignsCreated: number;
  missionsCompleted: number;
  daysPlayed: number;
  platformCount: number;
  careerStage: number;
  maxActivePlans: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ═══ 里程碑 ═══
  { id:'ach_01', name:'初出茅庐', description:'创建第一条推广计划', icon:'🌱', category:'milestone',
    condition: s => s.campaignsCreated >= 1, reward: '新手投手' },
  { id:'ach_02', name:'广告学徒', description:'创建 10 条计划', icon:'📋', category:'milestone',
    condition: s => s.campaignsCreated >= 10 },
  { id:'ach_03', name:'投放达人', description:'创建 50 条计划', icon:'🎯', category:'milestone',
    condition: s => s.campaignsCreated >= 50 },
  { id:'ach_04', name:'操盘大师', description:'创建 100 条计划', icon:'🏭', category:'milestone',
    condition: s => s.campaignsCreated >= 100, reward: '操盘大师' },

  { id:'ach_05', name:'初见成效', description:'累计获取 10 个转化', icon:'✨', category:'milestone',
    condition: s => s.totalConversions >= 10 },
  { id:'ach_06', name:'转化机器', description:'累计获取 100 个转化', icon:'⚡', category:'milestone',
    condition: s => s.totalConversions >= 100 },
  { id:'ach_07', name:'万人迷', description:'累计获取 1000 个转化', icon:'🔥', category:'milestone',
    condition: s => s.totalConversions >= 1000, reward: '万人迷' },
  { id:'ach_08', name:'转化之王', description:'累计获取 10000 个转化', icon:'👑', category:'milestone',
    condition: s => s.totalConversions >= 10000, reward: '转化之王' },

  { id:'ach_09', name:'万元户', description:'累计消耗突破 1 万元', icon:'💰', category:'milestone',
    condition: s => s.totalSpend >= 10000 },
  { id:'ach_10', name:'广告金主', description:'累计消耗突破 10 万元', icon:'💎', category:'milestone',
    condition: s => s.totalSpend >= 100000, reward: '广告金主' },
  { id:'ach_11', name:'烧钱机器', description:'累计消耗突破 100 万元', icon:'🚀', category:'milestone',
    condition: s => s.totalSpend >= 1000000, reward: '烧钱机器' },

  { id:'ach_12', name:'日复一日', description:'经营 7 天', icon:'📅', category:'milestone',
    condition: s => s.daysPlayed >= 7 },
  { id:'ach_13', name:'老司机', description:'经营 30 天', icon:'🚛', category:'milestone',
    condition: s => s.daysPlayed >= 30, reward: '老司机' },
  { id:'ach_14', name:'百年老店', description:'经营 100 天', icon:'🏛', category:'milestone',
    condition: s => s.daysPlayed >= 100, reward: '百年老店' },

  // ═══ 技能 ═══
  { id:'ach_15', name:'精打细算', description:'CPA 低于 5 元', icon:'🧮', category:'skill',
    condition: s => s.bestCPA > 0 && s.bestCPA <= 5, reward: '精算师' },
  { id:'ach_16', name:'极限优化', description:'CPA 低于 3 元', icon:'🔬', category:'skill',
    condition: s => s.bestCPA > 0 && s.bestCPA <= 3, reward: '极限优化师' },
  { id:'ach_17', name:'一本万利', description:'ROI 突破 2.0', icon:'📈', category:'skill',
    condition: s => s.bestROI >= 2.0, reward: 'ROI高手' },
  { id:'ach_18', name:'财富密码', description:'ROI 突破 5.0', icon:'🔑', category:'skill',
    condition: s => s.bestROI >= 5.0, reward: '财富密码' },
  { id:'ach_19', name:'全域覆盖', description:'在 5 个不同平台有投放', icon:'🌐', category:'skill',
    condition: s => s.platformCount >= 5 },
  { id:'ach_20', name:'全域制霸', description:'在 10 个不同平台有投放', icon:'🌍', category:'skill',
    condition: s => s.platformCount >= 10, reward: '全域大师' },
  { id:'ach_21', name:'多线作战', description:'同时 5 条计划投放中', icon:'⚔️', category:'skill',
    condition: s => s.maxActivePlans >= 5 },
  { id:'ach_22', name:'集团军', description:'同时 10 条计划投放中', icon:'🏰', category:'skill',
    condition: s => s.maxActivePlans >= 10, reward: '集团军司令' },

  // ═══ 挑战 ═══
  { id:'ach_23', name:'晋升之路', description:'达到独立优化师', icon:'🌿', category:'challenge',
    condition: s => s.careerStage >= 2 },
  { id:'ach_24', name:'高手之境', description:'达到高级优化师', icon:'🌳', category:'challenge',
    condition: s => s.careerStage >= 3 },
  { id:'ach_25', name:'巅峰之上', description:'达到投放总监', icon:'🏆', category:'challenge',
    condition: s => s.careerStage >= 4, reward: '投放总监' },
  { id:'ach_26', name:'任务猎人', description:'完成 10 个任务', icon:'🎯', category:'challenge',
    condition: s => s.missionsCompleted >= 10 },
  { id:'ach_27', name:'任务大师', description:'完成全部 25 个任务', icon:'🌟', category:'challenge',
    condition: s => s.missionsCompleted >= 25, reward: '全成就' },

  // ═══ 隐藏 ═══
  { id:'ach_28', name:'爆款制造机', description:'单条计划展示量超过 100 万', icon:'💥', category:'secret',
    condition: s => s.totalImpressions >= 1000000, reward: '爆款王' },
  { id:'ach_29', name:'逆天改命', description:'ROI 超过 10.0', icon:'🌈', category:'secret',
    condition: s => s.bestROI >= 10.0, reward: '天命之子' },
  { id:'ach_30', name:'零成本获客', description:'CPA 低于 1 元', icon:'🦄', category:'secret',
    condition: s => s.bestCPA > 0 && s.bestCPA <= 1, reward: '传说投手' },
];

interface AchievementState {
  unlocked: string[];  // achievement ids
  checkAndUnlock: (stats: AchievementStats) => string[]; // returns newly unlocked
  getUnlocked: () => Achievement[];
  getAll: () => Achievement[];
  getProgress: (stats: AchievementStats) => { total: number; unlocked: number };
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],

      checkAndUnlock: (stats) => {
        const newly: string[] = [];
        for (const ach of ACHIEVEMENTS) {
          if (!get().unlocked.includes(ach.id) && ach.condition(stats)) {
            newly.push(ach.id);
          }
        }
        if (newly.length > 0) {
          set(s => ({ unlocked: [...s.unlocked, ...newly] }));
        }
        return newly;
      },

      getUnlocked: () => ACHIEVEMENTS.filter(a => get().unlocked.includes(a.id)),
      getAll: () => ACHIEVEMENTS,
      getProgress: (stats) => {
        const total = ACHIEVEMENTS.length;
        const unlocked = ACHIEVEMENTS.filter(a => a.condition(stats)).length;
        return { total, unlocked };
      },
    }),
    { name: 'ad-simulator-achievements' }
  )
);
