// ============================================================
// 素材疲劳模型
// ============================================================

import { MaterialConfig, CampaignMetrics } from './types';
import { randomNormal, clamp } from '../utils/random';

/**
 * 计算素材新鲜度
 * 新鲜度 = 1.0 - (累计展示 / 疲劳阈值)²
 * 最低不低于 0.1（最大衰减 90%）
 */
export function calculateFreshness(
  material: MaterialConfig,
  cumulativeImpressions: number,
): number {
  if (cumulativeImpressions <= 0) return 1.0;
  const threshold = material.fatigueThreshold;
  const ratio = cumulativeImpressions / threshold;
  const freshness = 1.0 - Math.pow(clamp(ratio, 0, 2), 2) * 0.9;
  return clamp(freshness, 0.1, 1.0);
}

/**
 * 计算有效 CTR（考虑素材疲劳 + 人群匹配 + 随机噪声）
 */
export function calculateEffectiveCTR(
  baseCTR: number,
  material: MaterialConfig,
  freshness: number,
  audienceMatchScore: number,
): number {
  const materialFactor = (material.appeal / 100) * 0.7 + 0.3;
  const matchFactor = 0.5 + audienceMatchScore * 0.5;
  const noise = randomNormal(1, 0.05); // ±15% effective

  return baseCTR * freshness * materialFactor * matchFactor * noise;
}

/**
 * 计算有效 CVR（考虑卖点清晰度 + 落地页 + 噪声）
 */
export function calculateEffectiveCVR(
  baseCVR: number,
  material: MaterialConfig,
): number {
  const clarityFactor = (material.clarity / 100) * 0.6 + 0.4;
  const landingFactor = (material.landingScore / 100) * 0.5 + 0.5;
  const noise = randomNormal(1, 0.067); // ±20% effective

  return baseCVR * clarityFactor * landingFactor * noise;
}

/**
 * 计算学习期因子
 * 冷启动（< 阈值的 40%）：0.6-1.0，波动大
 * 学习期（< 阈值）：0.8-1.2，波动大
 * 稳定期（>= 阈值）：收敛到 1.0，波动小
 */
export function getLearningFactor(
  conversions: number,
  threshold: number,
): { factor: number; stage: 'cold_start' | 'learning' | 'stable' } {
  const ratio = conversions / threshold;

  if (ratio < 0.4) {
    // 冷启动期：数据少，波动大，但给新手一些宽容度
    return {
      factor: clamp(0.7 + randomNormal(0, 0.25), 0.5, 1.2),
      stage: 'cold_start',
    };
  }

  if (ratio < 1.0) {
    // 学习期：逐渐稳定
    return {
      factor: clamp(0.85 + randomNormal(0, 0.15), 0.6, 1.3),
      stage: 'learning',
    };
  }

  // 稳定期
  return {
    factor: clamp(randomNormal(1, 0.05), 0.9, 1.1),
    stage: 'stable',
  };
}

/**
 * 检测素材是否进入疲劳期
 */
export function isFatigued(
  material: MaterialConfig,
  cumulativeImpressions: number,
): boolean {
  return cumulativeImpressions > material.fatigueThreshold * 1.5;
}
