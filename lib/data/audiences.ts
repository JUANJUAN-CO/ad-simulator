// ============================================================
// 人群定向模板 — 预设人群包
// ============================================================

import { AudienceConfig } from '../engine/types';

export const AUDIENCES: AudienceConfig[] = [
  {
    id: 'aud_broad',
    name: '通投（广泛人群）',
    gender: 'all',
    ageRange: [18, 55],
    cityTiers: [1, 2, 3, 4, 5],
    interests: ['综合'],
    estimatedSize: 5000,
    matchScore: {
      ecommerce: 50, education: 40, local_services: 50, gaming: 60,
      finance: 40, beauty: 50, health: 45, home: 50, travel: 55, food: 55,
    },
  },
  {
    id: 'aud_young_female',
    name: '年轻女性（18-30）',
    gender: 'female',
    ageRange: [18, 30],
    cityTiers: [1, 2, 3],
    interests: ['穿搭', '美妆', '护肤', '旅行'],
    estimatedSize: 1200,
    matchScore: {
      ecommerce: 80, education: 45, local_services: 65, gaming: 20,
      finance: 30, beauty: 95, health: 65, home: 50, travel: 80, food: 70,
    },
  },
  {
    id: 'aud_middle_male',
    name: '中年男性（30-50）',
    gender: 'male',
    ageRange: [30, 50],
    cityTiers: [1, 2, 3],
    interests: ['科技', '财经', '汽车', '游戏'],
    estimatedSize: 1500,
    matchScore: {
      ecommerce: 55, education: 55, local_services: 40, gaming: 65,
      finance: 80, beauty: 10, health: 55, home: 65, travel: 60, food: 35,
    },
  },
  {
    id: 'aud_tier34',
    name: '下沉市场人群',
    gender: 'all',
    ageRange: [20, 50],
    cityTiers: [3, 4],
    interests: ['短视频', '直播', '游戏', '生活'],
    estimatedSize: 2500,
    matchScore: {
      ecommerce: 65, education: 45, local_services: 60, gaming: 75,
      finance: 30, beauty: 45, health: 50, home: 55, travel: 40, food: 65,
    },
  },
  {
    id: 'aud_high_intent',
    name: '高消费意愿人群',
    gender: 'all',
    ageRange: [25, 45],
    cityTiers: [1, 2],
    interests: ['奢侈品', '科技', '旅行', '教育'],
    estimatedSize: 800,
    matchScore: {
      ecommerce: 75, education: 75, local_services: 55, gaming: 30,
      finance: 85, beauty: 75, health: 70, home: 75, travel: 90, food: 45,
    },
  },
  {
    id: 'aud_parents',
    name: '宝爸宝妈（25-40）',
    gender: 'all',
    ageRange: [25, 40],
    cityTiers: [1, 2, 3],
    interests: ['育儿', '教育', '家居', '亲子'],
    estimatedSize: 1000,
    matchScore: {
      ecommerce: 65, education: 90, local_services: 50, gaming: 20,
      finance: 45, beauty: 40, health: 60, home: 80, travel: 55, food: 50,
    },
  },
  {
    id: 'aud_students',
    name: '学生群体（18-22）',
    gender: 'all',
    ageRange: [18, 22],
    cityTiers: [1, 2, 3, 4],
    interests: ['游戏', '动漫', '学习', '兼职'],
    estimatedSize: 600,
    matchScore: {
      ecommerce: 55, education: 85, local_services: 45, gaming: 90,
      finance: 15, beauty: 55, health: 30, home: 20, travel: 30, food: 60,
    },
  },
  {
    id: 'aud_senior',
    name: '银发人群（50+）',
    gender: 'all',
    ageRange: [50, 65],
    cityTiers: [1, 2, 3, 4],
    interests: ['养生', '广场舞', '旅游', '新闻'],
    estimatedSize: 900,
    matchScore: {
      ecommerce: 40, education: 20, local_services: 55, gaming: 5,
      finance: 50, beauty: 20, health: 85, home: 40, travel: 65, food: 40,
    },
  },
];

export function getAudience(id: string): AudienceConfig | undefined {
  return AUDIENCES.find(a => a.id === id);
}
