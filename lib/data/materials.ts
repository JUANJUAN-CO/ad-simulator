// ============================================================
// 素材库 — 60+ 预设素材，适配所有平台
// ============================================================

import { MaterialConfig, AdType } from '../engine/types';
import { PLATFORMS } from '../engine/platforms';

// 平台组映射：旧短名称 → 该组下所有平台 ID
function expandPlatforms(shortNames: string[]): string[] {
  const result: string[] = [];
  for (const name of shortNames) {
    const found = Object.keys(PLATFORMS).filter(k => k.startsWith(name));
    if (found.length > 0) {
      result.push(...found);
    } else {
      result.push(name); // 可能是完整 ID
    }
  }
  return result;
}

export const MATERIALS: MaterialConfig[] = [
  // ===== 电商类 (电商/直播带货) =====
  {
    id: 'mat_ecom_1', name: '爆款连衣裙-穿搭展示',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu', 'kuaishou', 'qianchuan']),
    appeal: 75, clarity: 80, landingScore: 70,
    industry: 'ecommerce', fatigueThreshold: 50000,
    description: '达人上身展示新款连衣裙，前3秒展示穿着效果，适合信息流和直播引流',
  },
  {
    id: 'mat_ecom_2', name: '夏季凉鞋-多色对比',
    type: 'feed_carousel', platform: expandPlatforms(['xiaohongshu', 'wechat']),
    appeal: 65, clarity: 70, landingScore: 65,
    industry: 'ecommerce', fatigueThreshold: 40000,
    description: '多色多角度展示凉鞋，滑动浏览，适合朋友圈和搜索广告',
  },
  {
    id: 'mat_ecom_3', name: '限时折扣-倒计时促销',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'kuaishou', 'qianchuan']),
    appeal: 85, clarity: 90, landingScore: 60,
    industry: 'ecommerce', fatigueThreshold: 30000,
    description: '紧迫感促销视频，倒计时+折扣码，适合电商引流和直播',
  },
  {
    id: 'mat_ecom_4', name: '数码配件-功能演示',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'wechat', 'baidu']),
    appeal: 70, clarity: 85, landingScore: 75,
    industry: 'ecommerce', fatigueThreshold: 45000,
    description: '实物演示充电宝快充功能，适合信息流和搜索广告',
  },
  {
    id: 'mat_ecom_5', name: '家居收纳-前后对比',
    type: 'feed_image', platform: expandPlatforms(['xiaohongshu', 'wechat']),
    appeal: 80, clarity: 75, landingScore: 80,
    industry: 'home', fatigueThreshold: 50000,
    description: '收纳前后对比图，视觉冲击力强，适合朋友圈和公众号',
  },
  {
    id: 'mat_ecom_6', name: '商品卡-爆款直投',
    type: 'product_card', platform: expandPlatforms(['qianchuan']),
    appeal: 65, clarity: 95, landingScore: 85,
    industry: 'ecommerce', fatigueThreshold: 60000,
    description: '商品卡直接展示商品图片+价格+购买按钮，适合千川电商',
  },

  // ===== 教育类 =====
  {
    id: 'mat_edu_1', name: '英语口语-学员见证',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu', 'baidu']),
    appeal: 72, clarity: 75, landingScore: 78,
    industry: 'education', fatigueThreshold: 55000,
    description: '真实学员讲述学习前后变化，适合信息流和搜索广告',
  },
  {
    id: 'mat_edu_2', name: '编程培训-免费试听课',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'wechat', 'kuaishou', 'bilibili']),
    appeal: 68, clarity: 85, landingScore: 82,
    industry: 'education', fatigueThreshold: 50000,
    description: '免费试听课片段，展示教学风格，适合B站和抖音',
  },
  {
    id: 'mat_edu_3', name: '考研辅导-名师简介',
    type: 'feed_image', platform: expandPlatforms(['xiaohongshu', 'wechat', 'zhihu']),
    appeal: 60, clarity: 80, landingScore: 75,
    industry: 'education', fatigueThreshold: 60000,
    description: '名师背景+成果数据展示，适合知乎和公众号',
  },
  {
    id: 'mat_edu_4', name: '职业培训-就业数据',
    type: 'feed_carousel', platform: expandPlatforms(['wechat', 'xiaohongshu', 'zhihu']),
    appeal: 75, clarity: 90, landingScore: 70,
    industry: 'education', fatigueThreshold: 45000,
    description: '学员就业薪资数据，说服力强，适合知乎知+',
  },
  {
    id: 'mat_edu_5', name: '知识付费-深度文章',
    type: 'feed_article', platform: expandPlatforms(['zhihu', 'wechat']),
    appeal: 55, clarity: 95, landingScore: 80,
    industry: 'education', fatigueThreshold: 70000,
    description: '深度科普长文+课程引导，适合知乎和公众号',
  },

  // ===== 本地服务/美妆/健康 =====
  {
    id: 'mat_beauty_1', name: '口红试色-全色号',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu']),
    appeal: 85, clarity: 75, landingScore: 72,
    industry: 'beauty', fatigueThreshold: 35000,
    description: '真人试色展示不同肤色效果，适合小红书和抖音信息流',
  },
  {
    id: 'mat_beauty_2', name: '护肤教程-28天变化',
    type: 'feed_video', platform: expandPlatforms(['xiaohongshu', 'douyin', 'weibo']),
    appeal: 80, clarity: 70, landingScore: 75,
    industry: 'beauty', fatigueThreshold: 40000,
    description: '28天护肤变化记录，适合小红书搜索和信息流',
  },
  {
    id: 'mat_beauty_3', name: '香水测评-场景拍摄',
    type: 'feed_carousel', platform: expandPlatforms(['xiaohongshu', 'wechat', 'weibo']),
    appeal: 78, clarity: 60, landingScore: 70,
    industry: 'beauty', fatigueThreshold: 45000,
    description: '精致场景+香水瓶特写，适合朋友圈和微博粉丝通',
  },
  {
    id: 'mat_health_1', name: '健身计划-效果展示',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'kuaishou', 'weibo']),
    appeal: 82, clarity: 72, landingScore: 78,
    industry: 'health', fatigueThreshold: 40000,
    description: '30天身材变化记录，适合短视频平台',
  },
  {
    id: 'mat_health_2', name: '营养品-成分科普',
    type: 'feed_image', platform: expandPlatforms(['wechat', 'xiaohongshu', 'zhihu']),
    appeal: 55, clarity: 88, landingScore: 75,
    industry: 'health', fatigueThreshold: 60000,
    description: '科普长图，专业性强，适合知乎和公众号',
  },
  {
    id: 'mat_local_1', name: '新店开业-探店视频',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu', 'kuaishou']),
    appeal: 82, clarity: 65, landingScore: 72,
    industry: 'local_services', fatigueThreshold: 35000,
    description: '达人探店展示环境+菜品，适合本地生活推广',
  },
  {
    id: 'mat_local_2', name: '美发沙龙-发型变身',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu', 'weibo']),
    appeal: 90, clarity: 70, landingScore: 78,
    industry: 'beauty', fatigueThreshold: 40000,
    description: '发型改造前后对比，视觉冲击强',
  },

  // ===== 游戏类 =====
  {
    id: 'mat_game_1', name: '新手游-实机画面',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'kuaishou', 'bilibili']),
    appeal: 88, clarity: 60, landingScore: 65,
    industry: 'gaming', fatigueThreshold: 25000,
    description: '游戏实机画面特效展示，适合B站和短视频',
  },
  {
    id: 'mat_game_2', name: '游戏礼包-限时领取',
    type: 'feed_image', platform: expandPlatforms(['douyin', 'wechat', 'bilibili']),
    appeal: 78, clarity: 90, landingScore: 60,
    industry: 'gaming', fatigueThreshold: 20000,
    description: '领取按钮突出诱导点击，适合B站信息流',
  },
  {
    id: 'mat_game_3', name: '电竞比赛-精彩集锦',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'kuaishou', 'bilibili', 'weibo']),
    appeal: 85, clarity: 55, landingScore: 68,
    industry: 'gaming', fatigueThreshold: 30000,
    description: '比赛高光片段吸引游戏玩家，适合微博热搜',
  },

  // ===== 金融类 =====
  {
    id: 'mat_fin_1', name: '信用卡-权益展示',
    type: 'feed_carousel', platform: expandPlatforms(['wechat', 'xiaohongshu', 'zhihu']),
    appeal: 62, clarity: 82, landingScore: 80,
    industry: 'finance', fatigueThreshold: 50000,
    description: '权益图标+数字展示，信息量大，适合知乎和朋友圈',
  },
  {
    id: 'mat_fin_2', name: '理财课程-免费领取',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'wechat', 'baidu']),
    appeal: 70, clarity: 78, landingScore: 85,
    industry: 'finance', fatigueThreshold: 45000,
    description: '理财导师讲解片段+免费领取引导，适合百度搜索',
  },
  {
    id: 'mat_fin_3', name: '保险产品-场景故事',
    type: 'feed_video', platform: expandPlatforms(['wechat', 'douyin', 'zhihu']),
    appeal: 68, clarity: 72, landingScore: 75,
    industry: 'finance', fatigueThreshold: 55000,
    description: '家庭场景故事引发共鸣，适合知乎和公众号',
  },

  // ===== 家居/旅游/食品 =====
  {
    id: 'mat_home_1', name: '全屋定制-3D效果图',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu', 'baidu']),
    appeal: 78, clarity: 80, landingScore: 82,
    industry: 'home', fatigueThreshold: 45000,
    description: '3D渲染展示装修效果，适合百度搜索和信息流',
  },
  {
    id: 'mat_home_2', name: '智能家居-使用场景',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'wechat', 'bilibili']),
    appeal: 75, clarity: 78, landingScore: 80,
    industry: 'home', fatigueThreshold: 48000,
    description: '智能家居日常使用场景，适合B站科技区',
  },
  {
    id: 'mat_travel_1', name: '酒店套餐-沉浸体验',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'xiaohongshu']),
    appeal: 88, clarity: 65, landingScore: 76,
    industry: 'travel', fatigueThreshold: 30000,
    description: '酒店房间+周边景点沉浸展示，适合小红书',
  },
  {
    id: 'mat_travel_2', name: '跟团游-行程详解',
    type: 'feed_carousel', platform: expandPlatforms(['wechat', 'xiaohongshu', 'zhihu']),
    appeal: 65, clarity: 88, landingScore: 78,
    industry: 'travel', fatigueThreshold: 40000,
    description: '行程时间线+亮点标注，适合知乎旅行话题',
  },
  {
    id: 'mat_food_1', name: '零食开箱-试吃测评',
    type: 'feed_video', platform: expandPlatforms(['douyin', 'kuaishou', 'bilibili']),
    appeal: 82, clarity: 60, landingScore: 68,
    industry: 'food', fatigueThreshold: 30000,
    description: '开箱试吃真实反应，适合快手接地气风格',
  },
  {
    id: 'mat_food_2', name: '养生茶饮-冲泡展示',
    type: 'feed_video', platform: expandPlatforms(['xiaohongshu', 'douyin', 'weibo']),
    appeal: 72, clarity: 75, landingScore: 72,
    industry: 'food', fatigueThreshold: 45000,
    description: '冲泡过程+原材料展示，适合小红书种草',
  },
];

/** 按平台组筛选素材（自动匹配同一体系下所有平台） */
export function getMaterialsForPlatform(platformId: string): MaterialConfig[] {
  const platformConfig = PLATFORMS[platformId];
  if (!platformConfig) return MATERIALS;

  // 匹配同一 group 下的所有平台
  return MATERIALS.filter(m =>
    m.platform.some(pid => PLATFORMS[pid]?.group === platformConfig.group)
  );
}

/** 按行业筛选素材 */
export function getMaterialsForIndustry(industry: string): MaterialConfig[] {
  return MATERIALS.filter(m => m.industry === industry);
}

/** 获取单个素材 */
export function getMaterial(id: string): MaterialConfig | undefined {
  return MATERIALS.find(m => m.id === id);
}

/** 按 AdType 筛选 */
export function getMaterialsForAdType(adType: AdType): MaterialConfig[] {
  return MATERIALS.filter(m => m.type === adType);
}
