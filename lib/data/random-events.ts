// ============================================================
// 随机投放事件 — 爆款、竞品突袭、平台故障等
// ============================================================

import { Platform } from '../engine/types';

export interface RandomEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  // 对模拟的影响乘数
  trafficMultiplier: number;   // 流量倍率
  ctrMultiplier: number;       // 点击率倍率
  cvrMultiplier: number;       // 转化率倍率
  cpmMultiplier: number;       // CPM倍率
  durationTicks: number;       // 持续 tick 数
  probability: number;         // 每小时触发概率 (0-1)
  minStage: number;            // 最低阶段
  platforms: Platform[];       // 影响的平台（空=全部）
  notification: string;        // 通知文案
}

export const RANDOM_EVENTS: RandomEvent[] = [
  // ===== 正面事件 =====
  {
    id: 'viral_hit',
    name: '🔥 爆款出圈',
    icon: '🔥',
    description: '你的素材突然火了！被大量用户自发转发',
    type: 'positive',
    trafficMultiplier: 3.0, ctrMultiplier: 1.5, cvrMultiplier: 1.2, cpmMultiplier: 0.8,
    durationTicks: 36, // 6小时
    probability: 0.03, minStage: 1, platforms: [],
    notification: '🔥 爆款出圈！你的广告素材正在被疯狂传播，流量暴涨3倍！',
  },
  {
    id: 'kol_boost',
    name: '⭐ KOL自发带货',
    icon: '⭐',
    description: '某大V无意中提到你的产品，引发粉丝跟风',
    type: 'positive',
    trafficMultiplier: 5.0, ctrMultiplier: 1.3, cvrMultiplier: 1.5, cpmMultiplier: 1.2,
    durationTicks: 24, // 4小时
    probability: 0.02, minStage: 2, platforms: [],
    notification: '⭐ 大V自发带货！粉丝蜂拥而至，转化率飙升50%！',
  },
  {
    id: 'platform_recommend',
    name: '🎯 平台优质推荐',
    icon: '🎯',
    description: '你的广告被平台算法标记为优质内容，获得额外流量倾斜',
    type: 'positive',
    trafficMultiplier: 2.0, ctrMultiplier: 1.2, cvrMultiplier: 1.1, cpmMultiplier: 0.7,
    durationTicks: 48, // 8小时
    probability: 0.04, minStage: 1, platforms: [],
    notification: '🎯 平台算法推荐！你的计划获得流量倾斜，CPM降低30%！',
  },
  {
    id: 'holiday_boost',
    name: '🎉 节日流量红利',
    icon: '🎉',
    description: '节假日用户活跃度大增，流量池扩大',
    type: 'positive',
    trafficMultiplier: 1.8, ctrMultiplier: 1.1, cvrMultiplier: 1.1, cpmMultiplier: 1.0,
    durationTicks: 72, // 12小时
    probability: 0.04, minStage: 1, platforms: [],
    notification: '🎉 节日流量红利！用户活跃度大增，流量池扩大80%！',
  },
  {
    id: 'low_competition',
    name: '🏖 竞品撤资',
    icon: '🏖',
    description: '主要竞品暂停投放，竞争大幅下降',
    type: 'positive',
    trafficMultiplier: 1.5, ctrMultiplier: 1.0, cvrMultiplier: 1.0, cpmMultiplier: 0.5,
    durationTicks: 48, // 8小时
    probability: 0.03, minStage: 2, platforms: [],
    notification: '🏖 竞品撤资！市场竞争大幅下降，CPM腰斩，赶紧抢量！',
  },

  // ===== 负面事件 =====
  {
    id: 'competitor_raid',
    name: '⚔️ 竞品突袭',
    icon: '⚔️',
    description: '竞品突然加大投放力度，疯狂抢量',
    type: 'negative',
    trafficMultiplier: 0.6, ctrMultiplier: 0.9, cvrMultiplier: 1.0, cpmMultiplier: 2.0,
    durationTicks: 36, // 6小时
    probability: 0.04, minStage: 1, platforms: [],
    notification: '⚔️ 竞品突袭！竞争对手疯狂加价抢量，CPM翻倍！',
  },
  {
    id: 'platform_outage',
    name: '🔧 平台故障',
    icon: '🔧',
    description: '广告系统出现技术故障，投放受限',
    type: 'negative',
    trafficMultiplier: 0.3, ctrMultiplier: 1.0, cvrMultiplier: 1.0, cpmMultiplier: 1.0,
    durationTicks: 18, // 3小时
    probability: 0.02, minStage: 2, platforms: [],
    notification: '🔧 平台投放系统故障！流量暴跌70%，预计3小时后恢复。',
  },
  {
    id: 'negative_pr',
    name: '📉 负面舆情',
    icon: '📉',
    description: '品牌出现负面新闻，用户信任度下降',
    type: 'negative',
    trafficMultiplier: 1.0, ctrMultiplier: 0.7, cvrMultiplier: 0.5, cpmMultiplier: 1.0,
    durationTicks: 48, // 8小时
    probability: 0.02, minStage: 2, platforms: [],
    notification: '📉 负面舆情！用户信任度下降，转化率暴跌50%。考虑暂停投放。',
  },
  {
    id: 'ad_fatigue',
    name: '😴 用户疲劳',
    icon: '😴',
    description: '用户对同类广告产生疲劳，点击意愿下降',
    type: 'negative',
    trafficMultiplier: 1.0, ctrMultiplier: 0.6, cvrMultiplier: 0.8, cpmMultiplier: 1.1,
    durationTicks: 60, // 10小时
    probability: 0.05, minStage: 1, platforms: [],
    notification: '😴 用户广告疲劳！点击率下降40%，试试换新素材或新人群。',
  },
  {
    id: 'budget_warning',
    name: '⚠️ 系统限投',
    icon: '⚠️',
    description: '账户被系统标记为异常，暂时限制投放量',
    type: 'negative',
    trafficMultiplier: 0.5, ctrMultiplier: 1.0, cvrMultiplier: 1.0, cpmMultiplier: 1.3,
    durationTicks: 24, // 4小时
    probability: 0.02, minStage: 3, platforms: [],
    notification: '⚠️ 系统限投！账户被临时限制，4小时后自动解除。',
  },

  // ===== 中性事件 =====
  {
    id: 'weather_rain',
    name: '🌧 天气影响',
    icon: '🌧',
    description: '恶劣天气导致用户宅家刷手机，在线时长增加但消费意愿下降',
    type: 'neutral',
    trafficMultiplier: 1.3, ctrMultiplier: 1.1, cvrMultiplier: 0.8, cpmMultiplier: 0.9,
    durationTicks: 36, // 6小时
    probability: 0.05, minStage: 1, platforms: [],
    notification: '🌧 天气变化！用户在线时长增加，流量上涨但消费意愿略降。',
  },
  {
    id: 'platform_update',
    name: '🔄 算法更新',
    icon: '🔄',
    description: '平台更新了推荐算法，投放模型需要重新学习',
    type: 'neutral',
    trafficMultiplier: 0.8, ctrMultiplier: 0.9, cvrMultiplier: 0.9, cpmMultiplier: 1.1,
    durationTicks: 30, // 5小时
    probability: 0.03, minStage: 2, platforms: [],
    notification: '🔄 平台算法更新！模型需要重新学习，短期数据可能有波动。',
  },
];

/** 当前活跃的随机事件 */
export interface ActiveRandomEvent {
  event: RandomEvent;
  startedAt: number;   // 开始的 tick
  remainingTicks: number;
}

/** 尝试触发随机事件（每小时调用一次，即每6 tick） */
export function tryTriggerRandomEvent(
  currentStage: number,
  activeEvents: ActiveRandomEvent[],
): RandomEvent | null {
  // 最多同时 2 个事件
  if (activeEvents.length >= 2) return null;

  const available = RANDOM_EVENTS.filter(e =>
    e.minStage <= currentStage &&
    !activeEvents.some(a => a.event.id === e.id)
  );

  for (const event of available) {
    if (Math.random() < event.probability) {
      return event;
    }
  }

  return null;
}
