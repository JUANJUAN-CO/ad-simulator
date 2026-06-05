'use client';

import { useState } from 'react';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { PLATFORMS, getPlatformName } from '@/lib/engine/platforms';
import { getMaterial } from '@/lib/data/materials';
import { getAudience } from '@/lib/data/audiences';

export default function AnalysisPage() {
  const campaigns = useCampaignStore(s => s.campaigns);
  const metrics = useCampaignStore(s => s.metrics);
  const all = campaigns.filter(c => c.status !== 'draft');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (all.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-base font-bold text-slate-800">数据报表</h1>
        <div className="text-center py-20 bg-white rounded border border-slate-200 mt-3">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-sm text-slate-400">暂无投放数据</p>
          <p className="text-[11px] text-slate-300 mt-1">创建并启动推广计划后，所有数据将在这里汇总</p>
        </div>
      </div>
    );
  }

  const totalSpend = all.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0);
  const totalConv = all.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0);
  const totalImp = all.reduce((s, c) => s + (metrics[c.id]?.impressions || 0), 0);
  const totalClick = all.reduce((s, c) => s + (metrics[c.id]?.clicks || 0), 0);
  const totalValue = all.reduce((s, c) => s + (metrics[c.id]?.conversionValue || 0), 0);
  const overallROI = totalSpend > 0 ? totalValue / totalSpend : 0;
  const overallCTR = totalImp > 0 ? totalClick / totalImp : 0;
  const overallCVR = totalClick > 0 ? totalConv / totalClick : 0;
  const overallCPA = totalConv > 0 ? totalSpend / totalConv : 0;

  // 平台汇总
  const platformStats = (Object.keys(PLATFORMS) as string[]).map(pid => {
    const pc = all.filter(c => c.platform === pid);
    if (pc.length === 0) return null;
    const sp = pc.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0);
    const cv = pc.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0);
    const imp = pc.reduce((s, c) => s + (metrics[c.id]?.impressions || 0), 0);
    const clk = pc.reduce((s, c) => s + (metrics[c.id]?.clicks || 0), 0);
    const val = pc.reduce((s, c) => s + (metrics[c.id]?.conversionValue || 0), 0);
    return { name: getPlatformName(pid), count: pc.length, spend: sp, conversions: cv, impressions: imp, roi: sp > 0 ? val / sp : 0, cpa: cv > 0 ? sp / cv : 0 };
  }).filter(Boolean);

  // 按状态分布
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const pausedCount = campaigns.filter(c => c.status === 'paused').length;
  const endedCount = campaigns.filter(c => c.status === 'ended').length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800">数据报表</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {all.length} 条计划 · 投放中 {activeCount} · 暂停 {pausedCount} · 已结束 {endedCount}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Kpi label="总消耗" value={`¥${totalSpend.toFixed(0)}`} color="slate" />
        <Kpi label="总转化" value={totalConv.toLocaleString()} color="green" />
        <Kpi label="综合ROI" value={overallROI.toFixed(2)} color={overallROI >= 1 ? 'green' : 'red'} />
        <Kpi label="平均CPA" value={`¥${overallCPA.toFixed(1)}`} color="blue" />
      </div>

      {/* 漏斗 */}
      <div className="bg-white rounded border border-slate-200 p-4">
        <h2 className="text-xs font-medium text-slate-500 uppercase mb-3">转化漏斗</h2>
        <div className="flex items-center gap-2 lg:gap-4">
          <FunnelStep label="展示" value={totalImp.toLocaleString()} />
          <span className="text-slate-300 text-lg">→</span>
          <FunnelStep label="点击" value={totalClick.toLocaleString()} />
          <span className="text-slate-300 text-lg">→</span>
          <FunnelStep label="转化" value={totalConv.toLocaleString()} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px] text-slate-400">
          <span>CTR: {(overallCTR*100).toFixed(2)}%</span>
          <span>CVR: {(overallCVR*100).toFixed(2)}%</span>
          <span>ROI: {overallROI.toFixed(2)}</span>
        </div>
      </div>

      {/* 平台对比 */}
      {platformStats.length > 0 && (
        <div className="bg-white rounded border border-slate-200 p-4">
          <h2 className="text-xs font-medium text-slate-500 uppercase mb-3">平台对比</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-3 py-2 font-medium text-slate-500">平台</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">计划</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">消耗</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">展示</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">转化</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">CPA</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-500">ROI</th>
                </tr>
              </thead>
              <tbody>
                {platformStats.map((ps: any) => (
                  <tr key={ps.name} className="border-b border-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-700">{ps.name}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{ps.count}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">¥{ps.spend.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">{ps.impressions.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">{ps.conversions}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">¥{ps.cpa.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span className={ps.roi >= 1 ? 'text-green-600' : 'text-red-400'}>{ps.roi.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 计划明细 — 可点击展开 */}
      <div className="bg-white rounded border border-slate-200 p-4">
        <h2 className="text-xs font-medium text-slate-500 uppercase mb-3">计划明细（点击展开详情）</h2>
        <div className="space-y-1">
          {all.map(c => {
            const m = metrics[c.id];
            const isOpen = expanded === c.id;
            const material = getMaterial(c.materialId);
            const audience = getAudience(c.audience);
            const statusLabels: Record<string, string> = { active: '投放中', paused: '已暂停', ended: '已结束' };
            const sc: Record<string, string> = { active: 'text-green-600', paused: 'text-yellow-600', ended: 'text-red-400' };

            return (
              <div key={c.id} className="border border-slate-100 rounded">
                {/* 摘要行 */}
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center px-3 py-2 hover:bg-slate-50 transition-colors text-left text-[11px]"
                >
                  <span className="w-4 text-slate-300 text-[10px]">{isOpen ? '▼' : '▶'}</span>
                  <span className="flex-1 font-medium text-slate-700">{c.name}</span>
                  <span className={`w-16 text-center ${sc[c.status]}`}>{statusLabels[c.status]}</span>
                  <span className="w-20 text-right font-mono text-slate-600">¥{m?.dailySpend.toFixed(0)||'0'}/¥{c.dailyBudget}</span>
                  <span className="w-16 text-right font-mono text-slate-700">{m?.conversions||'0'}转</span>
                  <span className="w-20 text-right font-mono">
                    <span className={(m?.roi||0)>=1?'text-green-600':'text-red-400'}>ROI {(m?.roi||0).toFixed(2)}</span>
                  </span>
                </button>

                {/* 展开详情 */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                      <div>
                        <div className="text-slate-400 mb-1">基础指标</div>
                        <div className="space-y-0.5 font-mono">
                          <div>展示 <span className="text-slate-700">{m?.impressions.toLocaleString()||0}</span></div>
                          <div>点击 <span className="text-slate-700">{m?.clicks.toLocaleString()||0}</span></div>
                          <div>转化 <span className="text-slate-700 font-medium">{m?.conversions||0}</span></div>
                          <div>今日消耗 <span className="text-slate-700">¥{m?.dailySpend.toFixed(0)||0}</span></div>
                          <div>累计消耗 <span className="text-slate-700">¥{m?.spend.toFixed(0)||0}</span></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">效率指标</div>
                        <div className="space-y-0.5 font-mono">
                          <div>CTR <span className="text-slate-700">{((m?.ctr||0)*100).toFixed(2)}%</span></div>
                          <div>CVR <span className="text-slate-700">{((m?.cvr||0)*100).toFixed(2)}%</span></div>
                          <div>CPA <span className="text-slate-700">¥{m?.cpa.toFixed(1)||'-'}</span></div>
                          <div>ROI <span className={(m?.roi||0)>=1?'text-green-600':'text-red-400'}>{(m?.roi||0).toFixed(2)}</span></div>
                          <div>eCPM <span className="text-slate-700">¥{m?.ecpm.toFixed(1)||0}</span></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">计划配置</div>
                        <div className="space-y-0.5">
                          <div>平台 <span className="text-slate-700">{getPlatformName(c.platform)}</span></div>
                          <div>出价 <span className="text-slate-700">{c.bidMode.toUpperCase()} ¥{c.bidPrice}</span></div>
                          <div>日预算 <span className="text-slate-700">¥{c.dailyBudget}</span></div>
                          <div>总预算 <span className="text-slate-700">¥{c.totalBudget}</span></div>
                          <div>学习阶段 <span className="text-slate-700">{
                            m?.learningStage==='cold_start'?'冷启动':m?.learningStage==='learning'?'学习中':m?.learningStage==='stable'?'稳定期':m?.learningStage==='fatigue'?'疲劳期':'—'
                          }</span></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">素材/人群</div>
                        <div className="space-y-0.5">
                          <div>素材 <span className="text-slate-700">{material?.name||c.materialId}</span></div>
                          <div>吸引力 <span className="text-slate-700">{material?.appeal||'—'}/100</span></div>
                          <div>人群 <span className="text-slate-700">{audience?.name||c.audience}</span></div>
                          <div>新鲜度 <span className="text-slate-700">{((m?.materialFreshness||1)*100).toFixed(0)}%</span></div>
                        </div>
                      </div>
                    </div>
                    {/* 日预算进度 */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>日预算进度</span><span>¥{m?.dailySpend.toFixed(0)||0} / ¥{c.dailyBudget}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width:`${Math.min(100,((m?.dailySpend||0)/c.dailyBudget*100))}%`}}/>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>总预算进度</span><span>¥{m?.spend.toFixed(0)||0} / ¥{c.totalBudget}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{width:`${Math.min(100,((m?.spend||0)/c.totalBudget*100))}%`}}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = { green: 'bg-green-50 border-green-200', red: 'bg-red-50 border-red-200', blue: 'bg-blue-50 border-blue-200', slate: 'bg-slate-50 border-slate-200' };
  return (
    <div className={`rounded border px-3 py-2.5 ${colors[color] || colors.slate}`}>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-base font-bold text-slate-800 font-mono">{value}</div>
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-lg lg:text-xl font-bold text-slate-800">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
