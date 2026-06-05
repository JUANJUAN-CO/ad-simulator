// ============================================================
// 模拟引擎调度器 — 时间驱动的主循环
// ============================================================

import {
  Platform, CampaignConfig, CampaignMetrics, AudienceConfig,
  MaterialConfig, MarketCondition, MarketEvent, SimulationState,
  IndustryType,
} from './types';
import { PLATFORMS, getTimeFactor, getSeasonFactor } from './platforms';
import { sampleUsers, estimateReachableUsers } from './user-pool';
import { runAuction, AuctionResult } from './auction';
import { runFunnel, FunnelResult } from './funnel';
import { CompetitorEngine } from './competitor';
import { clamp, randomNormal, random } from '../utils/random';

/** 每 tick 代表 10 分钟现实时间 */
const MINUTES_PER_TICK = 10;
const TICKS_PER_HOUR = 6;
const TICKS_PER_DAY = 144;

export interface TickResult {
  campaignId: string;
  platform: Platform;
  time: number;
  funnel: FunnelResult;
  auction: AuctionResult;
  metrics: CampaignMetrics;
}

/**
 * 模拟引擎：管理模拟时间、驱动每 tick 的计算
 */
export class SimulationEngine {
  private state: SimulationState;
  private competitorEngines: Map<Platform, CompetitorEngine> = new Map();
  private tickCallback: ((results: TickResult) => void) | null = null;
  private timerHandle: ReturnType<typeof setInterval> | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.state = {
      isRunning: false,
      speed: 1,
      currentTime: Date.now(),
      tickCount: 0,
      marketCondition: {
        competitionIntensity: 0.5,
        timeFactor: 0.5,
        dayOfWeek: new Date().getDay(),
        seasonFactor: 1.0,
        activeEvent: null,
      },
    };

    // 为每个平台初始化竞争者引擎
    (Object.keys(PLATFORMS) as Platform[]).forEach(p => {
      this.competitorEngines.set(p, new CompetitorEngine(p));
    });
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  setState(partial: Partial<SimulationState>) {
    this.state = { ...this.state, ...partial };
  }

  onTick(callback: (results: TickResult) => void) {
    this.tickCallback = callback;
  }

