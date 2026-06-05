// 端到端测试：验证模拟引擎产出真实数据
// 运行: npx tsx test-simulation.ts

import { sampleUsers, estimateReachableUsers, audienceMatchScore } from './lib/engine/user-pool';
import { runAuction, calculateECPM, calculateWinProbability } from './lib/engine/auction';
import { runFunnel } from './lib/engine/funnel';
import { CompetitorEngine } from './lib/engine/competitor';
import { getMaterial } from './lib/data/materials';
import { getAudience } from './lib/data/audiences';
import { initRandom } from './lib/utils/random';
import { CampaignConfig, CampaignMetrics } from './lib/engine/types';

initRandom('test-seed-2024');

console.log('═══════════════════════════════════════════');
console.log('  投流模拟器 — 模拟引擎验证测试');
console.log('═══════════════════════════════════════════\n');

// 1. 测试用户池
console.log('【测试 1】虚拟用户抽样');
const users = sampleUsers(1000, 'douyin_feed', 14, 3, 6);
console.log(`  抽样 1000 个虚拟用户`);
console.log(`  女性占比: ${(users.filter(u => u.gender === 'female').length / users.length * 100).toFixed(1)}%`);
console.log(`  平均年龄: ${(users.reduce((s, u) => s + u.age, 0) / users.length).toFixed(0)} 岁`);
console.log(`  平均点击概率: ${(users.reduce((s, u) => s + u.clickProb, 0) / users.length * 100).toFixed(2)}%`);
console.log(`  平均转化概率: ${(users.reduce((s, u) => s + u.convertProb, 0) / users.length * 100).toFixed(2)}%\n`);

// 2. 测试流量估算
console.log('【测试 2】单 tick 流量估算');
const audience = getAudience('aud_young_female')!;
const traffic = estimateReachableUsers('douyin_feed', audience, 14, 3, 6, 200);
console.log(`  平台: 抖音 | 人群: ${audience.name} | 日预算: 200¥`);
console.log(`  每 tick (10分钟) 可竞价流量: ${traffic.toLocaleString()} 次展示\n`);

// 3. 测试竞价
console.log('【测试 3】竞价引擎');
const material = getMaterial('mat_beauty_1')!;
const competitors = new CompetitorEngine('douyin_feed');

const campaign: CampaignConfig = {
  id: 'test_camp_1',
  name: '测试计划-口红',
  platform: 'douyin_feed',
  goal: 'ecommerce',
  audience: 'aud_young_female',
  bidMode: 'ocpm',
  bidPrice: 15,
  dailyBudget: 200,
  totalBudget: 1400,
  materialId: 'mat_beauty_1',
  status: 'active',
  createdAt: Date.now(),
  startedAt: Date.now(),
  endedAt: null,
};

const initialMetrics: CampaignMetrics = {
  impressions: 0, clicks: 0, conversions: 0, spend: 0,
  dailySpend: 0, lastActiveDay: 0,
  ctr: 0, cvr: 0, cpa: 0, roi: 0, ecpm: 0,
  conversionValue: 0, learningStage: 'cold_start',
  materialFreshness: 1, effectiveCtr: 0, effectiveCvr: 0,
};

const intensity = competitors.getIntensity();
const auctionResult = runAuction(campaign, initialMetrics, traffic, competitors, intensity);
console.log(`  eCPM: ¥${auctionResult.yourECPM.toFixed(2)}`);
console.log(`  市场均价 eCPM: ¥${auctionResult.marketECPM.toFixed(2)}`);
console.log(`  胜出率: ${(auctionResult.winRate * 100).toFixed(1)}%`);
console.log(`  赢得展示: ${auctionResult.impressions.toLocaleString()} 次\n`);

// 4. 测试转化漏斗
console.log('【测试 4】转化漏斗');
const sampledUsers = sampleUsers(auctionResult.impressions, 'douyin_feed', 14, 3, 6);
const funnelResult = runFunnel(
  auctionResult.impressions, campaign, initialMetrics,
  material, audience, 'beauty', sampledUsers,
);
console.log(`  展示: ${funnelResult.impressions.toLocaleString()}`);
console.log(`  点击: ${funnelResult.clicks.toLocaleString()} (CTR: ${(funnelResult.effectiveCTR * 100).toFixed(2)}%)`);
console.log(`  转化: ${funnelResult.conversions} (CVR: ${(funnelResult.effectiveCVR * 100).toFixed(2)}%)`);
console.log(`  花费: ¥${funnelResult.spend.toFixed(2)}`);
console.log(`  CPA: ¥${funnelResult.cpa.toFixed(2)}`);
console.log(`  ROI: ${funnelResult.roi.toFixed(2)}`);
console.log(`  学习阶段: ${funnelResult.learningStage}\n`);

