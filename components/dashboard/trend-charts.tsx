'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  time: number;
  label: string;
  spend: number;
  conversions: number;
  impressions: number;
  cpa: number;
  roi: number;
}

const MAX_POINTS = 30;
const tooltipStyle = { fontSize: 11, borderRadius: 8 };

export default function TrendCharts() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const isRunning = useGameStore(s => s.isRunning);
  const prevMetricsRef = useRef<Record<string, { spend: number; conv: number; imp: number; value: number }>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const campaigns = useCampaignStore.getState().campaigns || [];
      const metrics = useCampaignStore.getState().metrics || {};
      const active = campaigns.filter(c => c.status === 'active');
      setActiveCount(active.length);

      if (active.length === 0) return;

      // 计算当前时刻所有活跃计划的增量
      let deltaSpend = 0, deltaConv = 0, deltaImp = 0, deltaValue = 0;
      const prev = prevMetricsRef.current;

      for (const c of active) {
        const m = metrics[c.id];
        if (!m) continue;
        const p = prev[c.id] || { spend: 0, conv: 0, imp: 0, value: 0 };
        deltaSpend += (m.spend || 0) - p.spend;
        deltaConv += (m.conversions || 0) - p.conv;
        deltaImp += (m.impressions || 0) - p.imp;
        deltaValue += (m.conversionValue || 0) - p.value;
        prev[c.id] = { spend: m.spend || 0, conv: m.conversions || 0, imp: m.impressions || 0, value: m.conversionValue || 0 };
      }

      // 没有新数据就跳过
      if (deltaSpend <= 0 && deltaConv <= 0 && deltaImp <= 0) return;

      setDataPoints(prev => {
        const t = Date.now();
        const next: DataPoint = {
          time: t,
          label: new Date(t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          spend: deltaSpend,
          conversions: deltaConv,
          impressions: deltaImp,
          cpa: deltaConv > 0 ? +(deltaSpend / deltaConv).toFixed(1) : 0,
          roi: deltaSpend > 0 ? +(deltaValue / deltaSpend).toFixed(2) : 0,
        };
        return [...prev.slice(-(MAX_POINTS - 1)), next];
      });
    }, isRunning ? 1500 : 3000);

    return () => clearInterval(interval);
  }, [isRunning]);

  if (activeCount === 0 && dataPoints.length === 0) return null;

  if (dataPoints.length < 2) {
    return (
      <div className="bg-white rounded border border-slate-200 p-4">
        <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">📈 实时趋势</h3>
        <div className="text-center py-10 text-[11px] text-slate-400">
          <p>📡 正在采集数据...</p>
          <p className="mt-1 text-slate-300">
            {isRunning ? '模拟运行中，几秒后开始绘制' : '点击顶栏速度按钮启动模拟'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">
        📈 实时趋势 · 近 {dataPoints.length} 个采样点
        {isRunning && <span className="text-green-500 ml-1 text-[10px]">● 采集中</span>}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 消耗 + 转化 */}
        <div>
          <h4 className="text-[10px] text-slate-400 mb-1.5">消耗 & 转化</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={Math.max(1, Math.floor(dataPoints.length / 6))} />
              <YAxis yAxisId="left" tick={{ fontSize: 8 }} tickFormatter={(v: any) => `¥${v}`} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} width={20} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" radius={[2, 2, 0, 0]} name="消耗 ¥" />
              <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} name="转化" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CPA */}
        <div>
          <h4 className="text-[10px] text-slate-400 mb-1.5">CPA</h4>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={Math.max(1, Math.floor(dataPoints.length / 6))} />
              <YAxis tick={{ fontSize: 8 }} tickFormatter={(v: any) => `¥${v}`} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cpa" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="CPA ¥" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROI */}
        <div>
          <h4 className="text-[10px] text-slate-400 mb-1.5">ROI</h4>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={Math.max(1, Math.floor(dataPoints.length / 6))} />
              <YAxis tick={{ fontSize: 8 }} width={35} domain={[0, 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="roi" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} name="ROI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 展示量 */}
        <div>
          <h4 className="text-[10px] text-slate-400 mb-1.5">展示量</h4>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={Math.max(1, Math.floor(dataPoints.length / 6))} />
              <YAxis tick={{ fontSize: 8 }} tickFormatter={(v: any) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="impressions" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.08} strokeWidth={2} name="展示量" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
