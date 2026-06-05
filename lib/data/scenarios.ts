// ============================================================
// 客户场景 — 无尽的客户需求生成
// ============================================================
import { ClientScenario, IndustryType, CampaignGoal } from '../engine/types';
import { randomInt } from '../utils/random';

const CLIENT_TEMPLATES: Omit<ClientScenario, 'id' | 'budget' | 'targetCPA' | 'targetROI' | 'deadline'>[] = [
  {
    companyName: '花漾美妆',
    industry: 'beauty',
    brief: '国货美妆品牌，主打平价口红和眼影盘，目标用户18-30岁女性，希望在小红书和抖音做种草投放。',
    goal: 'ecommerce',
    difficulty: 'easy',
    constraints: ['素材需要真人试色', '不能夸大功效'],
    platforms: ['douyin', 'xiaohongshu'],
  },
  {
    companyName: '智学在线',
    industry: 'education',
    brief: '在线编程培训机构，主打Python和AI课程，目标用户22-35岁有转行需求的职场人。',
    goal: 'leads',
    difficulty: 'medium',
    constraints: ['需要展示真实就业案例', 'CPA不超过50元'],
    platforms: ['douyin', 'wechat'],
  },
  {
    companyName: '鲜味到家',
    industry: 'food',
    brief: '预制菜品牌，主打3分钟快手菜，目标用户25-40岁忙碌的上班族和家庭用户。',
    goal: 'ecommerce',
    difficulty: 'easy',
    constraints: ['素材需要有食欲', '强调方便快捷'],
    platforms: ['douyin', 'kuaishou'],
  },
  {
    companyName: '悦动健身',
    industry: 'health',
    brief: '连锁健身房品牌，新店开业需要引流，目标用户20-40岁注重健康的城市白领。',
    goal: 'leads',
    difficulty: 'medium',
    constraints: ['需要到店核销', '7天体验卡模式'],
    platforms: ['douyin', 'wechat'],
  },
  {
    companyName: '漫游旅行',
    industry: 'travel',
    brief: '高端定制旅行品牌，主打小众目的地深度游，目标用户30-50岁高收入人群。',
    goal: 'leads',
    difficulty: 'hard',
    constraints: ['客单价高（5000+）', '转化周期长', '需要建立信任'],
    platforms: ['xiaohongshu', 'wechat'],
  },
  {
    companyName: '星辰游戏',
    industry: 'gaming',
    brief: '新手游上线推广，MMORPG类型，目标用户18-30岁男性玩家，需要大量下载。',
    goal: 'app_install',
    difficulty: 'medium',
    constraints: ['素材需要实机画面', '不能虚假宣传', 'CPA不超过10元'],
    platforms: ['douyin', 'kuaishou'],
  },
  {
    companyName: '安逸理财',
    industry: 'finance',
    brief: '互联网理财平台，推广基金定投产品，目标用户25-45岁有理财需求的人群。',
    goal: 'leads',
    difficulty: 'hard',
    constraints: ['必须标注风险提示', '需要合规审核', '不能承诺收益'],
    platforms: ['wechat', 'douyin'],
  },
  {
    companyName: '雅居整装',
    industry: 'home',
    brief: '全屋定制品牌，主打环保板材和一站式装修，目标用户28-45岁有装修需求的家庭。',
    goal: 'leads',
    difficulty: 'medium',
    constraints: ['需要展示实景案例', '强调环保和售后', '转化周期1-3个月'],
    platforms: ['douyin', 'xiaohongshu', 'wechat'],
  },
  {
    companyName: '鲜火锅',
    industry: 'local_services',
    brief: '新开火锅店，需要在周边3公里内做精准引流，目标用户全年龄段。',
    goal: 'leads',
    difficulty: 'easy',
    constraints: ['需要LBS定向', '限时优惠券', '到店核销'],
    platforms: ['douyin', 'wechat'],
  },
  {
    companyName: '潮流衣品',
    industry: 'ecommerce',
    brief: '设计师品牌服装，主打设计师联名款，目标用户20-32岁追求个性的年轻女性。',
    goal: 'ecommerce',
    difficulty: 'medium',
    constraints: ['素材需要有时尚感', '强调限量/独家', 'ROI需要>1.5'],
    platforms: ['xiaohongshu', 'douyin'],
  },
];

/**
 * 生成无尽客户场景（用于无尽经营模式）
 */
export function generateScenario(
  stageRequired: number,
): ClientScenario {
  const template = CLIENT_TEMPLATES[randomInt(0, CLIENT_TEMPLATES.length - 1)];

  // 根据阶段调整预算和难度
  const budgetMultiplier = [1, 3, 15, 50][stageRequired - 1] || 1;
  const baseBudget = [300, 1000, 5000, 20000][stageRequired - 1] || 500;

  return {
    ...template,
    id: `scenario_${Date.now().toString(36)}_${randomInt(0, 9999)}`,
    budget: baseBudget * (0.8 + Math.random() * 0.4),
    targetCPA: 5 * stageRequired + randomInt(0, 10),
    targetROI: 1 + stageRequired * 0.5 + Math.random(),
    deadline: [7, 10, 14, 21][stageRequired - 1] || 7,
    difficulty: template.difficulty || 'easy',
  };
}

/**
 * 获取预设场景（用于教学阶段）
 */
export function getPresetScenario(stageRequired: number): ClientScenario {
  const idx = stageRequired <= CLIENT_TEMPLATES.length ? stageRequired - 1 : 0;
  const template = CLIENT_TEMPLATES[idx];

  return {
    ...template,
    id: `scenario_preset_${stageRequired}`,
    budget: [500, 2000, 8000, 30000][stageRequired - 1],
    targetCPA: [8, 12, 20, 30][stageRequired - 1],
    targetROI: [1.0, 1.5, 2.0, 2.5][stageRequired - 1],
    deadline: [3, 7, 14, 30][stageRequired - 1],
  };
}
