'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { getSimulationEngine } from '@/lib/engine/ticker';
import { getMaterial } from '@/lib/data/materials';
import { getAudience } from '@/lib/data/audiences';
import { getActiveEvents } from '@/lib/data/events';
import { isFatigued } from '@/lib/engine/fatigue';
import { PLATFORMS } from '@/lib/engine/platforms';
import { tryTriggerRandomEvent, ActiveRandomEvent, RandomEvent } from '@/lib/data/random-events';
import { useNotifications } from '@/components/ui/notification';
import { playConversion, playBudgetWarning, playAchievement } from '@/lib/utils/sound';
import { useAchievementStore, ACHIEVEMENTS } from '@/lib/store/achievement-store';
import { saveToLeaderboard } from '@/components/career/leaderboard';

const TICK_MS: Record<number, number> = {
  1: 3000, 5: 600, 20: 150, 50: 60, 100: 30,
};

let lastTickTime = 0;
let lastSimDay = -1;
let tickCounter = 0;
let activeRandomEvents: ActiveRandomEvent[] = [];
let notifiedBudgetExhausted: Set<string> = new Set(); // 已通知日预算耗尽的计划
let notifiedNewDay = false;

export default function SimulationProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number>(0);
  const saveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simSpeed = useGameStore(s => s.simSpeed);
  const isRunning = useGameStore(s => s.isRunning);

  useEffect(() => {
    // rAF 主循环
    const loop = (now: number) => {
      if (isRunning && simSpeed > 0) {
        const interval = TICK_MS[simSpeed] || 3000;
        if (now - lastTickTime >= interval) {
          lastTickTime = now;
          processTick();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, simSpeed]);

  useEffect(() => {
    saveRef.current = setInterval(() => {
      useGameStore.getState().autoSave();
    }, 30000);
    return () => { if (saveRef.current) clearInterval(saveRef.current); };
  }, []);

  return <>{children}</>;
}

/** 处理一个 tick */
function processTick() {
  const gameState = useGameStore.getState();
  useGameStore.getState().advanceTime(1);
  const currentSimDay = useGameStore.getState().simDays;

  // ✅ Bug1修复: 用游戏内的模拟时间，不用真实时间
  const simDate = new Date(gameState.currentTime);
  const hour = simDate.getHours();
  const dayOfWeek = simDate.getDay();
  const month = simDate.getMonth() + 1;
  const dayOfMonth = simDate.getDate();

  const campaignState = useCampaignStore.getState();
  const allCampaigns = campaignState.campaigns;
  const activeCampaigns = allCampaigns.filter(c => c.status === 'active');

  // 跨天检测 → 保存昨日快照 + 重置日预算 + 发送通知
  if (currentSimDay !== lastSimDay) {
    // 先保存昨日快照（所有有数据的计划）
    for (const c of allCampaigns) {
      const m = campaignState.metrics[c.id];
      if (m && m.dailySpend > 0) {
        useCampaignStore.getState().snapshotDailyMetrics(c.id, lastSimDay >= 0 ? lastSimDay : 0);
      }
    }
    lastSimDay = currentSimDay;
    for (const c of allCampaigns) {
      const m = campaignState.metrics[c.id];
      if (m) {
        useCampaignStore.getState().updateMetrics(c.id, {
          ...m, dailySpend: 0, lastActiveDay: currentSimDay,
        });
      }
    }
    // 清零通知状态
    notifiedBudgetExhausted = new Set();
    notifiedNewDay = false;
  }

  if (activeCampaigns.length === 0) return;

  tickCounter++;

  // 随机事件：每小时(6 tick)尝试触发
  if (tickCounter % 6 === 0) {
    const gameState2 = useGameStore.getState();
    const newEvent = tryTriggerRandomEvent(gameState2.careerStage, activeRandomEvents);
    if (newEvent) {
      activeRandomEvents.push({ event: newEvent, startedAt: tickCounter, remainingTicks: newEvent.durationTicks });
      // 保存到 store 用于 UI 显示
      useGameStore.getState().setState({ activeRandomEvent: newEvent });
      // 发送通知
      try {
        useNotifications.getState().push({
          type: newEvent.type === 'positive' ? 'event' : newEvent.type === 'negative' ? 'error' : 'info',
          title: newEvent.notification,
          message: newEvent.description + `，持续 ${Math.floor(newEvent.durationTicks / 6)} 小时。`,
          icon: newEvent.icon,
          duration: 8000,
        });
      } catch (_) {}
    }
  }

  // 更新活跃事件：减计时 + 清理已过期
  activeRandomEvents = activeRandomEvents.filter(e => {
    e.remainingTicks--;
    return e.remainingTicks > 0;
  });
  if (activeRandomEvents.length === 0) {
    useGameStore.getState().setState({ activeRandomEvent: null });
  }

  // 计算事件乘数（叠加）
  let eventTrafficMul = 1.0, eventCtrMul = 1.0, eventCvrMul = 1.0, eventCpmMul = 1.0;
  for (const ae of activeRandomEvents) {
    eventTrafficMul *= ae.event.trafficMultiplier;
    eventCtrMul *= ae.event.ctrMultiplier;
    eventCvrMul *= ae.event.cvrMultiplier;
    eventCpmMul *= ae.event.cpmMultiplier;
  }

  const engine = getSimulationEngine();

  // ✅ Bug3修复: 检测并应用市场事件
  const activeEvents = getActiveEvents(month, dayOfMonth);
  let eventMultiplier = 1.0;
  if (activeEvents.length > 0) {
    // 叠加所有活跃事件的竞争因子
    eventMultiplier = activeEvents.reduce((m, e) => m * e.competitionMultiplier, 1.0);
    // 更新引擎的市场状态
    engine.setState({
      marketCondition: {
        competitionIntensity: Math.min(1, 0.3 + activeEvents.length * 0.2),
        timeFactor: 0.5, dayOfWeek, seasonFactor: 1.0 + activeEvents.length * 0.2,
        activeEvent: activeEvents[0],
      },
    });
  }

  // ✅ Bug2修复: 每个 tick 更新竞争者行为
  for (const [platformId] of Object.entries(PLATFORMS)) {
    const comp = engine.getCompetitors(platformId);
    comp.tick(engine.getMarketCondition());
  }

  for (const campaign of activeCampaigns) {
    const metrics = campaignState.metrics[campaign.id];
    if (!metrics) continue;

    // 总预算耗尽 → 结束计划
    if (metrics.spend >= campaign.totalBudget) {
      useCampaignStore.getState().endCampaign(campaign.id);
      continue;
    }

    // 日预算剩余不足 ¥2 → 跳过（避免卡在 298/299）
    if (campaign.dailyBudget - metrics.dailySpend < 2) continue;

    const material = getMaterial(campaign.materialId);
    const audience = getAudience(campaign.audience);
    if (!material || !audience) continue;

    // 应用市场事件 + 随机事件乘数
    const boostedBidPrice = campaign.bidPrice * eventMultiplier * eventCpmMul;

    const result = engine.processCampaignTick(
      { ...campaign, bidPrice: boostedBidPrice } as any,
      metrics, material, audience, material.industry,
    );

    // 应用随机事件的流量/CTR/CVR乘数
    result.funnel.impressions = Math.floor(result.funnel.impressions * eventTrafficMul);
    result.funnel.clicks = Math.floor(result.funnel.clicks * eventCtrMul);
    result.funnel.conversions = Math.floor(result.funnel.conversions * eventCvrMul);
    result.funnel.effectiveCTR *= eventCtrMul;
    result.funnel.effectiveCVR *= eventCvrMul;

    // 预算约束
    const remainingDaily = campaign.dailyBudget - metrics.dailySpend;
    let imp = result.funnel.impressions;
    let clk = result.funnel.clicks;
    let cnv = result.funnel.conversions;
    let spd = result.funnel.spend;
    let val = result.funnel.conversionValue;

    if (spd > remainingDaily) {
      spd = remainingDaily;
      const scale = remainingDaily / Math.max(result.funnel.spend, 0.001);
      imp = Math.floor(result.funnel.impressions * scale);
      clk = Math.floor(result.funnel.clicks * scale);
      cnv = Math.floor(result.funnel.conversions * scale);
      val = cnv > 0 ? result.funnel.conversionValue * (cnv / Math.max(result.funnel.conversions, 1)) : 0;
    }

    const totalImp = (metrics.impressions || 0) + imp;

    // ✅ Bug4修复: 检测素材疲劳
    let learningStage = result.funnel.learningStage;
    if (isFatigued(material, totalImp)) {
      learningStage = 'fatigue';
    }

    const nm = {
      impressions: totalImp,
      clicks: (metrics.clicks || 0) + clk,
      conversions: (metrics.conversions || 0) + cnv,
      spend: (metrics.spend || 0) + spd,
      dailySpend: (metrics.dailySpend || 0) + spd,
      lastActiveDay: currentSimDay,
      conversionValue: (metrics.conversionValue || 0) + val,
      ecpm: result.auction.yourECPM,
      learningStage: learningStage as any,
      materialFreshness: result.funnel.materialFreshness,
      effectiveCtr: result.funnel.effectiveCTR,
      effectiveCvr: result.funnel.effectiveCVR,
      ctr: 0, cvr: 0, cpa: 0, roi: 0,
    };

    nm.ctr = nm.impressions > 0 ? nm.clicks / nm.impressions : 0;
    nm.cvr = nm.clicks > 0 ? nm.conversions / nm.clicks : 0;
    nm.cpa = nm.conversions > 0 ? nm.spend / nm.conversions : 0;
    nm.roi = nm.spend > 0 ? nm.conversionValue / nm.spend : 0;

    useCampaignStore.getState().updateMetrics(campaign.id, nm);

    // 🔊 音效: 每隔一定时间有转化时播放
    if (cnv > 0 && tickCounter % 12 === 0) {
      try { playConversion(); } catch (_) {}
    }

    // 🔔 通知: 日预算耗尽
    if (!notifiedBudgetExhausted.has(campaign.id) && nm.dailySpend >= campaign.dailyBudget - 1) {
      notifiedBudgetExhausted.add(campaign.id);
      try { playBudgetWarning(); } catch (_) {}
      try {
        useNotifications.getState().push({
          type: 'warning',
          title: '⏳ 日预算已用完',
          message: `「${campaign.name}」今日预算 ¥${campaign.dailyBudget} 已花完，明天 0 点自动恢复。`,
          icon: '⏳',
          duration: 6000,
          action: {
            label: '查看详情',
            onClick: () => { /* 跳转到详情页由页面层处理 */ },
          },
        });
      } catch (_) {}
    }

    // 🔔 通知: 素材疲劳警告
    if (nm.learningStage === 'fatigue' && metrics.learningStage !== 'fatigue') {
      try {
        useNotifications.getState().push({
          type: 'error',
          title: '😴 素材疲劳',
          message: `「${campaign.name}」的素材已进入疲劳期，CTR 大幅衰减。建议更换素材。`,
          icon: '😴',
          duration: 8000,
        });
      } catch (_) {}
    }

    // 🔔 通知: 总预算即将耗尽（剩余 < 20%）
    if (nm.spend >= campaign.totalBudget * 0.8 && (metrics.spend || 0) < campaign.totalBudget * 0.8) {
      try {
        useNotifications.getState().push({
          type: 'warning',
          title: '⚠️ 总预算即将耗尽',
          message: `「${campaign.name}」总预算已消耗 80%（¥${nm.spend.toFixed(0)} / ¥${campaign.totalBudget}），请考虑追加。`,
          icon: '⚠️',
          duration: 6000,
        });
      } catch (_) {}
    }
  }

  // 🏅 每 72 tick 检查成就
  if (tickCounter % 72 === 0) {
    try {
      const gameState = useGameStore.getState();
      const campaignState = useCampaignStore.getState();
      const metrics = campaignState.metrics;
      const campaigns = campaignState.campaigns;

      const totalSpend = campaigns.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0);
      const totalConv = campaigns.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0);
      const totalImp = campaigns.reduce((s, c) => s + (metrics[c.id]?.impressions || 0), 0);
      const bestROI = campaigns.reduce((best, c) => Math.max(best, metrics[c.id]?.roi || 0), 0);
      const bestCPA = campaigns.reduce((best, c) => {
        const cpa = metrics[c.id]?.cpa || 0;
        return cpa > 0 && cpa < best ? cpa : best;
      }, Infinity);
      const activeCount = campaigns.filter(c => c.status === 'active').length;

      const newly = useAchievementStore.getState().checkAndUnlock({
        totalSpend,
        totalConversions: totalConv,
        totalImpressions: totalImp,
        bestROI,
        bestCPA: bestCPA === Infinity ? 0 : bestCPA,
        campaignsCreated: gameState.stats.campaignsCreated,
        missionsCompleted: gameState.stats.missionsCompleted,
        daysPlayed: gameState.simDays,
        platformCount: new Set(campaigns.map(c => c.platform)).size,
        careerStage: gameState.careerStage,
        maxActivePlans: activeCount,
      });

      if (newly.length > 0) {
        try { playAchievement(); } catch (_) {}
        const ach = ACHIEVEMENTS.filter(a => newly.includes(a.id));
        for (const a of ach) {
          useNotifications.getState().push({
            type: 'success',
            title: `🏅 成就解锁: ${a.name}`,
            message: a.description + (a.reward ? ` 获得称号: ${a.reward}` : ''),
            icon: a.icon,
            duration: 5000,
          });
        }
      }

      // 自动上榜
      saveToLeaderboard();
    } catch (_) {}
  }
}
