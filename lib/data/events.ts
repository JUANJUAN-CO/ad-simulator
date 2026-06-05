// ============================================================
// 市场事件 — 大促、节假日、行业事件
// ============================================================

import { MarketEvent } from '../engine/types';

export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'event_618',
    name: '618 年中大促',
    type: 'shopping_festival',
    competitionMultiplier: 2.0,
    cpmMultiplier: 1.8,
    trafficMultiplier: 1.5,
    platformAffected: ['douyin', 'xiaohongshu', 'wechat', 'kuaishou'],
    duration: 336, // 14天
  },
  {
    id: 'event_double11',
    name: '双 11 全球狂欢节',
    type: 'shopping_festival',
    competitionMultiplier: 2.5,
    cpmMultiplier: 2.2,
    trafficMultiplier: 2.0,
    platformAffected: ['douyin', 'xiaohongshu', 'wechat', 'kuaishou'],
    duration: 504, // 21天
  },
  {
    id: 'event_double12',
    name: '双 12 年终盛典',
    type: 'shopping_festival',
    competitionMultiplier: 1.6,
    cpmMultiplier: 1.4,
    trafficMultiplier: 1.3,
    platformAffected: ['douyin', 'xiaohongshu', 'wechat', 'kuaishou'],
    duration: 168, // 7天
  },
  {
    id: 'event_spring_festival',
    name: '春节营销季',
    type: 'holiday',
    competitionMultiplier: 1.3,
    cpmMultiplier: 1.5,
    trafficMultiplier: 1.6,
    platformAffected: ['douyin', 'kuaishou', 'wechat'],
    duration: 360, // 15天
  },
  {
    id: 'event_summer',
    name: '暑期流量高峰',
    type: 'industry_peak',
    competitionMultiplier: 1.2,
    cpmMultiplier: 1.1,
    trafficMultiplier: 1.4,
    platformAffected: ['douyin', 'kuaishou'],
    duration: 1440, // 60天
  },
  {
    id: 'event_valentine',
    name: '情人节',
    type: 'holiday',
    competitionMultiplier: 1.8,
    cpmMultiplier: 1.6,
    trafficMultiplier: 1.2,
    platformAffected: ['xiaohongshu', 'douyin'],
    duration: 72, // 3天
  },
  {
    id: 'event_national_day',
    name: '国庆黄金周',
    type: 'holiday',
    competitionMultiplier: 1.4,
    cpmMultiplier: 1.3,
    trafficMultiplier: 1.5,
    platformAffected: ['douyin', 'xiaohongshu', 'wechat', 'kuaishou'],
    duration: 168, // 7天
  },
  {
    id: 'event_competitor_attack',
    name: '竞品突袭投放',
    type: 'crisis',
    competitionMultiplier: 2.0,
    cpmMultiplier: 1.5,
    trafficMultiplier: 1.0,
    platformAffected: ['douyin'],
    duration: 48, // 2天
  },
];

/** 根据模拟月份获取活跃的市场事件 */
export function getActiveEvents(month: number, dayOfMonth: number): MarketEvent[] {
  const events: MarketEvent[] = [];

  // 618 (6月1日-6月18日)
  if (month === 6 && dayOfMonth >= 1 && dayOfMonth <= 18) {
    events.push(MARKET_EVENTS[0]);
  }
  // 双11 (11月1日-11月11日)
  if (month === 11 && dayOfMonth >= 1 && dayOfMonth <= 11) {
    events.push(MARKET_EVENTS[1]);
  }
  // 双12 (12月1日-12月12日)
  if (month === 12 && dayOfMonth >= 1 && dayOfMonth <= 12) {
    events.push(MARKET_EVENTS[2]);
  }
  // 春节 (1月20日-2月5日)
  if ((month === 1 && dayOfMonth >= 20) || (month === 2 && dayOfMonth <= 5)) {
    events.push(MARKET_EVENTS[3]);
  }
  // 暑期 (7-8月)
  if (month === 7 || month === 8) {
    events.push(MARKET_EVENTS[4]);
  }
  // 情人节 (2月12日-2月15日)
  if (month === 2 && dayOfMonth >= 12 && dayOfMonth <= 15) {
    events.push(MARKET_EVENTS[5]);
  }
  // 国庆 (10月1日-10月7日)
  if (month === 10 && dayOfMonth >= 1 && dayOfMonth <= 7) {
    events.push(MARKET_EVENTS[6]);
  }

  return events;
}
