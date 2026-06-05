// ============================================================
// 平台配置 — 12 个真实中国广告投放平台
// ============================================================

import { PlatformConfig, Platform, AdType } from './types';

export const PLATFORMS: Record<string, PlatformConfig> = {

  // ==================== 巨量引擎体系 ====================

  'douyin_feed': {
    id: 'douyin_feed',
    name: '抖音信息流',
    group: '巨量引擎',
    groupIcon: '🎵',
    mau: 750,
    femaleRatio: 0.48,
    coreAge: [18, 35],
    cityTiers: [1, 2, 3, 4, 5],
    avgCPM: 15,
    avgCPC: 0.5,
    avgCTR: 0.028,
    avgCVR: 0.025,
    peakHours: [[19, 22]],
    offPeakHours: [[2, 6]],
    conversionWindow: 1,
    learningThreshold: 50,
    contentTone: '短视频/娱乐化/快节奏/强视觉冲击',
    adTypes: ['feed_video', 'feed_live'],
    availableInStage: 1,
    industryFit: { ecommerce: 85, beauty: 90, food: 80, education: 70, gaming: 95, local_services: 75 },
  },

  'douyin_search': {
    id: 'douyin_search',
    name: '抖音搜索广告',
    group: '巨量引擎',
    groupIcon: '🎵',
    mau: 300,
    femaleRatio: 0.50,
    coreAge: [20, 40],
    cityTiers: [1, 2, 3],
    avgCPM: 22,
    avgCPC: 0.8,
    avgCTR: 0.035,
    avgCVR: 0.040,
    peakHours: [[8, 10], [19, 22]],
    offPeakHours: [[2, 6]],
    conversionWindow: 1,
    learningThreshold: 40,
    contentTone: '搜索意图/精准匹配/高转化意向',
    adTypes: ['search'],
    availableInStage: 1,
    industryFit: { education: 90, finance: 85, home: 80, health: 85, travel: 80 },
  },

  'qianchuan': {
    id: 'qianchuan',
    name: '巨量千川',
    group: '巨量引擎',
    groupIcon: '🎵',
    mau: 300,
    femaleRatio: 0.55,
    coreAge: [20, 40],
    cityTiers: [1, 2, 3, 4],
    avgCPM: 18,
    avgCPC: 0.6,
    avgCTR: 0.030,
    avgCVR: 0.035,
    peakHours: [[19, 23]],
    offPeakHours: [[3, 7]],
    conversionWindow: 1,
    learningThreshold: 35,
    contentTone: '直播带货/短视频带货/商品卡/电商专属',
    adTypes: ['feed_video', 'feed_live', 'product_card'],
    availableInStage: 1,
    industryFit: { ecommerce: 100, beauty: 95, food: 90, home: 70 },
  },

  // ==================== 腾讯广告体系 ====================

  'wechat_moments': {
    id: 'wechat_moments',
    name: '微信朋友圈广告',
    group: '腾讯广告',
    groupIcon: '💬',
    mau: 900,
    femaleRatio: 0.48,
    coreAge: [25, 45],
    cityTiers: [1, 2, 3, 4],
    avgCPM: 25,
    avgCPC: 0.7,
    avgCTR: 0.022,
    avgCVR: 0.030,
    peakHours: [[8, 10], [12, 14], [19, 21]],
    offPeakHours: [[1, 5]],
    conversionWindow: 3,
    learningThreshold: 45,
    contentTone: '社交原生/信任感/品牌调性/评论互动',
    adTypes: ['feed_image', 'feed_video', 'feed_carousel'],
    availableInStage: 1,
    industryFit: { finance: 90, education: 85, home: 85, travel: 80, beauty: 70 },
  },

  'wechat_oa': {
    id: 'wechat_oa',
    name: '公众号广告',
    group: '腾讯广告',
    groupIcon: '💬',
    mau: 400,
    femaleRatio: 0.45,
    coreAge: [28, 50],
    cityTiers: [1, 2, 3],
    avgCPM: 20,
    avgCPC: 0.6,
    avgCTR: 0.018,
    avgCVR: 0.035,
    peakHours: [[8, 9], [12, 13], [20, 22]],
    offPeakHours: [[1, 5]],
    conversionWindow: 3,
    learningThreshold: 40,
    contentTone: '深度阅读/知识型/长图文/专业形象',
    adTypes: ['feed_image', 'feed_article'],
    availableInStage: 1,
    industryFit: { education: 95, finance: 90, health: 85, travel: 75 },
  },

  'wechat_channels': {
    id: 'wechat_channels',
    name: '视频号广告',
    group: '腾讯广告',
    groupIcon: '💬',
    mau: 500,
    femaleRatio: 0.50,
    coreAge: [25, 45],
    cityTiers: [1, 2, 3, 4],
    avgCPM: 22,
    avgCPC: 0.55,
    avgCTR: 0.025,
    avgCVR: 0.028,
    peakHours: [[19, 22]],
    offPeakHours: [[2, 6]],
    conversionWindow: 3,
    learningThreshold: 40,
    contentTone: '视频社交/朋友推荐/品牌故事',
    adTypes: ['feed_video', 'feed_live'],
    availableInStage: 2,
    industryFit: { ecommerce: 75, beauty: 80, education: 80, travel: 85, food: 70 },
  },

  // ==================== 小红书 ====================

  'xiaohongshu_feed': {
    id: 'xiaohongshu_feed',
    name: '小红书信息流',
    group: '小红书',
    groupIcon: '📕',
    mau: 260,
    femaleRatio: 0.75,
    coreAge: [22, 38],
    cityTiers: [1, 2, 3],
    avgCPM: 28,
    avgCPC: 0.9,
    avgCTR: 0.035,
    avgCVR: 0.040,
    peakHours: [[12, 14], [20, 22], [22, 24]],
    offPeakHours: [[2, 6]],
    conversionWindow: 7,
    learningThreshold: 30,
    contentTone: '种草/精致/真实感/生活方式/高审美',
    adTypes: ['feed_image', 'feed_video', 'feed_carousel'],
    availableInStage: 1,
    industryFit: { beauty: 100, travel: 90, food: 85, home: 80, ecommerce: 75, health: 80 },
  },

  'xiaohongshu_search': {
    id: 'xiaohongshu_search',
    name: '小红书搜索广告',
    group: '小红书',
    groupIcon: '📕',
    mau: 150,
    femaleRatio: 0.78,
    coreAge: [22, 38],
    cityTiers: [1, 2],
    avgCPM: 35,
    avgCPC: 1.2,
    avgCTR: 0.045,
    avgCVR: 0.055,
    peakHours: [[12, 14], [20, 23]],
    offPeakHours: [[2, 6]],
    conversionWindow: 7,
    learningThreshold: 25,
    contentTone: '搜索意图/精准决策/深度种草转化',
    adTypes: ['search'],
    availableInStage: 2,
    industryFit: { beauty: 100, travel: 90, health: 85, home: 85, education: 75 },
  },

  // ==================== 快手 ====================

  'kuaishou_feed': {
    id: 'kuaishou_feed',
    name: '快手信息流',
    group: '快手',
    groupIcon: '🎬',
    mau: 380,
    femaleRatio: 0.42,
    coreAge: [18, 35],
    cityTiers: [3, 4, 5],
    avgCPM: 10,
    avgCPC: 0.3,
    avgCTR: 0.032,
    avgCVR: 0.028,
    peakHours: [[18, 22]],
    offPeakHours: [[2, 5]],
    conversionWindow: 1,
    learningThreshold: 35,
    contentTone: '接地气/真实/老铁文化/高互动/信任感',
    adTypes: ['feed_video', 'feed_live'],
    availableInStage: 1,
    industryFit: { ecommerce: 85, food: 90, gaming: 80, local_services: 85, beauty: 65 },
  },

  'kuaishou_live': {
    id: 'kuaishou_live',
    name: '快手直播推广',
    group: '快手',
    groupIcon: '🎬',
    mau: 200,
    femaleRatio: 0.45,
    coreAge: [20, 40],
    cityTiers: [3, 4, 5],
    avgCPM: 8,
    avgCPC: 0.25,
    avgCTR: 0.035,
    avgCVR: 0.032,
    peakHours: [[19, 23]],
    offPeakHours: [[3, 7]],
    conversionWindow: 1,
    learningThreshold: 30,
    contentTone: '直播带货/主播信任/价格驱动/秒杀氛围',
    adTypes: ['feed_live'],
    availableInStage: 2,
    industryFit: { ecommerce: 95, food: 90, beauty: 70, local_services: 80 },
  },

  // ==================== 百度 ====================

  'baidu_search': {
    id: 'baidu_search',
    name: '百度搜索推广',
    group: '百度营销',
    groupIcon: '🔍',
    mau: 600,
    femaleRatio: 0.42,
    coreAge: [25, 50],
    cityTiers: [1, 2, 3, 4],
    avgCPM: 20,
    avgCPC: 1.0,
    avgCTR: 0.030,
    avgCVR: 0.040,
    peakHours: [[8, 11], [14, 17]],
    offPeakHours: [[0, 5]],
    conversionWindow: 3,
    learningThreshold: 40,
    contentTone: '搜索意图/关键词竞价/精准需求/效果导向',
    adTypes: ['search'],
    availableInStage: 2,
    industryFit: { education: 95, finance: 90, health: 85, home: 80, travel: 75 },
  },

  'baidu_feed': {
    id: 'baidu_feed',
    name: '百度信息流',
    group: '百度营销',
    groupIcon: '🔍',
    mau: 400,
    femaleRatio: 0.40,
    coreAge: [25, 50],
    cityTiers: [1, 2, 3, 4],
    avgCPM: 14,
    avgCPC: 0.5,
    avgCTR: 0.022,
    avgCVR: 0.025,
    peakHours: [[8, 10], [19, 22]],
    offPeakHours: [[1, 5]],
    conversionWindow: 3,
    learningThreshold: 45,
    contentTone: '内容推荐/资讯流/知识型/精准定向',
    adTypes: ['feed_image', 'feed_video'],
    availableInStage: 2,
    industryFit: { education: 85, finance: 80, health: 80, home: 75 },
  },

  // ==================== 微博 ====================

  'weibo_feed': {
    id: 'weibo_feed',
    name: '微博粉丝通',
    group: '微博',
    groupIcon: '🐦',
    mau: 250,
    femaleRatio: 0.52,
    coreAge: [18, 35],
    cityTiers: [1, 2, 3],
    avgCPM: 18,
    avgCPC: 0.55,
    avgCTR: 0.020,
    avgCVR: 0.018,
    peakHours: [[8, 10], [12, 14], [20, 23]],
    offPeakHours: [[2, 5]],
    conversionWindow: 1,
    learningThreshold: 45,
    contentTone: '热点话题/明星效应/粉丝互动/娱乐化',
    adTypes: ['feed_image', 'feed_video', 'feed_carousel'],
    availableInStage: 2,
    industryFit: { beauty: 80, ecommerce: 70, gaming: 75, food: 65, travel: 70 },
  },

  // ==================== B站 ====================

  'bilibili_feed': {
    id: 'bilibili_feed',
    name: 'B站信息流',
    group: '哔哩哔哩',
    groupIcon: '📺',
    mau: 180,
    femaleRatio: 0.38,
    coreAge: [15, 30],
    cityTiers: [1, 2, 3],
    avgCPM: 20,
    avgCPC: 0.6,
    avgCTR: 0.025,
    avgCVR: 0.020,
    peakHours: [[12, 14], [19, 23]],
    offPeakHours: [[2, 6]],
    conversionWindow: 3,
    learningThreshold: 35,
    contentTone: '二次元/知识区/弹幕文化/年轻化/创意优先',
    adTypes: ['feed_video'],
    availableInStage: 3,
    industryFit: { gaming: 100, education: 85, ecommerce: 55, beauty: 60 },
  },

  // ==================== 知乎 ====================

  'zhihu_feed': {
    id: 'zhihu_feed',
    name: '知乎知+',
    group: '知乎',
    groupIcon: '📖',
    mau: 120,
    femaleRatio: 0.45,
    coreAge: [25, 40],
    cityTiers: [1, 2],
    avgCPM: 25,
    avgCPC: 1.0,
    avgCTR: 0.025,
    avgCVR: 0.045,
    peakHours: [[8, 10], [12, 14], [20, 23]],
    offPeakHours: [[1, 5]],
    conversionWindow: 7,
    learningThreshold: 35,
    contentTone: '问答形式/深度内容/理性决策/高知人群',
    adTypes: ['feed_article', 'feed_image'],
    availableInStage: 3,
    industryFit: { education: 100, finance: 95, health: 85, travel: 75, home: 70 },
  },

  // ==================== 小红书补充 ====================

  'xiaohongshu_live': {
    id: 'xiaohongshu_live',
    name: '小红书直播推广',
    group: '小红书',
    groupIcon: '📕',
    mau: 120,
    femaleRatio: 0.80,
    coreAge: [22, 35],
    cityTiers: [1, 2],
    avgCPM: 32,
    avgCPC: 1.0,
    avgCTR: 0.038,
    avgCVR: 0.045,
    peakHours: [[20, 23]],
    offPeakHours: [[2, 7]],
    conversionWindow: 7,
    learningThreshold: 25,
    contentTone: '直播种草/实时互动/限时优惠/信任转化',
    adTypes: ['feed_live'],
    availableInStage: 2,
    industryFit: { beauty: 100, ecommerce: 85, food: 80, health: 75, travel: 70 },
  },

  // ==================== 快手补充 ====================

  'kuaishou_ecom': {
    id: 'kuaishou_ecom',
    name: '快手磁力金牛',
    group: '快手',
    groupIcon: '🎬',
    mau: 200,
    femaleRatio: 0.48,
    coreAge: [25, 45],
    cityTiers: [3, 4, 5],
    avgCPM: 8,
    avgCPC: 0.25,
    avgCTR: 0.035,
    avgCVR: 0.035,
    peakHours: [[19, 23]],
    offPeakHours: [[3, 7]],
    conversionWindow: 1,
    learningThreshold: 30,
    contentTone: '直播电商/信任经济/性价比驱动/老铁带货',
    adTypes: ['feed_live', 'product_card'],
    availableInStage: 2,
    industryFit: { ecommerce: 95, food: 90, beauty: 65, local_services: 85, home: 60 },
  },

  // ==================== 海外平台 ====================

  'tiktok_feed': {
    id: 'tiktok_feed',
    name: 'TikTok信息流',
    group: 'TikTok',
    groupIcon: '🌍',
    mau: 1500,
    femaleRatio: 0.50,
    coreAge: [16, 34],
    cityTiers: [1, 2, 3, 4, 5],
    avgCPM: 30,
    avgCPC: 0.8,
    avgCTR: 0.025,
    avgCVR: 0.020,
    peakHours: [[19, 23]],
    offPeakHours: [[2, 5]],
    conversionWindow: 1,
    learningThreshold: 50,
    contentTone: '全球化/短视频/创意驱动/年轻化/多语言',
    adTypes: ['feed_video'],
    availableInStage: 3,
    industryFit: { ecommerce: 85, gaming: 90, beauty: 80, food: 60, travel: 75 },
  },

  'tiktok_spark': {
    id: 'tiktok_spark',
    name: 'TikTok Spark Ads',
    group: 'TikTok',
    groupIcon: '🌍',
    mau: 800,
    femaleRatio: 0.52,
    coreAge: [16, 30],
    cityTiers: [1, 2, 3],
    avgCPM: 35,
    avgCPC: 0.9,
    avgCTR: 0.030,
    avgCVR: 0.025,
    peakHours: [[18, 23]],
    offPeakHours: [[2, 5]],
    conversionWindow: 1,
    learningThreshold: 45,
    contentTone: '达人合作/原生内容/信任背书/品牌种草',
    adTypes: ['feed_video', 'feed_live'],
    availableInStage: 3,
    industryFit: { ecommerce: 90, beauty: 85, gaming: 85, food: 65, travel: 80 },
  },

  'facebook_ads': {
    id: 'facebook_ads',
    name: 'Facebook/Instagram广告',
    group: 'Meta',
    groupIcon: '📱',
    mau: 2900,
    femaleRatio: 0.50,
    coreAge: [25, 55],
    cityTiers: [1, 2, 3, 4, 5],
    avgCPM: 25,
    avgCPC: 0.7,
    avgCTR: 0.020,
    avgCVR: 0.022,
    peakHours: [[12, 14], [19, 22]],
    offPeakHours: [[1, 5]],
    conversionWindow: 7,
    learningThreshold: 50,
    contentTone: '社交原生/精准定向/再营销/多版位',
    adTypes: ['feed_image', 'feed_video', 'feed_carousel'],
    availableInStage: 3,
    industryFit: { ecommerce: 85, education: 80, finance: 75, travel: 80, gaming: 75 },
  },

  // ==================== 电商平台广告 ====================

  'pinduoduo_ads': {
    id: 'pinduoduo_ads',
    name: '拼多多推广',
    group: '拼多多',
    groupIcon: '🛒',
    mau: 700,
    femaleRatio: 0.60,
    coreAge: [25, 50],
    cityTiers: [3, 4, 5],
    avgCPM: 6,
    avgCPC: 0.15,
    avgCTR: 0.040,
    avgCVR: 0.045,
    peakHours: [[10, 12], [14, 16], [20, 22]],
    offPeakHours: [[1, 5]],
    conversionWindow: 1,
    learningThreshold: 20,
    contentTone: '价格驱动/拼团模式/社交裂变/极致性价比',
    adTypes: ['product_card', 'search'],
    availableInStage: 2,
    industryFit: { ecommerce: 100, food: 95, home: 80, beauty: 70, health: 65 },
  },

  'jd_ads': {
    id: 'jd_ads',
    name: '京东京准通',
    group: '京东',
    groupIcon: '📦',
    mau: 400,
    femaleRatio: 0.40,
    coreAge: [25, 45],
    cityTiers: [1, 2, 3],
    avgCPM: 12,
    avgCPC: 0.5,
    avgCTR: 0.025,
    avgCVR: 0.040,
    peakHours: [[10, 12], [14, 16], [20, 22]],
    offPeakHours: [[1, 5]],
    conversionWindow: 3,
    learningThreshold: 30,
    contentTone: '品质电商/正品信任/物流体验/品牌旗舰店',
    adTypes: ['product_card', 'search'],
    availableInStage: 2,
    industryFit: { ecommerce: 95, home: 90, health: 80, beauty: 75, travel: 50 },
  },
};