  /** 启动模拟 */
  start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.scheduleTick();
  }

  /** 暂停模拟 */
  pause() {
    this.state.isRunning = false;
    this.state.speed = 0;
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  /** 设置速度 */
  setSpeed(speed: 0 | 1 | 5 | 20) {
    this.state.speed = speed;
    if (speed === 0) {
      this.pause();
      return;
    }
    if (!this.state.isRunning) {
      this.start();
    }
    // 重新调度
    if (this.timerHandle) clearTimeout(this.timerHandle);
    this.scheduleTick();
  }

  /** 调度下一次 tick */
  private scheduleTick() {
    if (!this.state.isRunning || this.state.speed === 0) return;

    // 基准 tick 间隔 = 10 分钟现实 = 600000ms
    // 在 20x 速度下，10 模拟分钟 = 30 秒现实时间
    const intervals: Record<number, number> = {
      1: 6000,   // 1x: 6 秒 = 10 模拟分钟
      5: 1200,   // 5x: 1.2 秒
      20: 300,   // 20x: 0.3 秒
    };

    const interval = intervals[this.state.speed] || 6000;
    this.timerHandle = setTimeout(() => {
      this.executeTick();
      this.scheduleTick();
    }, interval);
  }

  /**
   * 执行一个 tick：对所有活跃计划运行竞价+漏斗
   */
  executeTick(): TickResult[] {
    this.state.tickCount++;

    // 推进时间
    this.state.currentTime += MINUTES_PER_TICK * 60 * 1000;
    const date = new Date(this.state.currentTime);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;

    // 更新市场状态
    this.state.marketCondition.dayOfWeek = dayOfWeek;
    this.state.marketCondition.seasonFactor = getSeasonFactor(month);

    const results: TickResult[] = [];

    // 对每个平台的活跃计划执行模拟
    for (const [platform, competitors] of this.competitorEngines) {
      const timeFactor = getTimeFactor(platform, hour, dayOfWeek);
      this.state.marketCondition.timeFactor = timeFactor;
      this.state.marketCondition.competitionIntensity = competitors.getIntensity();

      // 更新竞争者
      competitors.tick(this.state.marketCondition);

      // 注意：这里需要从外部传入活跃的 campaigns
      // 通过回调让外部处理
    }

    // 实际处理由外部通过 processTick 完成
    return results;
  }

  /**
   * 处理单条计划的单个 tick（由外部 store 调用）
   */
  processCampaignTick(
    campaign: CampaignConfig,
    metrics: CampaignMetrics,
    material: MaterialConfig,
    audience: AudienceConfig,
    industry: IndustryType,
  ): TickResult {
    const platform = campaign.platform;
    const date = new Date(this.state.currentTime);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;

    const timeFactor = getTimeFactor(platform, hour, dayOfWeek);
    const competitors = this.competitorEngines.get(platform)!;
    const intensity = competitors.getIntensity();

    // 估算可触达用户（传入日预算以计算市场份额）
    const reachable = estimateReachableUsers(platform, audience, hour, dayOfWeek, month, campaign.dailyBudget);

    // 抽样虚拟用户
    const sampleCount = Math.min(Math.floor(reachable * 0.01), 10000);
    const sampledUsers = sampleUsers(sampleCount, platform, hour, dayOfWeek, month);

    // 竞价
    const auctionResult = runAuction(
      campaign, metrics, reachable, competitors, intensity,
    );

    // 漏斗
    const funnelResult = runFunnel(
      auctionResult.impressions, campaign, metrics,
      material, audience, industry, sampledUsers,
    );

    // 合并指标
    const currentSimDay = this.getSimDays();
    const newMetrics: CampaignMetrics = {
      impressions: (metrics.impressions || 0) + funnelResult.impressions,
      clicks: (metrics.clicks || 0) + funnelResult.clicks,
      conversions: (metrics.conversions || 0) + funnelResult.conversions,
      spend: (metrics.spend || 0) + funnelResult.spend,
      dailySpend: metrics.lastActiveDay === currentSimDay ? (metrics.dailySpend || 0) + funnelResult.spend : funnelResult.spend,
      lastActiveDay: currentSimDay,
      ctr: 0,
      cvr: 0,
      cpa: 0,
      roi: 0,
      ecpm: auctionResult.yourECPM,
      conversionValue: (metrics.conversionValue || 0) + funnelResult.conversionValue,
      learningStage: funnelResult.learningStage,
      materialFreshness: funnelResult.materialFreshness,
      effectiveCtr: funnelResult.effectiveCTR,
      effectiveCvr: funnelResult.effectiveCVR,
    };

    // 计算累计比率
    newMetrics.ctr = newMetrics.impressions > 0
      ? newMetrics.clicks / newMetrics.impressions : 0;
    newMetrics.cvr = newMetrics.clicks > 0
      ? newMetrics.conversions / newMetrics.clicks : 0;
    newMetrics.cpa = newMetrics.conversions > 0
      ? newMetrics.spend / newMetrics.conversions : 0;
    newMetrics.roi = newMetrics.spend > 0
      ? newMetrics.conversionValue / newMetrics.spend : 0;

    return {
      campaignId: campaign.id,
      platform,
      time: this.state.currentTime,
      funnel: funnelResult,
      auction: auctionResult,
      metrics: newMetrics,
    };
  }

  /** 获取竞争者引擎 */
  getCompetitors(platform: Platform): CompetitorEngine {
    return this.competitorEngines.get(platform)!;
  }

  /** 获取当前市场状况 */
  getMarketCondition(): MarketCondition {
    return { ...this.state.marketCondition };
  }

  /** 获取模拟日期信息 */
  getSimDate(): { hour: number; dayOfWeek: number; month: number; date: Date } {
    const d = new Date(this.state.currentTime);
    return {
      hour: d.getHours(),
      dayOfWeek: d.getDay(),
      month: d.getMonth() + 1,
      date: d,
    };
  }

  /** 获取模拟天数 */
  getSimDays(): number {
    return Math.floor(this.state.tickCount / TICKS_PER_DAY);
  }
}

// 全局单例
let engineInstance: SimulationEngine | null = null;

export function getSimulationEngine(): SimulationEngine {
  if (!engineInstance) {
    engineInstance = new SimulationEngine();
  }
  return engineInstance;
}
