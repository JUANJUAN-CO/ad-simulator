'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useClientStore } from '@/lib/store/client-store';

const DIFF_STYLES: Record<string, { badge: string; border: string }> = {
  easy: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
  medium: { badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-300' },
  hard: { badge: 'bg-orange-100 text-orange-700', border: 'border-orange-300' },
  expert: { badge: 'bg-red-100 text-red-700', border: 'border-red-300' },
};

const INDUSTRY_NAMES: Record<string, string> = {
  ecommerce: '电商', education: '教育', local_services: '本地服务', gaming: '游戏',
  finance: '金融', beauty: '美妆', health: '健康', home: '家居', travel: '旅游', food: '食品',
};

export default function ClientOffer() {
  const simDays = useGameStore(s => s.simDays);
  const careerStage = useGameStore(s => s.careerStage);
  const { activeBriefs, generateOffer, acceptBrief, dismissBrief, lastOfferDay } = useClientStore();

  // 每 3 天有 40% 概率来新客户
  useEffect(() => {
    if (simDays - lastOfferDay >= 3 && Math.random() < 0.4) {
      generateOffer(careerStage, simDays);
    }
  }, [simDays, careerStage, lastOfferDay, generateOffer]);

  const pending = activeBriefs.filter(b => b.status === 'pending');
  const accepted = activeBriefs.filter(b => b.status === 'accepted');

  return (
    <>
      {/* 待接取的客户 */}
      {pending.map(brief => {
        const ds = DIFF_STYLES[brief.difficulty] || DIFF_STYLES.easy;
        return (
          <div key={brief.id} className={`bg-white rounded border-2 ${ds.border} p-4 shadow-sm animate-pulse`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">🆕 新客户来了！</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ds.badge}`}>
                      {brief.difficulty === 'easy' ? '⭐' : brief.difficulty === 'medium' ? '⭐⭐' : brief.difficulty === 'hard' ? '💎' : '👑'}
                      {brief.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {brief.companyName} · {brief.contactName} · {INDUSTRY_NAMES[brief.industry]}
                  </p>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-700 mb-1">{brief.title}</h4>
            <p className="text-[11px] text-slate-500 mb-2">{brief.brief}</p>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-3">
              <div className="flex justify-between"><span className="text-slate-400">预算</span><span className="font-mono text-slate-700">¥{brief.budget.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">期限</span><span className="font-mono text-slate-700">{brief.deadlineDays} 天</span></div>
              <div className="flex justify-between"><span className="text-slate-400">目标CPA</span><span className="font-mono text-slate-700">≤¥{brief.targetCPA}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">目标ROI</span><span className="font-mono text-slate-700">≥{brief.targetROI.toFixed(1)}</span></div>
            </div>

            {brief.constraints.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {brief.constraints.map((c, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{c}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-600">💰 奖励: +{brief.rewards.exp}EXP +¥{brief.rewards.money}{brief.rewards.title ? ` +${brief.rewards.title}` : ''}</span>
              <span className="text-[10px] text-red-400 ml-auto">失败扣 ¥{brief.penalty.money}</span>
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => acceptBrief(brief.id, simDays)}
                className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors">
                ✅ 接单
              </button>
              <button onClick={() => dismissBrief(brief.id)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs rounded transition-colors">
                拒绝
              </button>
            </div>
          </div>
        );
      })}

      {/* 进行中的客户 */}
      {accepted.map(brief => {
        const daysLeft = brief.deadlineDays - (simDays - brief.acceptedAtDay);
        const urgent = daysLeft <= 1;
        const ds = DIFF_STYLES[brief.difficulty] || DIFF_STYLES.easy;
        return (
          <div key={brief.id} className={`bg-white rounded border ${urgent ? 'border-red-300 bg-red-50/30 animate-pulse' : 'border-slate-200'} p-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏢</span>
                <div>
                  <div className="text-[11px] font-semibold text-slate-700">{brief.title}</div>
                  <div className="text-[10px] text-slate-400">{brief.companyName} · {INDUSTRY_NAMES[brief.industry]}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-mono font-bold ${urgent ? 'text-red-600' : 'text-slate-600'}`}>
                  {urgent ? '⚡' : '📅'} {daysLeft} / {brief.deadlineDays} 天
                </span>
                <div className="text-[9px] text-slate-400">
                  CPA≤¥{brief.targetCPA} ROI≥{brief.targetROI}
                </div>
              </div>
            </div>
            {urgent && (
              <p className="text-[10px] text-red-600 mt-1">⚠️ 即将截止！请检查是否满足条件。</p>
            )}
          </div>
        );
      })}
    </>
  );
}