/** 获取时段因子 */
export function getTimeFactor(platformId: string, hour: number, dayOfWeek: number): number {
  const platform = PLATFORMS[platformId];
  if (!platform) return 0.5;

  const isPeak = platform.peakHours.some(([s, e]) => hour >= s && hour < e);
  const isOffPeak = platform.offPeakHours.some(([s, e]) => hour >= s && hour < e);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isOffPeak) return 0.08;   // 凌晨几乎没人
  if (isPeak) return 1.2 + (isWeekend ? 0.15 : 0); // 高峰爆量
  return 0.6 + (isWeekend ? 0.1 : 0); // 平时
}

/** 获取季节因子 */
export function getSeasonFactor(month: number): number {
  if (month === 11) return 1.4;  // 双11
  if (month === 6) return 1.25;  // 618
  if (month === 12 || month === 1) return 1.3; // 春节季
  if (month === 2) return 1.1;
  if (month === 7 || month === 8) return 1.15; // 暑期
  if (month >= 3 && month <= 5) return 1.0;
  return 0.95;
}

/** 获取平台分组 */
export function getPlatformsByGroup(): Record<string, PlatformConfig[]> {
  const groups: Record<string, PlatformConfig[]> = {};
  for (const p of Object.values(PLATFORMS)) {
    if (!groups[p.group]) groups[p.group] = [];
    groups[p.group].push(p);
  }
  return groups;
}

/** 检查平台是否在某阶段可用 */
export function isPlatformAvailable(platformId: string, stage: number): boolean {
  const p = PLATFORMS[platformId];
  return p ? p.availableInStage <= stage : false;
}

/** 平台 ID → 显示名称（全局共享） */
export function getPlatformName(id: string): string {
  return PLATFORMS[id]?.name || id;
}
