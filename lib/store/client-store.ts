// ============================================================
// 客户场景 Store — 随机客户需求单管理
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CampaignGoal, IndustryType, Platform, MissionDifficulty } from '../engine/types';

export interface ActiveClientBrief {
  id: string;
  companyName: string;
  contactName: string;
  industry: IndustryType;
  title: string;
  brief: string;
  budget: number;
  goal: CampaignGoal;
  targetCPA: number;
  targetROI: number;
  deadlineDays: number;
  acceptedAtDay: number;     // 接取时的 simDay
  difficulty: MissionDifficulty;
  platforms: Platform[];
  constraints: string[];
  rewards: { exp: number; money: number; title?: string };
  penalty: { exp: number; money: number };
  status: 'pending' | 'accepted' | 'completed' | 'failed' | 'expired';
}

// 客户简报池
const CLIENT_POOL: Array<Omit<ActiveClientBrief, 'id' | 'status' | 'acceptedAtDay'>> = [
  { companyName:'花漾美妆', contactName:'张经理', industry:'beauty', title:'新品口红上市', brief:'新推出的水光唇釉系列。预算有限，在抖音/小红书以小博大。', budget:3000, goal:'leads', targetCPA:8, targetROI:1.2, deadlineDays:3, difficulty:'easy', platforms:['douyin_feed','xiaohongshu_feed'], constraints:['女性人群','日预算≤500'], rewards:{exp:300,money:800}, penalty:{exp:50,money:200} },
  { companyName:'天天零食', contactName:'李总', industry:'food', title:'零食大礼包清仓', brief:'春节前清库存，快手吃播风格转化最好。', budget:2000, goal:'ecommerce', targetCPA:5, targetROI:1.5, deadlineDays:2, difficulty:'easy', platforms:['kuaishou_feed','douyin_feed'], constraints:['至少2条计划','优先快手'], rewards:{exp:250,money:600}, penalty:{exp:30,money:100} },
  { companyName:'启航教育', contactName:'赵校长', industry:'education', title:'编程夏令营招生', brief:'面向中小学生的编程夏令营。微信朋友圈+百度搜索。', budget:5000, goal:'leads', targetCPA:15, targetROI:1.8, deadlineDays:5, difficulty:'easy', platforms:['wechat_moments','baidu_search'], constraints:['年龄25-45','日预算≥300'], rewards:{exp:400,money:1200}, penalty:{exp:60,money:300} },
  { companyName:'星辰游戏', contactName:'王制作人', industry:'gaming', title:'新游首发推广', brief:'二次元卡牌手游上线，B站+抖音同步推。', budget:15000, goal:'app_install', targetCPA:6, targetROI:2.0, deadlineDays:7, difficulty:'medium', platforms:['bilibili_feed','douyin_feed'], constraints:['游戏素材','日预算≥1000','≥3条计划'], rewards:{exp:800,money:3000}, penalty:{exp:150,money:800} },
  { companyName:'绿洲旅行', contactName:'陈总监', industry:'travel', title:'国庆黄金周路线', brief:'国庆预热，云南/新疆高端定制游。小红书种草+抖音直播。', budget:20000, goal:'leads', targetCPA:20, targetROI:3.0, deadlineDays:10, difficulty:'medium', platforms:['xiaohongshu_feed','douyin_feed','xiaohongshu_live'], constraints:['旅游素材','≥2平台','ROI≥2.5'], rewards:{exp:1000,money:5000}, penalty:{exp:200,money:1000} },
  { companyName:'安家金融', contactName:'周总', industry:'finance', title:'理财APP拉新', brief:'理财产品获客，高净值人群。知乎+百度+公众号。', budget:30000, goal:'app_install', targetCPA:40, targetROI:2.5, deadlineDays:14, difficulty:'medium', platforms:['zhihu_feed','baidu_search','wechat_oa'], constraints:['金融素材','高消费意愿人群'], rewards:{exp:1500,money:8000}, penalty:{exp:300,money:2000} },
  { companyName:'环球家电', contactName:'林总', industry:'home', title:'618全屋智能大促', brief:'618全屋智能套装（客单价5000+），三体系联动。', budget:80000, goal:'ecommerce', targetCPA:50, targetROI:3.5, deadlineDays:14, difficulty:'hard', platforms:['douyin_feed','qianchuan','wechat_moments','xiaohongshu_feed'], constraints:['≥4条计划','≥3平台体系','日预算≥3000'], rewards:{exp:3000,money:20000,title:'大促操盘手'}, penalty:{exp:500,money:5000} },
  { companyName:'出海优选', contactName:'Jack Chen', industry:'ecommerce', title:'TikTok跨境电商', brief:'国内爆款投TikTok+Facebook。素材要国际化。', budget:50000, goal:'ecommerce', targetCPA:15, targetROI:2.8, deadlineDays:14, difficulty:'hard', platforms:['tiktok_feed','tiktok_spark','facebook_ads'], constraints:['海外平台','国际化素材','≥5条计划'], rewards:{exp:3500,money:25000,title:'出海专家'}, penalty:{exp:500,money:5000} },
  { companyName:'万象集团', contactName:'董事会', industry:'ecommerce', title:'全平台年度战役', brief:'年度品牌战役。10+平台全覆盖，这是最大的考验。', budget:200000, goal:'brand', targetCPA:30, targetROI:2.0, deadlineDays:30, difficulty:'expert', platforms:['douyin_feed','qianchuan','xiaohongshu_feed','kuaishou_feed','wechat_moments','baidu_search','bilibili_feed','zhihu_feed','tiktok_feed','facebook_ads'], constraints:['≥8平台有转化','≥10条计划','总转化≥500'], rewards:{exp:10000,money:100000,title:'年度投手'}, penalty:{exp:1000,money:10000} },
];

