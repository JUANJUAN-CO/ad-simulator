// ============================================================
// 虚拟用户池 — 统计分布驱动的百万级用户模拟
// ============================================================

import { Platform, AudienceConfig, IndustryType } from './types';
import { random, randomNormal, randomInt, withNoise, binomial, sigmoid, clamp } from '../utils/random';
import { PLATFORMS, getTimeFactor, getSeasonFactor } from './platforms';

// 城市等级基础分布权重
const CITY_TIER_BASE_WEIGHTS = [0.15, 0.25, 0.25, 0.20, 0.15]; // 1-5线均匀分布

/** 根据平台支持的城市等级生成权重 */
function getCityTierWeights(platformTiers: number[]): number[] {
  // 只保留平台支持的城市等级，归一化
  const weights = CITY_TIER_BASE_WEIGHTS.map((w, i) =>
    platformTiers.includes(i + 1) ? w : 0
  );
  const total = weights.reduce((a, b) => a + b, 0);
  return total > 0 ? weights.map(w => w / total) : weights;
}

// 年龄段分布权重
const AGE_WEIGHTS = [0.25, 0.35, 0.20, 0.20]; // 18-24, 25-34, 35-44, 45+
const AGE_RANGES: [number, number][] = [[18, 24], [25, 34], [35, 44], [45, 60]];

// 消费意愿分布
const PURCHASE_INTENT_WEIGHTS = [0.30, 0.40, 0.20, 0.10]; // low, medium, high, very_high

/** 单次展示的虚拟用户 */
export interface VirtualUser {
  age: number;
  gender: 'male' | 'female';
  cityTier: number; // 1-5
  purchaseIntent: number; // 0-3 (low to very_high)
  platformActive: number; // 0-1 当前平台活跃概率
  clickProb: number; // 基础点击概率
  convertProb: number; // 基础转化概率
}

/**
 * 生成一批虚拟用户（抽样，非存储）
 * @param count 抽样数量
 * @param platform 目标平台
 * @param hour 当前小时
 * @param dayOfWeek 周几
 * @param month 月份
 */
export function sampleUsers(
  count: number,
  platform: Platform,
  hour: number,
  dayOfWeek: number,
  month: number,
): VirtualUser[] {
  const pConfig = PLATFORMS[platform];
  if (!pConfig) return []; // 平台不存在
  const cityWeights = getCityTierWeights(pConfig.cityTiers);
  const timeFactor = getTimeFactor(platform, hour, dayOfWeek);
  const seasonFactor = getSeasonFactor(month);
  const trafficScale = timeFactor * seasonFactor;

  const users: VirtualUser[] = [];

  for (let i = 0; i < count; i++) {
    // 城市等级 (1-5)
    let cityR = random();
    let cityTier = 1;
    let cumWeight = 0;
    for (let t = 0; t < cityWeights.length; t++) {
      cumWeight += cityWeights[t];
      if (cityR <= cumWeight) { cityTier = t + 1; break; }
    }

    // 年龄段
    let ageR = random();
    let ageIdx = 0;
    cumWeight = 0;
    for (let a = 0; a < AGE_WEIGHTS.length; a++) {
      cumWeight += AGE_WEIGHTS[a];
      if (ageR <= cumWeight) { ageIdx = a; break; }
    }
    const [ageMin, ageMax] = AGE_RANGES[ageIdx];
    const age = randomInt(ageMin, ageMax);

    // 性别（平台差异）
    const gender = random() < pConfig.femaleRatio ? 'female' : 'male';

    // 消费意愿
    let intentR = random();
    let purchaseIntent = 0;
    cumWeight = 0;
    for (let p = 0; p < PURCHASE_INTENT_WEIGHTS.length; p++) {
      cumWeight += PURCHASE_INTENT_WEIGHTS[p];
      if (intentR <= cumWeight) { purchaseIntent = p; break; }
    }

    // 平台活跃度（受时段影响）
    const baseActive = randomNormal(0.5, 0.25);
    const platformActive = clamp(baseActive * trafficScale, 0, 1);

    // 基础概率（后由素材/定向调整）
    // CTR: 平台平均CTR × 活跃度加成 × 消费意愿加成
    const clickProb = clamp(
      pConfig.avgCTR * (0.5 + platformActive) * (0.8 + purchaseIntent * 0.15),
      0.002, 0.15,
    );
    // CVR: 基础 5% × 消费意愿加成（提高以保证数据可见）
    const convertProb = clamp(
      0.05 * (1 + purchaseIntent * 0.35) * (0.7 + platformActive * 0.3),
      0.005, 0.30,
    );

    users.push({
      age, gender, cityTier, purchaseIntent, platformActive, clickProb, convertProb,
    });
  }

  return users;
}

/**
 * 计算定向匹配度：人群定向与虚拟用户的匹配程度
 */
export function audienceMatchScore(user: VirtualUser, audience: AudienceConfig, industry: IndustryType): number {
  let score = 0;
  const maxScore = 4;

  // 性别匹配
  if (audience.gender === 'all' || audience.gender === user.gender) score += 1;

  // 年龄匹配
  if (user.age >= audience.ageRange[0] && user.age <= audience.ageRange[1]) score += 1;

  // 城市等级匹配
  if (audience.cityTiers.includes(user.cityTier)) score += 1;

  // 行业匹配度影响
  const industryMatch = audience.matchScore[industry] || 50;
  if (industryMatch > 70) score += 1;

  return score / maxScore;
}

/**
 * 估算某定向在该平台每 tick (10分钟) 的可竞价流量
 *
 * 核心思路：以预算反推合理流量。
 * 日预算 200¥ 的 CPM 15¥ 计划，全天可买 200/15*1000 ≈ 13,333 次展示。
 * 每 tick = 13,333/144 ≈ 93 次展示。
 * 但由于竞价有胜率（~30%），需要竞争池略大于实际买到量。
 * 所以：基础流量 = 预算 / CPM * 1000 / 144 * 竞争因子(5x)
 */
export function estimateReachableUsers(
  platform: Platform,
  audience: AudienceConfig,
  hour: number,
  dayOfWeek: number,
  month: number,
  campaignDailyBudget: number = 200,
): number {
  const pConfig = PLATFORMS[platform];
  const timeFactor = getTimeFactor(platform, hour, dayOfWeek);
  const seasonFactor = getSeasonFactor(month);
  const TICKS_PER_DAY = 144;

  // 基础：这条计划全天花完预算能买多少展示
  const dailyImpressionCapacity = (campaignDailyBudget / pConfig.avgCPM) * 1000;
  const basePerTick = dailyImpressionCapacity / TICKS_PER_DAY;

  // 确保日预算一天花完：大量流量 × 竞价胜率 × 全天分散 = 刚好花完
  // 不考虑时段打折（时段影响在 processTick 层通过赢得量自然体现）
  const COMPETITION_FACTOR = 35;

  // 定向过滤
  let targetingFilter = 1.0;
  if (audience.gender !== 'all') targetingFilter *= 0.6;
  const ageSpan = audience.ageRange[1] - audience.ageRange[0];
  targetingFilter *= clamp(ageSpan / 42, 0.15, 1);
  targetingFilter *= (audience.cityTiers.length / 5) * 0.8 + 0.2;

  // 时段因子直接乘，低谷就真的低，高峰就真的高
  // 但加一个底盘确保不会完全为零
  const effectiveTimeFactor = Math.max(timeFactor, 0.05);
  const perTickTraffic = Math.floor(
    basePerTick * COMPETITION_FACTOR * effectiveTimeFactor * seasonFactor * targetingFilter
  );

  return perTickTraffic;
}
