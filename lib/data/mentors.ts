// ============================================================
// 导师系统 — 三位导师的配置和对话
// ============================================================

import { MentorConfig, CareerStage } from '../engine/types';

export const MENTORS: Record<string, MentorConfig> = {
  laowang: {
    id: 'laowang',
    name: '老王',
    title: '高级优化师 · 8年经验',
    avatar: '🧔',
    personality: '热心、直爽、经验丰富的老大哥',
    stageId: 1,
    greeting: '哟，新来的！我是老王，干投放这行8年了。别紧张，跟着我一步步来，你很快就能上手。记住一句话：数据不会说谎，看懂了数据，就懂了一半的投放。',
    tips: [
      '新手别急着追高ROI，先把数据看懂了再说',
      '冷启动期不要频繁调价，给模型一点学习时间',
      '素材是投放的灵魂，好的素材比好的出价更重要',
      '每天第一件事：看昨天的数据报表',
      'CPA高了别慌，先看是CTR低还是CVR低，对症下药',
      '预算小的时候，精准定向比广撒网更有效',
    ],
  },
  kejie: {
    id: 'kejie',
    name: '柯姐',
    title: '数据科学家 · 前大厂投放负责人',
    avatar: '👩‍💼',
    personality: '冷静理性、数据至上、严谨的完美主义者',
    stageId: 2,
    greeting: '你好，我是柯姐。看来老王把你带得不错。接下来我们要进入更系统的优化阶段了——A/B测试、人群分层、出价策略。记住：感性的判断需要有数据支撑。',
    tips: [
      'A/B测试一定要控制变量，一次只改一个维度',
      '统计显著性不足时不要轻易下结论',
      '人群包不是越多越好，精准匹配比覆盖量重要',
      'ROI不是唯一指标，要同时关注量级和成本',
      '大促前一周就要开始提价，不要等活动当天才反应',
      '每个平台的算法偏好不同，不要一刀切',
    ],
  },
  chenzong: {
    id: 'chenzong',
    name: '陈总',
    title: '前投放总监 · 行业顾问',
    avatar: '👨‍💼',
    personality: '战略眼光、言简意赅、偶尔出现的导师',
    stageId: 3,
    greeting: '能走到这一步，你已经超越了90%的投手。接下来我们聊的不是怎么投，而是为什么投、投给谁、投多少。从执行者到策略者，这是你最后的蜕变。',
    tips: [
      '投放不是孤岛，要和产品、内容、品牌联动',
      '大预算要分散风险，不要把鸡蛋放一个篮子里',
      '汇报时先说结论，再看数据，最后给建议',
      '团队管理的关键：让每个人看到自己的成长',
      '行业在变，算法在变，唯一不变的是对用户的洞察',
      '你的天花板，取决于你对商业的理解，不是对工具的熟练度',
    ],
  },
};

/** 获取导师的提示（随机一条+根据情境的） */
export function getMentorTip(mentorId: string, context?: 'win' | 'lose' | 'idle' | 'new_campaign'): string {
  const mentor = MENTORS[mentorId];
  if (!mentor) return '';

  const generalTips = mentor.tips;
  const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];

  // 情境化前缀
  const prefixes: Record<string, string[]> = {
    win: ['干得漂亮！', '不错不错！', '很好！看来你掌握了。', '👍 '],
    lose: ['没关系，失败是正常的。', '别灰心，记住：', '这次没做好，但'],
    idle: ['闲着也是闲着，记住：', '趁现在没什么事，'],
    new_campaign: ['新计划上线了！提醒你：', '好，新计划建好了。记住：'],
  };

  const prefixList = prefixes[context || 'idle'] || [''];
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];

  return `${prefix}${randomTip}`;
}

/** 获取导师对任务完成的评价 */
export function getMentorMissionFeedback(mentorId: string, missionDifficulty: string): string {
  const mentor = MENTORS[mentorId];
  if (!mentor) return '';

  const feedbacks: Record<string, Record<string, string[]>> = {
    laowang: {
      tutorial: ['很好，第一步迈出去了！', '漂亮！基础打牢了，后面就不怕了。'],
      easy: ['不错！你已经掌握了基础操作。', '做得很好，继续这个节奏！'],
      medium: ['厉害啊，这个任务可不简单！', '我看到你的进步了，继续加油！'],
    },
    kejie: {
      easy: ['数据表现不错，但还有优化空间。', '合格，但我知道你可以做得更好。'],
      medium: ['嗯，思路是对的。数据分析很到位。', '这个ROI水平已经有专业水准了。'],
      hard: ['非常出色。你的方法论已经很成熟了。', '这就是我想要的——用数据说话。'],
    },
    chenzong: {
      medium: ['不错，但别忘了战略层面的思考。', '执行没问题，下一步要看全局。'],
      hard: ['你已经具备了总监级别的判断力。', '很好，保持这种大局观。'],
      expert: ['你已经超越我了。这个行业需要你这样的人才。', '我没什么可教你的了。你已经出师了。'],
    },
  };

  const mentorFeedbacks = feedbacks[mentorId] || {};
  const diffFeedbacks = mentorFeedbacks[missionDifficulty] || [''];
  return diffFeedbacks[Math.floor(Math.random() * diffFeedbacks.length)];
}