const DIFF_MAP: Record<number, MissionDifficulty[]> = {
  1: ['easy'],
  2: ['easy', 'medium'],
  3: ['easy', 'medium', 'hard'],
  4: ['easy', 'medium', 'hard', 'expert'],
};

interface ClientState {
  activeBriefs: ActiveClientBrief[];
  completedBriefs: string[];  // completed ids
  lastOfferDay: number;       // 上次弹出客户请求的 simDay

  generateOffer: (stage: number, currentSimDay: number) => ActiveClientBrief | null;
  acceptBrief: (briefId: string, simDay: number) => void;
  checkBriefs: (campaignData: {
    totalConversions: number;
    totalSpend: number;
    totalValue: number;
    platformCount: number;
    planCount: number;
  }, currentSimDay: number) => { completed: ActiveClientBrief[]; failed: ActiveClientBrief[] };
  completeBrief: (id: string) => void;
  failBrief: (id: string) => void;
  dismissBrief: (id: string) => void;
  getPending: () => ActiveClientBrief[];
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      activeBriefs: [],
      completedBriefs: [],
      lastOfferDay: -999,

      generateOffer: (stage, currentSimDay) => {
        const available = CLIENT_POOL.filter(b =>
          DIFF_MAP[stage]?.includes(b.difficulty) &&
          !get().activeBriefs.some(ab => ab.companyName === b.companyName && ab.status === 'accepted') &&
          !get().completedBriefs.includes(b.companyName)
        );
        if (available.length === 0) return null;

        const template = available[Math.floor(Math.random() * available.length)];
        const brief: ActiveClientBrief = {
          ...template,
          id: `client_${Date.now().toString(36)}`,
          status: 'pending',
          acceptedAtDay: -1,
        };

        set(s => ({
          activeBriefs: [...s.activeBriefs, brief],
          lastOfferDay: currentSimDay,
        }));

        return brief;
      },

      acceptBrief: (briefId, simDay) => set(s => ({
        activeBriefs: s.activeBriefs.map(b =>
          b.id === briefId ? { ...b, status: 'accepted' as const, acceptedAtDay: simDay } : b
        ),
      })),

      checkBriefs: (campaignData, currentSimDay) => {
        const completed: ActiveClientBrief[] = [];
        const failed: ActiveClientBrief[] = [];

        for (const b of get().activeBriefs) {
          if (b.status !== 'accepted') continue;

          const cpa = campaignData.totalConversions > 0 ? campaignData.totalSpend / campaignData.totalConversions : Infinity;
          const roi = campaignData.totalSpend > 0 ? campaignData.totalValue / campaignData.totalSpend : 0;
          const daysPassed = currentSimDay - b.acceptedAtDay;
          const expired = daysPassed > b.deadlineDays;

          const cpaMet = cpa <= b.targetCPA;
          const roiMet = roi >= b.targetROI;
          const platformMet = b.platforms.filter(p => true).length > 0; // simplified

          if (cpaMet && roiMet && campaignData.totalConversions >= (b.difficulty === 'expert' ? 50 : 10)) {
            completed.push(b);
          } else if (expired) {
            failed.push(b);
          }
        }

        return { completed, failed };
      },

      completeBrief: (id) => set(s => ({
        activeBriefs: s.activeBriefs.map(b =>
          b.id === id ? { ...b, status: 'completed' as const } : b
        ),
        completedBriefs: [...s.completedBriefs, id],
      })),

      failBrief: (id) => set(s => ({
        activeBriefs: s.activeBriefs.map(b =>
          b.id === id ? { ...b, status: 'failed' as const } : b
        ),
      })),

      dismissBrief: (id) => set(s => ({
        activeBriefs: s.activeBriefs.filter(b => b.id !== id),
      })),

      getPending: () => get().activeBriefs.filter(b => b.status === 'pending'),
    }),
    { name: 'ad-simulator-clients' }
  )
);