// 5. 模拟运行多个 tick
console.log('【测试 5】连续 50 个 tick 模拟');
let runningMetrics = { ...initialMetrics };
let totalImpressions = 0, totalClicks = 0, totalConversions = 0, totalSpend = 0;

for (let tick = 1; tick <= 50; tick++) {
  const t = estimateReachableUsers('douyin_feed', audience, 14 + Math.floor(tick / 6), 3, 6, campaign.dailyBudget);
  const au = runAuction(campaign, runningMetrics, t, competitors, intensity);
  const su = sampleUsers(au.impressions, 'douyin_feed', 14, 3, 6);
  const fu = runFunnel(au.impressions, campaign, runningMetrics, material, audience, 'beauty', su);

  runningMetrics = {
    impressions: runningMetrics.impressions + fu.impressions,
    clicks: runningMetrics.clicks + fu.clicks,
    conversions: runningMetrics.conversions + fu.conversions,
    spend: runningMetrics.spend + fu.spend,
    ctr: 0, cvr: 0, cpa: 0, roi: 0, ecpm: au.yourECPM,
    conversionValue: runningMetrics.conversionValue + fu.conversionValue,
    learningStage: fu.learningStage,
    materialFreshness: fu.materialFreshness,
    effectiveCtr: fu.effectiveCTR,
    effectiveCvr: fu.effectiveCVR,
  };
  runningMetrics.ctr = runningMetrics.impressions > 0 ? runningMetrics.clicks / runningMetrics.impressions : 0;
  runningMetrics.cvr = runningMetrics.clicks > 0 ? runningMetrics.conversions / runningMetrics.clicks : 0;
  runningMetrics.cpa = runningMetrics.conversions > 0 ? runningMetrics.spend / runningMetrics.conversions : 0;
  runningMetrics.roi = runningMetrics.spend > 0 ? runningMetrics.conversionValue / runningMetrics.spend : 0;

  totalImpressions += fu.impressions;
  totalClicks += fu.clicks;
  totalConversions += fu.conversions;
  totalSpend += fu.spend;

  if (tick <= 3 || tick % 3 === 0) {
    console.log(`  Tick ${tick}: 展示 ${fu.impressions.toLocaleString().padStart(5)} | 点击 ${fu.clicks.toString().padStart(3)} | 转化 ${fu.conversions.toString().padStart(2)} | 花费 ¥${fu.spend.toFixed(2).padStart(6)} | 累计转化 ${runningMetrics.conversions}`);
  }
}

console.log(`\n  10 tick 汇总:`);
console.log(`  总展示: ${totalImpressions.toLocaleString()}`);
console.log(`  总点击: ${totalClicks.toLocaleString()}`);
console.log(`  总转化: ${totalConversions}`);
console.log(`  总花费: ¥${totalSpend.toFixed(2)}`);
console.log(`  最终 CPA: ¥${runningMetrics.cpa.toFixed(2)}`);
console.log(`  最终 ROI: ${runningMetrics.roi.toFixed(2)}\n`);

// 6. 验证结果
console.log('【验证结果】');
const checks: { name: string; pass: boolean; detail: string }[] = [
  { name: '用户抽样', pass: users.length === 1000, detail: `抽样量=${users.length}` },
  { name: '流量估算', pass: traffic > 0 && traffic < 10000, detail: `tick流量=${traffic}` },
  { name: '竞价产出', pass: auctionResult.impressions > 0, detail: `赢得展示=${auctionResult.impressions}` },
  { name: '转化漏斗产出', pass: funnelResult.impressions > 0 && funnelResult.spend > 0, detail: `展示=${funnelResult.impressions}, 花费=¥${funnelResult.spend.toFixed(2)}` },
  { name: '花费合理', pass: totalSpend < campaign.dailyBudget, detail: `10tick花费=${totalSpend.toFixed(2)}, 日预算=${campaign.dailyBudget}` },
  { name: '数据增长', pass: totalImpressions > 0 && totalConversions > 0, detail: `展示=${totalImpressions}, 转化=${totalConversions}` },
  { name: 'CPA合理', pass: runningMetrics.cpa > 0 && runningMetrics.cpa < 200, detail: `CPA=${runningMetrics.cpa.toFixed(2)}` },
];

let allPass = true;
for (const check of checks) {
  const icon = check.pass ? '✅' : '❌';
  console.log(`  ${icon} ${check.name}: ${check.detail}`);
  if (!check.pass) allPass = false;
}

console.log(`\n${allPass ? '✅ 全部测试通过！模拟引擎工作正常。' : '❌ 有测试失败，需要修复。'}`);
