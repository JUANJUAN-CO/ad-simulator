'use client';

import { useMemo } from 'react';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useGameStore } from '@/lib/store/game-store';
import { getSimulationEngine } from '@/lib/engine/ticker';
import { PLATFORMS, getPlatformName } from '@/lib/engine/platforms';
import { getActiveEvents } from '@/lib/data/events';
import { Platform } from '@/lib/engine/types';
import { useEffect, useState } from 'react';

interface PlatformCompetition {
  platformId: Platform;
  name: string;
  group: string;
  intensity: number;       // 0-1
  activeCount: number;
  totalCount: number;
  avgBid: number;
  myCampaigns: number;
  myActive: number;
}

function getIntensityLabel(intensity: number): { label: string; color: string; bg: string } {
  if (intensity >= 0.8) return { label: '🔥 白热化', color: 'text-red-600', bg: 'bg-red-500' };
  if (intensity >= 0.6) return { label: '⚡ 激烈', color: 'text-orange-600', bg: 'bg-orange-500' };
  if (intensity >= 0.4) return { label: '📊 适中', color: 'text-yellow-600', bg: 'bg-yellow-500' };
  return { label: '🍃 宽松', color: 'text-green-600', bg: 'bg-green-500' };
}

export default function CompetitionPanel() {
  const campaigns = useCampaignStore(s => s.campaigns);
  const simDays = useGameStore(s => s.simDays);
  const currentTime = useGameStore(s => s.currentTime);
  const [refreshKey, setRefreshKey] = useState(0);

  // 每 3 秒刷新竞争数据
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey(k => k + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const platformData = useMemo(() => {
    try {
      const engine = getSimulationEngine();
      const date = new Date(currentTime || Date.now());
      const month = date.getMonth() + 1;
      const dayOfMonth = date.getDate();
      const activeEvents = getActiveEvents(month, dayOfMonth);

      const results: PlatformCompetition[] = [];
      const myPlatforms = new Set((campaigns || []).map(c => c.platform));

      const platformsToShow = Object.keys(PLATFORMS).filter(p => {
        const hasMyCampaigns = (campaigns || []).some(c => c.platform === p);
        return hasMyCampaigns || myPlatforms.size === 0;
      }).slice(0, 8);

      for (const pid of platformsToShow) {
        try {
          const comp = engine.getCompetitors(pid);
          if (!comp) continue;
          const allCompetitors = comp.getAll?.() || [];
          const active = comp.getActive?.() || [];
          const myCamps = (campaigns || []).filter(c => c.platform === pid);
          const platformCfg = PLATFORMS[pid];
          if (!platformCfg) continue;

          results.push({
            platformId: pid,
            name: getPlatformName(pid),
            group: platformCfg.group || '',
            intensity: comp.getIntensity?.() || 0,
            activeCount: active.length,
            totalCount: allCompetitors.length,
            avgBid: Math.round(comp.getAverageBid?.() || 0),
            myCampaigns: myCamps.length,
            myActive: myCamps.filter(c => c.status === 'active').length,
          });
        } catch (_) { /* skip this platform */ }
      }

      return {
        platforms: results.sort((a, b) => b.intensity - a.intensity),
        activeEvents: activeEvents || [],
      };
    } catch (_) {
      return { platforms: [], activeEvents: [] };
    }
  }, [campaigns, currentTime, refreshKey]);

  if (platformData.platforms.length === 0) return null;

  const overallIntensity = platformData.platforms.reduce((s, p) => s + p.intensity, 0) / platformData.platforms.length;
  const overallLabel = getIntensityLabel(overallIntensity);

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-slate-500 uppercase">⚔️ 竞争态势</h3>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${overallLabel.color}`}>
            {overallLabel.label}
          </span>
          {/* 整体强度条 */}
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overallLabel.bg}`}
              style={{ width: `${overallIntensity * 100}%` }}
            />
          </div>
          {platformData.activeEvents.length > 0 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              🔥 {platformData.activeEvents[0].name}进行中
            </span>
          )}
        </div>
      </div>

      {/* 平台竞争卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {platformData.platforms.map(p => {
          const label = getIntensityLabel(p.intensity);
          return (
            <div key={p.platformId} className="border border-slate-100 rounded-lg p-2.5 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-700 truncate">{p.name}</span>
                <span className="text-[9px] text-slate-400">{p.group}</span>
              </div>

              {/* 竞争强度条 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${label.bg}`}
                    style={{ width: `${p.intensity * 100}%` }}
                  />
                </div>
                <span className={`text-[9px] font-medium ${label.color}`}>
                  {Math.round(p.intensity * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">竞品</span>
                  <span className="text-slate-600 font-mono">
                    {p.activeCount}/{p.totalCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">均价</span>
                  <span className="text-slate-600 font-mono">¥{p.avgBid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">我的</span>
                  <span className="text-slate-600 font-mono">
                    {p.myActive}/{p.myCampaigns}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">状态</span>
                  <span className={label.color}>{label.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 提示 */}
      {platformData.activeEvents.length > 0 && (
        <div className="mt-2 p-2 bg-amber-50 rounded text-[10px] text-amber-700">
          💡 大促期间竞争激烈，CPM 价格上涨。建议提前提价以保证曝光量，或等大促结束后再投放。
        </div>
      )}
    </div>
  );
}
