// 完整流程测试：模拟 创建计划→启动→运行→检查数据
import { initRandom } from './lib/utils/random';
import { sampleUsers, estimateReachableUsers } from './lib/engine/user-pool';
import { runAuction } from './lib/engine/auction';
import { runFunnel } from './lib/engine/funnel';
import { CompetitorEngine } from './lib/engine/competitor';
import { getMaterial } from './lib/data/materials';
import { getAudience } from './lib/data/audiences';
import { PlatformConfig } from './lib/engine/types';

initRandom('full-flow-test');

console.log('═══════════════════════════════════════════');
console.log('  全流程端到端测试');
console.log('═══════════════════════════════════════════\n');

const platform = 'douyin_feed';
const audience = getAudience('aud_young_female')!;
const material = getMaterial('mat_ecom_1')!;
const competitors = new CompetitorEngine(platform);

const campaign = {
  id: 'test_camp', name: '测试计划', platform,
  adType: 'feed_video' as any, goal: 'ecommerce' as any,
  audience: audience.id, bidMode: 'ocpm' as any,
  bidPrice: 15, dailyBudget: 500, totalBudget: 3500,
  materialId: material.id, status: 'active' as any,
  createdAt: Date.now(), startedAt: Date.now(), endedAt: null,
};

const metrics = {
  impressions: 0, clicks: 0, conversions: 0,
  spend: 0, dailySpend: 0, lastActiveDay: 0,
  ctr: 0, cvr: 0, cpa: 0, roi: 0, ecpm: 0,
  conversionValue: 0, learningStage: 'cold_start' as any,
  materialFreshness: 1, effectiveCtr: 0, effectiveCvr: 0,
};

console.log('📋 测试配置:');
console.log(`  平台: ${platform} | 人群: ${audience.name}`);
console.log(`  素材: ${material.name} | 日预算: ¥${campaign.dailyBudget} | 总预算: ¥${campaign.totalBudget}`);
console.log(`  出价: ${campaign.bidMode} ¥${campaign.bidPrice}\n`);

// 模拟 30 个 tick (5 小时)
let current = { ...metrics };
let totalImpr = 0, totalClick = 0, totalConv = 0, totalSpend = 0;
let ticksWithConv = 0;

console.log('⏱  开始模拟 30 ticks...\n');

for (let tick = 0; tick < 30; tick++) {
  const simHour = (tick * 10) % 1440 / 60;
  const hour = Math.floor(simHour) % 24;
  const dayOfWeek = Math.floor(tick / 144) % 7;
  const month = 6;

  // 日预算已用完？跳过
  if (current.dailySpend >= campaign.dailyBudget) continue;
  // 总预算已用完？停止
  if (current.spend >= campaign.totalBudget) break;

  const traffic = estimateReachableUsers(platform, audience, hour, dayOfWeek, month, campaign.dailyBudget);
  const auction = runAuction(campaign as any, current, traffic, competitors, competitors.getIntensity());
  const users = sampleUsers(auction.impressions, platform, hour, dayOfWeek, month);
  const funnel = runFunnel(auction.impressions, campaign as any, current, material, audience, 'ecommerce', users);

  const remainingDaily = campaign.dailyBudget - current.dailySpend;
  let { impressions, clicks, conversions, spend, conversionValue } = funnel;
  if (spend > remainingDaily) {
    const s = remainingDaily / spend;
    impressions = Math.floor(impressions * s);
    clicks = Math.floor(clicks * s);
    conversions = Math.floor(conversions * s);
    spend = remainingDaily;
  }

  current = {
    ...current,
    impressions: current.impressions + impressions,
    clicks: current.clicks + clicks,
    conversions: current.conversions + conversions,
    spend: current.spend + spend,
    dailySpend: current.dailySpend + spend,
    conversionValue: current.conversionValue + conversionValue,
  };
  current.ctr = current.impressions > 0 ? current.clicks / current.impressions : 0;
  current.cvr = current.clicks > 0 ? current.conversions / current.clicks : 0;
  current.cpa = current.conversions > 0 ? current.spend / current.conversions : 0;
  current.roi = current.spend > 0 ? current.conversionValue / current.spend : 0;

  totalImpr += impressions;
  totalClick += clicks;
  totalConv += conversions;
  totalSpend += spend;
  if (conversions > 0) ticksWithConv++;

  if (tick < 5 || tick % 10 === 0) {
    console.log(`  Tick ${tick.toString().padStart(2)}: 展示${impressions.toString().padStart(4)} 点击${clicks.toString().padStart(2)} 转化${conversions.toString().padStart(2)} 花费¥${spend.toFixed(2).padStart(6)} 累计转化${current.conversions}`);
  }
}

