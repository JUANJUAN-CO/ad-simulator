'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useCampaignStore, DailySnapshot } from '@/lib/store/campaign-store';

/** 每日报告 — 跨天时弹出昨日数据总结 */
export default function DailyReport() {
  const simDays = useGameStore(s => s.simDays);
  const campaigns = useCampaignStore(s => s.campaigns);
  const dailySnapshots = useCampaignStore(s => s.dailySnapshots);
  const [show, setShow] = useState(false);
  const [report, setReport] = useState<{
    day: number;
    totalSpend: number;
    totalConv: number;
    totalImp: number;
    totalValue: number;
    activeCount: number;
    bestROI: number;
    bestCPA: number;
  } | null>(null);

  useEffect(() => {
    if (simDays <= 0) return;
    const yesterday = simDays - 1;

    // 收集昨日所有计划的快照数据
    let totalSpend = 0, totalConv = 0, totalImp = 0, totalValue = 0;
    let activeCount = 0, bestROI = 0, bestCPA = Infinity;

    for (const c of campaigns) {
      const snap = dailySnapshots[c.id]?.[yesterday];
      if (!snap) continue;
      // 用快照数据（当天结束时的累计 - 前一天结束时的累计）
      const prevSnap = dailySnapshots[c.id]?.[yesterday - 1];
      const daySpend = snap.spend - (prevSnap?.spend || 0);
      const dayConv = snap.conversions - (prevSnap?.conversions || 0);
      const dayImp = snap.impressions - (prevSnap?.impressions || 0);
      const dayValue = snap.conversionValue - (prevSnap?.conversionValue || 0);

      if (daySpend > 0) {
        activeCount++;
        totalSpend += daySpend;
        totalConv += dayConv;
        totalImp += dayImp;
        totalValue += dayValue;
        const roi = daySpend > 0 ? dayValue / daySpend : 0;
        const cpa = dayConv > 0 ? daySpend / dayConv : Infinity;
        if (roi > bestROI) bestROI = roi;
        if (cpa < bestCPA) bestCPA = cpa;
      }
    }

    if (totalSpend > 0) {
      setReport({
        day: yesterday + 1,
        totalSpend, totalConv, totalImp, totalValue,
        activeCount, bestROI,
        bestCPA: bestCPA === Infinity ? 0 : bestCPA,
      });
      setShow(true);
    }
  }, [simDays]);

  if (!show || !report) return null;

  const overallROI = report.totalSpend > 0 ? report.totalValue / report.totalSpend : 0;
  const overallCPA = report.totalConv > 0 ? report.totalSpend / report.totalConv : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShow(false)}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">📊 第 {report.day} 天 · 日报</h2>
              <p className="text-xs text-blue-200 mt-0.5">昨日投放数据总结</p>
            </div>
            <span className="text-3xl">
              {overallROI >= 2 ? '🔥' : overallROI >= 1 ? '👍' : '📉'}
            </span>
          </div>
        </div>

        {/* KPI 网格 */}
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <ReportKpi label="昨日消耗" value={`¥${report.totalSpend.toFixed(0)}`} />
            <ReportKpi label="活跃计划" value={`${report.activeCount} 条`} />
            <ReportKpi label="转化数" value={report.totalConv.toString()} highlight="green" />
            <ReportKpi label="展示量" value={report.totalImp >= 1000 ? `${(report.totalImp / 1000).toFixed(0)}K` : report.totalImp.toString()} />
            <ReportKpi label="综合 ROI" value={overallROI.toFixed(2)} highlight={overallROI >= 1 ? 'green' : 'red'} />
            <ReportKpi label="平均 CPA" value={`¥${overallCPA.toFixed(1)}`} highlight={overallCPA < 10 ? 'green' : 'default'} />
          </div>

          {/* 最佳记录 */}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-slate-500">
              最佳 ROI <span className="text-green-600 font-bold">{report.bestROI.toFixed(2)}</span>
              {' · '}
              最低 CPA <span className="text-blue-600 font-bold">¥{report.bestCPA.toFixed(1)}</span>
            </p>
          </div>

          <button
            onClick={() => setShow(false)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            知道了，继续投放
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportKpi({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  const colorClass = highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-500' : '';
  return (
    <div className="bg-slate-50 rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${colorClass || 'text-slate-800'}`}>{value}</div>
    </div>
  );
}
