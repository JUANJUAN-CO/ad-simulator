// ============================================================
// 竞价引擎 — OCPM/OCPC 竞价模拟
// ============================================================

import { Platform, CampaignConfig, CampaignMetrics, CompetitorPlan } from './types';
import { PLATFORMS } from './platforms';
import { random, randomNormal, sigmoid, clamp } from '../utils/random';
import { CompetitorEngine } from './competitor';

/**
 * 计算一条计划的 eCPM
 * eCPM = bidPrice × pCTR × pCVR × 1000
 */
export function calculateECPM(
  campaign: CampaignConfig,
  metrics: CampaignMetrics,
): number {
  const pCtr = metrics.effectiveCtr || PLATFORMS[campaign.platform].avgCTR;
  const pCvr = metrics.effectiveCvr || 0.03;

  switch (campaign.bidMode) {
    case 'cpm':
      return campaign.bidPrice;
    case 'cpc':
      return campaign.bidPrice * pCtr * 1000;
    case 'ocpm':
    case 'ocpc':
      // OCPM: 系统优化出价，eCPM = bidPrice × pCTR × pCVR × 1000 × 优化系数
      const boost = 1.0 + randomNormal(0, 0.08); // ±25% 波动
      return campaign.bidPrice * pCtr * clamp(pCvr, 0.008, 0.3) * 1000 * boost;
    default:
      return campaign.bidPrice * pCtr * pCvr * 1000;
  }
}

/**
 * 计算在给定市场竞争下的胜出概率
 */
export function calculateWinProbability(
  yourECPM: number,
  platform: Platform,
  competitionIntensity: number,
): number {
  const platformConfig = PLATFORMS[platform];
  const marketMedianECPM = platformConfig.avgCPM * (1 + competitionIntensity * 0.5);
  const advantage = (yourECPM / marketMedianECPM) - 1;
  const steepness = 3 - competitionIntensity * 1.5; // 竞争越激烈，差距越重要
  return clamp(sigmoid(advantage * steepness), 0.02, 0.95);
}

/**
 * 单次竞价结果
 */
export interface AuctionResult {
  won: boolean;
  impressions: number;
  winRate: number;
  competitorWins: number;
  marketECPM: number;
  yourECPM: number;
}

/**
 * 执行一轮竞价
 * @param campaign 你的计划
 * @param metrics 当前指标
 * @param availableTraffic 该时段可竞价的流量
 * @param competitors 活跃竞争者
 */
export function runAuction(
  campaign: CampaignConfig,
  metrics: CampaignMetrics,
  availableTraffic: number,
  competitors: CompetitorEngine,
  competitionIntensity: number,
): AuctionResult {
  const yourECPM = calculateECPM(campaign, metrics);
  const marketECPM = PLATFORMS[campaign.platform].avgCPM * (1 + competitionIntensity * 0.5);
  const winRate = calculateWinProbability(yourECPM, campaign.platform, competitionIntensity);

  // 预算约束
  const remainingDaily = campaign.dailyBudget - (metrics.dailySpend || 0);
  const maxImpressionsByBudget = campaign.bidMode === 'cpm'
    ? (remainingDaily / campaign.bidPrice) * 1000
    : remainingDaily / (yourECPM / 1000);

  const wonImpressions = Math.min(
    Math.floor(availableTraffic * winRate * randomNormal(1, 0.1)),
    Math.max(0, maxImpressionsByBudget),
  );

  // 竞争者胜出的展示数
  const competitorWins = Math.floor(availableTraffic * (1 - winRate));

  return {
    won: wonImpressions > 0,
    impressions: Math.max(0, wonImpressions),
    winRate,
    competitorWins,
    marketECPM,
    yourECPM,
  };
}