console.log(`\n📊 30 ticks 汇总:`);
console.log(`  总展示: ${totalImpr.toLocaleString()}`);
console.log(`  总点击: ${totalClick}`);
console.log(`  总转化: ${totalConv}`);
console.log(`  总花费: ¥${totalSpend.toFixed(2)}`);
console.log(`  CPA: ¥${current.cpa.toFixed(2)}`);
console.log(`  ROI: ${current.roi.toFixed(2)}`);
console.log(`  产生转化的 tick 数: ${ticksWithConv}/30`);

// 然后模拟跨天：重置 dailySpend
console.log(`\n🌅 模拟跨天重置...`);
current.dailySpend = 0;
for (let tick = 0; tick < 50; tick++) {
  if (current.dailySpend >= campaign.dailyBudget) continue;
  if (current.spend >= campaign.totalBudget) break;

  const hour = (tick * 10) % 1440 / 60;
  const traffic = estimateReachableUsers(platform, audience, Math.floor(hour), 1, 6, campaign.dailyBudget);
  const auction = runAuction(campaign as any, current, traffic, competitors, competitors.getIntensity());
  const users = sampleUsers(auction.impressions, platform, Math.floor(hour), 1, 6);
  const funnel = runFunnel(auction.impressions, campaign as any, current, material, audience, 'ecommerce', users);

  const remainingDaily = campaign.dailyBudget - current.dailySpend;
  let { impressions, clicks, conversions, spend, conversionValue } = funnel;
  if (spend > remainingDaily) {
    const s = remainingDaily / spend;
    impressions = Math.floor(impressions * s); clicks = Math.floor(clicks * s);
    conversions = Math.floor(conversions * s); spend = remainingDaily;
  }

  current = {
    ...current,
    impressions: current.impressions + impressions,
    clicks: current.clicks + clicks,
    conversions: current.conversions + conversions,
    spend: current.spend + spend,
    dailySpend: current.dailySpend + spend,
    conversionValue: current.conversionValue + conversionValue,
  };
  current.ctr = current.impressions > 0 ? current.clicks / current.impressions : 0;
  current.cvr = current.clicks > 0 ? current.conversions / current.clicks : 0;
  current.cpa = current.conversions > 0 ? current.spend / current.conversions : 0;
  current.roi = current.spend > 0 ? current.conversionValue / current.spend : 0;
}

console.log(`  跨天后累计转化: ${current.conversions}`);
console.log(`  跨天后累计花费: ¥${current.spend.toFixed(2)}`);
console.log(`  CPA: ¥${current.cpa.toFixed(2)}`);
console.log(`  ROI: ${current.roi.toFixed(2)}`);

const checks = [
  { name: '有展示量', pass: totalImpr > 0, detail: `${totalImpr}` },
  { name: '有点击', pass: totalClick > 0, detail: `${totalClick}` },
  { name: '有转化', pass: totalConv > 0, detail: `${totalConv}` },
  { name: '有花费', pass: totalSpend > 0, detail: `¥${totalSpend.toFixed(2)}` },
  { name: 'CPA合理', pass: current.cpa > 1 && current.cpa < 100, detail: `¥${current.cpa.toFixed(2)}` },
  { name: '跨天重置有效(花费增长)', pass: current.spend > totalSpend, detail: `原来¥${totalSpend.toFixed(0)}→现在¥${current.spend.toFixed(0)}` },
];

console.log(`\n🏁 验证结果:`);
let allPass = true;
for (const c of checks) {
  console.log(`  ${c.pass ? '✅' : '❌'} ${c.name}: ${c.detail}`);
  if (!c.pass) allPass = false;
}
console.log(`\n${allPass ? '✅ 全流程测试通过！模拟管道完整可用。' : '❌ 有问题需要修复。'}`);

if (!allPass) process.exit(1);
