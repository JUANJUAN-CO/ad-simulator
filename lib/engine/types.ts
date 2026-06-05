// ============================================================
// 核心类型定义
// ============================================================

// ---------- 广告类型 ----------
export type AdType = 'feed_video' | 'feed_image' | 'feed_carousel' | 'feed_live' | 'feed_article' | 'search' | 'product_card';

export const AD_TYPE_LABELS: Record<AdType, string> = {
  feed_video: '视频信息流',
  feed_image: '图片信息流',
  feed_carousel: '轮播广告',
  feed_live: '直播引流',
  feed_article: '图文推广',
  search: '搜索广告',
  product_card: '商品卡',
};

// ---------- 平台 ----------
export type Platform = string; // 平台 ID

export interface PlatformConfig {
  id: Platform;
  name: string;
  group: string;          // 所属体系（巨量引擎/腾讯广告等）
  groupIcon: string;       // 体系图标
  mau: number;             // 月活用户（百万）
  femaleRatio: number;
  coreAge: [number, number];
  cityTiers: number[];
  avgCPM: number;
  avgCPC: number;
  avgCTR: number;
  avgCVR: number;
  peakHours: [number, number][];
  offPeakHours: [number, number][];
  conversionWindow: number; // 天
  learningThreshold: number;
  contentTone: string;
  adTypes: AdType[];       // 该平台支持的广告类型
  availableInStage: number; // 在第几个职业阶段解锁 (1-4)
  industryFit: Partial<Record<IndustryType, number>>; // 各行业匹配度 0-100
}

// ---------- 职业 ----------
export type CareerStage = 1 | 2 | 3 | 4;

export interface CareerStageConfig {
  stage: CareerStage;
  title: string;
  subtitle: string;
  expRequired: number;
  dailyBudgetCap: number;
  availablePlatforms: Platform[];
  mentorId: string;
  unlockedSkills: string[];
  description: string;
}

export interface MentorConfig {
  id: string;
  name: string;
  title: string;
  avatar: string;
  personality: string;
  greeting: string;
  stageId: CareerStage;
  tips: string[];
}

// ---------- 任务 ----------
export type MissionDifficulty = 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';

export interface MissionCondition {
  type: 'conversions' | 'cpa' | 'roi' | 'budget_spent' | 'platform_count' | 'plan_count' | 'ctr' | 'cvr';
  operator: 'gte' | 'lte' | 'eq';
  value: number;
  platform?: Platform;
}

export interface MissionReward {
  exp: number;
  money: number;
  item?: string;
  title?: string;
}

export interface MissionConfig {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  stageRequired: CareerStage;
  clientBrief: string;
  conditions: MissionCondition[];
  rewards: MissionReward;
  mentorHint: string;
  unlockAfter?: string[];
}

// ---------- 素材 ----------
export interface MaterialConfig {
  id: string;
  name: string;
  type: AdType;
  platform: Platform[];
  appeal: number;
  clarity: number;
  landingScore: number;
  industry: IndustryType;
  fatigueThreshold: number;
  description: string;
}

// ---------- 人群定向 ----------
export interface AudienceConfig {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'all';
  ageRange: [number, number];
  cityTiers: number[];
  interests: string[];
  estimatedSize: number;
  matchScore: Partial<Record<IndustryType, number>>;
}

export type IndustryType =
  | 'ecommerce'
  | 'education'
  | 'local_services'
  | 'gaming'
  | 'finance'
  | 'beauty'
  | 'health'
  | 'home'
  | 'travel'
  | 'food';

// ---------- 广告计划 ----------
export type CampaignGoal = 'leads' | 'app_install' | 'ecommerce' | 'brand';
export type BidMode = 'cpm' | 'cpc' | 'ocpm' | 'ocpc';

export interface CampaignConfig {
  id: string;
  name: string;
  platform: Platform;
  adType: AdType;           // 新增：广告子类型
  goal: CampaignGoal;
  audience: string;
  bidMode: BidMode;
  bidPrice: number;
  dailyBudget: number;
  totalBudget: number;
  materialId: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  pauseReason?: 'manual' | 'daily_budget' | 'total_budget';
}

// ---------- 运行时指标 ----------
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;          // 累计总消耗
  dailySpend: number;     // 今日消耗（每天0点重置）
  lastActiveDay: number;
  ctr: number;
  cvr: number;
  cpa: number;
  roi: number;
  ecpm: number;
  conversionValue: number;
  learningStage: 'cold_start' | 'learning' | 'stable' | 'fatigue';
  materialFreshness: number;
  effectiveCtr: number;
  effectiveCvr: number;
}

export interface CampaignSnapshot {
  campaignId: string;
  time: number;
  metrics: CampaignMetrics;
}

// ---------- 模拟引擎 ----------
export interface SimulationState {
  isRunning: boolean;
  speed: 0 | 1 | 5 | 20 | 50 | 100;
  currentTime: number;
  tickCount: number;
  marketCondition: MarketCondition;
}

export interface MarketCondition {
  competitionIntensity: number;
  timeFactor: number;
  dayOfWeek: number;
  seasonFactor: number;
  activeEvent: MarketEvent | null;
}

export interface MarketEvent {
  id: string;
  name: string;
  type: 'shopping_festival' | 'holiday' | 'industry_peak' | 'crisis';
  competitionMultiplier: number;
  cpmMultiplier: number;
  trafficMultiplier: number;
  platformAffected: Platform[];
  duration: number;
}

// ---------- 虚拟竞争者 ----------
export interface CompetitorPlan {
  id: string;
  name: string;
  platform: Platform;
  audience: string;
  bidPrice: number;
  dailyBudget: number;
  materialQuality: number;
  aggression: number;
  status: 'active' | 'paused';
}

// ---------- 客户场景 ----------
export interface ClientScenario {
  id: string;
  companyName: string;
  industry: IndustryType;
  brief: string;
  budget: number;
  goal: CampaignGoal;
  targetCPA: number;
  targetROI: number;
  deadline: number;
  difficulty: MissionDifficulty;
  constraints: string[];
  platforms: Platform[];
}

// ---------- 用户存档 ----------
export interface GameSave {
  id: string;
  name: string;
  careerStage: CareerStage;
  exp: number;
  totalMoney: number;
  freeMoney: number;
  completedMissions: string[];
  activeMissions: string[];
  campaigns: CampaignConfig[];
  campaignSnapshots: CampaignSnapshot[];
  createdAt: number;
  updatedAt: number;
  simState: SimulationState;
  stats: PlayerStats;
}

export interface PlayerStats {
  totalSpend: number;
  totalConversions: number;
  totalImpressions: number;
  bestROI: number;
  bestCPA: number;
  campaignsCreated: number;
  missionsCompleted: number;
  daysPlayed: number;
  rank: number;
}
