'use client';

import { useGameStore } from '@/lib/store/game-store';
import { CAREER_STAGES } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import SpeedControl from './speed-control';
import SimTime from './sim-time';

export default function Topbar() {
  const careerStage = useGameStore(s => s.careerStage);
  const exp = useGameStore(s => s.exp);
  const freeMoney = useGameStore(s => s.freeMoney);
  const campaigns = useCampaignStore(s => s.campaigns);
  const metrics = useCampaignStore(s => s.metrics);
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const currentStage = CAREER_STAGES[careerStage - 1];

  // 总预算汇总
  const totalBudgetAll = campaigns.filter(c => c.status !== 'ended').reduce((s, c) => s + c.totalBudget, 0);
  const totalSpentAll = campaigns.filter(c => c.status !== 'ended').reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0);
  const totalRemaining = totalBudgetAll - totalSpentAll;

  return (
    <header className="h-10 lg:h-12 bg-white border-b border-slate-200 flex items-center justify-between px-2 lg:px-5 fixed top-0 lg:left-[200px] left-0 right-0 z-20">
      {/* 左侧 */}
      <div className="flex items-center gap-1 lg:gap-4">
        <SpeedControl />
        <div className="hidden lg:block w-px h-4 bg-slate-200" />
        <div className="hidden sm:block"><SimTime /></div>
        <div className="text-[10px] lg:text-xs text-slate-400">
          <span className="text-slate-700 font-medium">{activeCount}</span> 活跃
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-1 lg:gap-4">
        {totalBudgetAll > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] lg:text-xs">
            <span className="text-slate-400">预算</span>
            <span className={`font-mono font-semibold ${totalRemaining < totalBudgetAll * 0.1 ? 'text-red-500' : 'text-slate-800'}`}>
              ¥{totalRemaining.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[10px] lg:text-xs">
          <span className="text-slate-400 hidden sm:inline">余额</span>
          <span className="font-mono font-semibold text-slate-800">¥{freeMoney.toLocaleString()}</span>
        </div>
        <div className="text-[10px] lg:text-xs text-slate-500">{currentStage?.title}</div>
      </div>
    </header>
  );
}
