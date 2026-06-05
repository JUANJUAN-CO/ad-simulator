'use client';

import { useMemo } from 'react';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useGameStore } from '@/lib/store/game-store';
import { getMaterial } from '@/lib/data/materials';
import { getAudience } from '@/lib/data/audiences';
import { PLATFORMS } from '@/lib/engine/platforms';

/** 生成针对性的投放分析建议 */
function analyzeCampaigns(
  campaigns: ReturnType<typeof useCampaignStore.getState>['campaigns'],
  metrics: ReturnType<typeof useCampaignStore.getState>['metrics'],
  careerStage: number,
) {
  const insights: Array<{
    type: 'warning' | 'success' | 'tip' | 'action';
    icon: string;
    title: string;
    detail: string;
  }> = [];

  const active = campaigns.filter(c => c.status === 'active');
  const activeWithMetrics = active.map(c => ({ c, m: metrics[c.id] })).filter(x => x.m);

  if (activeWithMetrics.length === 0) {
    if (campaigns.length === 0) {
      insights.push({
        type: 'action', icon: '🎯',
        title: '创建第一条计划',
        detail: '还没有任何推广计划。建议从抖音信息流开始，选择年轻女性人群，OCPM 15 元出价，日预算 300 元。',
      });
    } else if (campaigns.every(c => c.status === 'draft')) {
      insights.push({
        type: 'action', icon: '▶️',
        title: '启动你的计划',
        detail: `有 ${campaigns.length} 条计划还是草稿状态，进入详情页点击"开始投放"吧！`,
      });
    } else {
      insights.push({
        type: 'tip', icon: '⏸️',
        title: '所有计划已暂停',
        detail: '暂停投放期间不会消耗预算。恢复投放即可继续获取数据。',
      });
    }
    return insights;
  }

  // === 分析每条活跃计划 ===
  for (const { c, m } of activeWithMetrics) {
    if (!m) continue;
    const material = c.materialId ? getMaterial(c.materialId) : null;
    const audience = c.audience ? getAudience(c.audience) : null;
    const platformCfg = PLATFORMS[c.platform] || null;

    // 1. 学习期分析
    if (m.learningStage === 'cold_start' && m.conversions < 5) {
      insights.push({
        type: 'tip', icon: '🧊',
        title: `「${c.name}」处于冷启动期`,
        detail: `冷启动期数据波动大是正常现象。${platformCfg?.name || c.platform}需要 ${platformCfg?.learningThreshold || 50} 个转化才能进入稳定期。不要频繁调价。`,
      });
    }

    // 2. CTR 分析
    if (m.ctr > 0 && m.impressions > 100) {
      const avgCTR = platformCfg?.avgCTR || 0.025;
      if (m.ctr < avgCTR * 0.5) {
        const matName = material?.name || '当前素材';
        insights.push({
          type: 'warning', icon: '📉',
          title: `「${c.name}」点击率偏低`,
          detail: `CTR ${(m.ctr*100).toFixed(2)}%，远低于平台平均 ${(avgCTR*100).toFixed(1)}%。建议更换吸引力更高的素材（当前: ${matName}，吸引力 ${material?.appeal || '?'}/100）或调整人群定向。`,
        });
      } else if (m.ctr > avgCTR * 1.5) {
        insights.push({
          type: 'success', icon: '📈',
          title: `「${c.name}」点击率优异`,
          detail: `CTR ${(m.ctr*100).toFixed(2)}% 远超平台平均。素材吸引力强，可以考虑适当加预算放量。`,
        });
      }
    }

    // 3. CVR 分析
    if (m.cvr > 0 && m.clicks > 50) {
      const avgCVR = platformCfg?.avgCVR || 0.03;
      if (m.cvr < avgCVR * 0.5) {
        insights.push({
          type: 'warning', icon: '🔍',
          title: `「${c.name}」转化率偏低`,
          detail: `CVR ${(m.cvr*100).toFixed(2)}% 低于平台平均 ${(avgCVR*100).toFixed(1)}%。可能原因：人群不匹配（当前: ${audience?.name || '未知'}）、落地页体验差、或素材与实际产品不符。`,
        });
      }
    }

    // 4. 素材疲劳
    if (m.learningStage === 'fatigue' || (m.materialFreshness && m.materialFreshness < 0.3)) {
      insights.push({
        type: 'warning', icon: '😴',
        title: `「${c.name}」素材已疲劳`,
        detail: `新鲜度仅 ${((m.materialFreshness || 0)*100).toFixed(0)}%。CTR 持续衰减中。进入详情页更换素材可立即恢复效果。`,
      });
    }

    // 5. 日预算分析
    const budgetRatio = c.dailyBudget > 0 ? m.dailySpend / c.dailyBudget : 0;
    if (budgetRatio > 0.95) {
      insights.push({
        type: 'tip', icon: '⏳',
        title: `「${c.name}」日预算接近用完`,
        detail: `今日已消耗 ¥${m.dailySpend.toFixed(0)} / ¥${c.dailyBudget}。如果 ROI 表现好，可以进入详情页提高日预算来放量。`,
      });
    }

    // 6. CPA 偏离分析
    if (m.conversions > 10 && c.bidMode === 'ocpm') {
      if (m.cpa > c.bidPrice * 2) {
        insights.push({
          type: 'warning', icon: '💰',
          title: `「${c.name}」CPA 严重偏高`,
          detail: `实际 CPA ¥${m.cpa.toFixed(1)} 是出价 ¥${c.bidPrice} 的 ${(m.cpa/c.bidPrice).toFixed(1)} 倍。OCPM 系统会尽量控制成本接近出价。建议排查：人群是否过窄？素材是否疲劳？落地页转化是否有问题？`,
        });
      } else if (m.cpa < c.bidPrice * 0.7) {
        insights.push({
          type: 'success', icon: '🎯',
          title: `「${c.name}」CPA 表现优异`,
          detail: `实际 CPA ¥${m.cpa.toFixed(1)} 远低于出价 ¥${c.bidPrice}。可以适当提高出价来获取更多量。`,
        });
      }
    }
  }

  // === 全局分析 ===
  const totalConv = activeWithMetrics.reduce((s, x) => s + (x.m?.conversions || 0), 0);
  const totalSpend = activeWithMetrics.reduce((s, x) => s + (x.m?.dailySpend || 0), 0);
  const activePlatforms = new Set(active.map(c => c.platform));

  // 7. 平台分散建议
  if (careerStage >= 2 && activePlatforms.size === 1 && active.length >= 3) {
    insights.push({
      type: 'tip', icon: '🌐',
      title: '建议分散平台',
      detail: `你的 ${active.length} 条计划都在同一平台。不同平台的用户画像和成本结构差异很大，建议在至少 2-3 个平台试投，分散风险。`,
    });
  }

  // 8. 全局表现总结
  if (totalSpend > 100) {
    const overallCPA = totalConv > 0 ? totalSpend / totalConv : 0;
    if (overallCPA > 50 && careerStage <= 2) {
      insights.push({
        type: 'tip', icon: '💡',
        title: '整体获客成本偏高',
        detail: `综合 CPA ¥${overallCPA.toFixed(1)}。新手降低 CPA 的秘诀：选低 CPM 平台（如快手 ¥10）、用通投人群（覆盖大）、选游戏/电商类素材（高 CTR）。`,
      });
    }
  }

  // 限制最多 4 条洞察，按优先级排序
  const priority = { warning: 0, action: 1, tip: 2, success: 3 };
  return insights.sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99)).slice(0, 4);
}

