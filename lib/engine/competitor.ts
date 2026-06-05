// ============================================================
// 虚拟竞争者引擎 — 模拟市场中的其他广告主
// ============================================================

import { Platform, CompetitorPlan, MarketCondition } from './types';
import { PLATFORMS } from './platforms';
import { random, randomNormal, randomInt, randomRange, withNoise, clamp } from '../utils/random';

const COMPETITOR_NAMES = [
  '爆款制造机', '精准投放王', '流量收割者', '数据驱动官',
  '创意工坊', '增长猎手', '转化专家', '投放老司机',
  '种草达人', '流量操盘手', '算法捕手', '品牌助推器',
  '效果引擎', '用户增长官', '广告先锋', '智能投手',
];

/**
 * 竞争者引擎：管理虚拟广告主
 */
export class CompetitorEngine {
  private competitors: CompetitorPlan[] = [];
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
    this.initCompetitors();
  }

  private initCompetitors() {
    const pConfig = PLATFORMS[this.platform];
    const count = randomInt(15, 30);
    const audiences = ['broad', 'young_female', 'middle_male', 'tier1-2', 'tier3-4'];

    for (let i = 0; i < count; i++) {
      const aggression = randomRange(0.2, 0.9);
      this.competitors.push({
        id: `comp_${this.platform}_${i}`,
        name: COMPETITOR_NAMES[i % COMPETITOR_NAMES.length] + (i > 15 ? ` ${Math.floor(i / 16) + 1}` : ''),
        platform: this.platform,
        audience: audiences[randomInt(0, audiences.length - 1)],
        bidPrice: withNoise(pConfig.avgCPM * 0.8, 0.4),
        dailyBudget: randomInt(200, 10000),
        materialQuality: randomInt(40, 90),
        aggression,
        status: random() > 0.2 ? 'active' : 'paused',
      });
    }
  }

  /** 获取当前活跃竞争者 */
  getActive(): CompetitorPlan[] {
    return this.competitors.filter(c => c.status === 'active');
  }

  /** 获取平均出价 */
  getAverageBid(): number {
    const active = this.getActive();
    if (active.length === 0) return PLATFORMS[this.platform].avgCPM;
    return active.reduce((s, c) => s + c.bidPrice, 0) / active.length;
  }

  /** 获取竞争强度 (0-1) */
  getIntensity(): number {
    const activeCount = this.getActive().length;
    return clamp(activeCount / 40, 0.2, 1.0);
  }

  /**
   * 每 tick 更新竞争者行为
   */
  tick(marketCondition: MarketCondition) {
    for (const comp of this.competitors) {
      // 激进型竞争者在大促时加价
      if (marketCondition.activeEvent && comp.aggression > 0.6) {
        comp.bidPrice *= 1 + randomRange(0.05, 0.2) * marketCondition.activeEvent.competitionMultiplier;
      }

      // 随市场波动调整出价
      const marketShift = randomNormal(0, 0.03);
      comp.bidPrice *= (1 + marketShift);

      // 质量差异影响长期竞争力
      if (comp.materialQuality < 30 && random() < 0.1) {
        comp.status = 'paused'; // 质量差的被淘汰
      } else if (comp.materialQuality > 70 && comp.status === 'paused' && random() < 0.15) {
        comp.status = 'active'; // 质量好的重新上线
      }

      // 价格不能太低或太高
      comp.bidPrice = clamp(comp.bidPrice, PLATFORMS[this.platform].avgCPM * 0.3, PLATFORMS[this.platform].avgCPM * 4);
      comp.dailyBudget = clamp(comp.dailyBudget, 100, 50000);
    }
  }

  /** 获取所有竞争者（用于展示） */
  getAll(): CompetitorPlan[] {
    return this.competitors;
  }
}
