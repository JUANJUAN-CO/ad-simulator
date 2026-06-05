// ============================================================
// 转化漏斗 — 从展示到转化的完整链路
// ============================================================

import { CampaignConfig, CampaignMetrics, MaterialConfig, AudienceConfig } from './types';
import { Platform, IndustryType } from './types';
import { PLATFORMS } from './platforms';
import { binomial, randomNormal, withNoise, clamp } from '../utils/random';
import { VirtualUser, audienceMatchScore } from './user-pool';
import {
  calculateFreshness,
  calculateEffectiveCTR,
  calculateEffectiveCVR,
  getLearningFactor,
} from './fatigue';

/**
 * 转化漏斗结果
 */
export interface FunnelResult {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  conversionValue: number;
  effectiveCTR: number;
  effectiveCVR: number;
  cpa: number;
  roi: number;
  learningStage: 'cold_start' | 'learning' | 'stable' | 'fatigue';
  materialFreshness: number;
}

/**
 * 运行转化漏斗
 * @param impressions 赢得的展示量
 * @param campaign 计划配置
 * @param metrics 当前累计指标
 * @param material 素材配置
 * @param audience 人群定向配置
 * @param industry 行业
 * @param sampledUsers 抽取的虚拟用户
 */
export function runFunnel(
  impressions: number,
  campaign: CampaignConfig,
  metrics: CampaignMetrics,
  material: MaterialConfig,
  audience: AudienceConfig,
  industry: IndustryType,
  sampledUsers: VirtualUser[],
): FunnelResult {
  if (impressions <= 0 || sampledUsers.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      conversionValue: 0,
      effectiveCTR: 0,
      effectiveCVR: 0,
      cpa: 0,
      roi: 0,
      learningStage: metrics.learningStage || 'cold_start',
      materialFreshness: 1,
    };
  }

  const platformConfig = PLATFORMS[campaign.platform];
  const totalImpressions = (metrics.impressions || 0) + impressions;

  // 素材新鲜度
  const freshness = calculateFreshness(material, totalImpressions);

  // 计算这批用户的平均匹配度
  const avgMatchScore = sampledUsers.reduce(
    (sum, u) => sum + audienceMatchScore(u, audience, industry),
    0,
  ) / sampledUsers.length;

  // 有效 CTR
  const effectiveCTR = calculateEffectiveCTR(
    platformConfig.avgCTR,
    material,
    freshness,
    avgMatchScore,
  );

  // 基础 CVR
  const baseCVR = sampledUsers.reduce(
    (sum, u) => sum + u.convertProb,
    0,
  ) / sampledUsers.length;

  // 有效 CVR
  const effectiveCVR = calculateEffectiveCVR(baseCVR, material);

  // 学习期因子
  const totalConversions = metrics.conversions || 0;
  const learning = getLearningFactor(totalConversions, platformConfig.learningThreshold);
  const learningMultiplier = learning.factor;

  // 漏斗计算
  const clicks = binomial(impressions, clamp(effectiveCTR, 0.001, 0.2));
  const conversions = binomial(clicks, clamp(effectiveCVR * learningMultiplier, 0.001, 0.5));

  // 花费计算
  let spend: number;
  switch (campaign.bidMode) {
    case 'cpm':
      spend = (impressions / 1000) * campaign.bidPrice;
      break;
    case 'cpc':
      spend = clicks * campaign.bidPrice;
      break;
    case 'ocpm':
      spend = (impressions / 1000) * withNoise(campaign.bidPrice, 0.1);
      break;
    case 'ocpc':
      spend = clicks * withNoise(campaign.bidPrice, 0.1);
      break;
    default:
      spend = (impressions / 1000) * campaign.bidPrice;
  }

  // 转化价值（每转化约 bidPrice × 3-8 倍的客单价，取决于行业）
  const avgOrderValue = getIndustryOrderValue(industry);
  const conversionValue = conversions * withNoise(avgOrderValue, 0.2);

  const cpa = conversions > 0 ? spend / conversions : 0;
  const roi = spend > 0 ? conversionValue / spend : 0;

  return {
    impressions,
    clicks,
    conversions,
    spend,
    conversionValue,
    effectiveCTR,
    effectiveCVR,
    cpa,
    roi,
    learningStage: learning.stage,
    materialFreshness: freshness,
  };
}

/** 各行业平均客单价（元） */
function getIndustryOrderValue(industry: IndustryType): number {
  const values: Record<IndustryType, number> = {
    ecommerce: 80,
    education: 200,
    local_services: 50,
    gaming: 30,
    finance: 500,
    beauty: 120,
    health: 150,
    home: 300,
    travel: 400,
    food: 35,
  };
  return values[industry] || 100;
}