export default function SmartAnalysis() {
  const campaigns = useCampaignStore(s => s.campaigns);
  const metrics = useCampaignStore(s => s.metrics);
  const careerStage = useGameStore(s => s.careerStage);

  const insights = useMemo(
    () => analyzeCampaigns(campaigns, metrics, careerStage),
    [campaigns, metrics, careerStage],
  );

  if (insights.length === 0) return null;

  const typeStyles: Record<string, string> = {
    warning: 'border-l-amber-500 bg-amber-50/50',
    success: 'border-l-green-500 bg-green-50/50',
    tip: 'border-l-blue-500 bg-blue-50/50',
    action: 'border-l-purple-500 bg-purple-50/50',
  };

  const typeTitles: Record<string, string> = {
    warning: '⚠️ 需要注意',
    success: '✅ 表现优异',
    tip: '💡 优化建议',
    action: '🎯 立即行动',
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧔</span>
        <h3 className="text-xs font-medium text-slate-500 uppercase">老王·智能分析</h3>
        <span className="text-[9px] text-slate-400 ml-auto">基于实时数据</span>
      </div>

      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`border-l-2 rounded-r-lg p-2.5 ${typeStyles[insight.type] || typeStyles.tip}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
              <div>
                <div className="text-[11px] font-semibold text-slate-700">{insight.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{insight.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-center">
        <span className="text-[9px] text-slate-400">
          {typeTitles[insights[0].type]} · 共 {insights.length} 条洞察
        </span>
      </div>
    </div>
  );
}
