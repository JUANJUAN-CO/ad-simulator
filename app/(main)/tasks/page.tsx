'use client';

import { useState, useMemo } from 'react';
import { useGameStore, CAREER_STAGES } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { MISSIONS } from '@/lib/data/missions';
import MentorReview from '@/components/mentor/mentor-review';
import { MissionCondition } from '@/lib/engine/types';

// 难度可视化配置
const DIFFICULTY = {
  tutorial: { label: '引导', icon: '🌱', stars: '☆', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400', level: 0, desc: '秒完成·纯操作' },
  easy:     { label: '入门', icon: '⭐', stars: '★', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-400', level: 1, desc: '需判断·分钟完成' },
  medium:   { label: '进阶', icon: '⭐', stars: '★★', color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400', level: 2, desc: '需分析·数据驱动' },
  hard:     { label: '挑战', icon: '💎', stars: '★★★', color: 'bg-orange-50 border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400', level: 3, desc: '需策略·跨平台' },
  expert:   { label: '专家', icon: '👑', stars: '★★★★', color: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', bar: 'bg-red-400', level: 4, desc: '需精通·长期经营' },
} as const;

type DiffKey = keyof typeof DIFFICULTY;
const DIFF_ORDER: DiffKey[] = ['tutorial', 'easy', 'medium', 'hard', 'expert'];

export default function TasksPage() {
  const { careerStage, completedMissions, activeMissionIds, completeMission, acceptMission, updateStats } = useGameStore();
  const { campaigns, metrics } = useCampaignStore();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [diffFilter, setDiffFilter] = useState<DiffKey | 'all'>('all');
  const [showReview, setShowReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<'success' | 'failure'>('success');
  const [reviewMissionId, setReviewMissionId] = useState('');
  const [reviewDifficulty, setReviewDifficulty] = useState('');

  const diffOrder: Record<string, number> = { tutorial:0, easy:1, medium:2, hard:3, expert:4 };
  const allMissions = useMemo(() =>
    MISSIONS.filter(m => m.stageRequired <= careerStage)
      .sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]),
  [careerStage]);

  // 分 tab 列表 + 难度筛选
  const availableList = allMissions.filter(m => !completedMissions.includes(m.id) && !activeMissionIds.includes(m.id));
  const activeList = allMissions.filter(m => activeMissionIds.includes(m.id));
  const doneList = allMissions.filter(m => completedMissions.includes(m.id));
  const displayed = (activeTab === 'available' ? availableList : activeTab === 'active' ? activeList : doneList)
    .filter(m => diffFilter === 'all' || m.difficulty === diffFilter);

  // 各难度统计
  const diffStats: Record<string, { total: number; done: number; active: number }> = {};
  for (const d of DIFF_ORDER) {
    const ms = allMissions.filter(m => m.difficulty === d);
    diffStats[d] = { total: ms.length, done: doneList.filter(m => m.difficulty === d).length, active: activeList.filter(m => m.difficulty === d).length };
  }

  /** 检查条件 */
  function checkCondition(cond: MissionCondition): { met: boolean; current: number; target: number; label: string } {
    const targetPlatforms = cond.platform ? [cond.platform] : null;
    const rel = targetPlatforms ? campaigns.filter(c => targetPlatforms.includes(c.platform)) : campaigns;
    let current = 0, label = '';
    switch (cond.type) {
      case 'conversions': current = rel.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0); label = '转化数'; break;
      case 'plan_count': current = campaigns.length; label = '计划数'; break;
      case 'platform_count': current = new Set(campaigns.map(c => c.platform)).size; label = '平台数'; break;
      case 'roi': { const sp = rel.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0); const v = rel.reduce((s, c) => s + (metrics[c.id]?.conversionValue || 0), 0); current = sp > 0 ? v / sp : 0; label = 'ROI'; break; }
      case 'cpa': { const cv = rel.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0); const sp = rel.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0); current = cv > 0 ? sp / cv : Infinity; label = 'CPA(元)'; break; }
      case 'budget_spent': current = campaigns.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0); label = '消耗(元)'; break;
      case 'ctr': { const imp = rel.reduce((s, c) => s + (metrics[c.id]?.impressions || 0), 0); const clk = rel.reduce((s, c) => s + (metrics[c.id]?.clicks || 0), 0); current = imp > 0 ? clk / imp : 0; label = 'CTR'; break; }
      case 'cvr': { const clk = rel.reduce((s, c) => s + (metrics[c.id]?.clicks || 0), 0); const cv = rel.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0); current = clk > 0 ? cv / clk : 0; label = 'CVR'; break; }
      default: current = 0; label = cond.type;
    }
    let met = false;
    if (cond.operator === 'gte') met = current >= cond.value;
    else if (cond.operator === 'lte') met = current <= cond.value;
    else if (cond.operator === 'eq') met = current === cond.value;
    return { met, current, target: cond.value, label };
  }

  function checkAll(conditions: MissionCondition[]) {
    const results = conditions.map(c => checkCondition(c));
    return { allMet: results.every(r => r.met), results };
  }

  const handleAccept = (missionId: string) => {
    const ok = acceptMission(missionId);
    if (ok) setActiveTab('active');
  };
  const handleSubmit = (missionId: string, difficulty: string) => {
    const mission = allMissions.find(m => m.id === missionId);
    if (!mission) return;
    const { allMet } = checkAll(mission.conditions);
    if (allMet) { completeMission(missionId, mission.rewards); setReviewResult('success'); }
    else setReviewResult('failure');
    setReviewMissionId(missionId); setReviewDifficulty(difficulty); setShowReview(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-base font-bold text-slate-800">任务中心</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {CAREER_STAGES[careerStage - 1]?.title} · {completedMissions.length}/{allMissions.length} 完成 · {useGameStore.getState().exp} EXP
        </p>
      </div>

      {/* 难度递进条 */}
      <div className="bg-white rounded border border-slate-200 p-3">
        <div className="flex items-center gap-2">
          {DIFF_ORDER.map((d, i) => {
            const cfg = DIFFICULTY[d];
            const stat = diffStats[d];
            const done = stat.done === stat.total && stat.total > 0;
            return (
              <div key={d} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setDiffFilter(diffFilter === d ? 'all' : d)}
                  className={`flex-1 rounded-lg p-2 border transition-all ${
                    diffFilter === d ? `${cfg.color} shadow-sm scale-105` :
                    done ? 'bg-green-50 border-green-200 opacity-60' :
                    'bg-slate-50 border-slate-100 opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg">{cfg.icon}</div>
                    <div className="text-[11px] font-bold mt-0.5">{cfg.label}</div>
                    <div className="text-[10px] text-slate-400">{cfg.stars}</div>
                    <div className="text-[9px] text-slate-400">{stat.done}/{stat.total}</div>
                  </div>
                </button>
                {i < 4 && <span className="text-slate-200">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 选项卡 + 统计 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white rounded border border-slate-200 p-0.5">
          {(['available', 'active', 'completed'] as const).map(tab => {
            const counts = { available: allMissions.filter(m => !completedMissions.includes(m.id) && !activeMissionIds.includes(m.id)).length, active: activeMissionIds.length, completed: completedMissions.length };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === 'available' ? `🔓 可接取 ${counts[tab]}` : tab === 'active' ? `📋 进行中 ${counts[tab]}` : `✅ 已完成 ${counts[tab]}`}
              </button>
            );
          })}
        </div>
        {diffFilter !== 'all' && (
          <button onClick={() => setDiffFilter('all')} className="text-xs text-blue-500 hover:underline">
            清除难度筛选
          </button>
        )}
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded border border-slate-200">
            <div className="text-3xl mb-2">{activeTab === 'available' ? '🎉' : activeTab === 'active' ? '📋' : '🏆'}</div>
            <p className="text-sm text-slate-400">
              {activeTab === 'available' ? '当前难度没有可接取的任务' : activeTab === 'active' ? '没有进行中的任务' : '还没有完成任何任务'}
            </p>
          </div>
        ) : (
          displayed.map(mission => {
            const cfg = DIFFICULTY[mission.difficulty as DiffKey] || DIFFICULTY.tutorial;
            const isActive = activeMissionIds.includes(mission.id);
            const { allMet, results } = isActive ? checkAll(mission.conditions) : { allMet: false, results: [] };

            return (
              <div key={mission.id} className={`bg-white rounded border-2 transition-all ${isActive ? 'border-blue-200 shadow-sm' : cfg.color.includes('border-') ? cfg.color : 'border-slate-200'}`}>
                {/* 难度条 */}
                <div className={`h-1 rounded-t ${cfg.bar}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                          {cfg.icon} {cfg.label} {cfg.stars}
                        </span>
                        <span className="text-[10px] text-slate-400">{cfg.desc}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">{mission.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{mission.description}</p>
                    </div>
                    <div className="text-right ml-3 text-xs">
                      <div className="text-amber-600 font-bold">+{mission.rewards.exp} EXP</div>
                      <div className="text-slate-400">+{mission.rewards.money} ¥</div>
                      {mission.rewards.title && <div className="text-purple-500 text-[10px] mt-0.5">🏅{mission.rewards.title}</div>}
                    </div>
                  </div>

                  {isActive && results.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {results.map((r, i) => {
                        const pct = r.target > 0 ? Math.min(100, (r.current / r.target) * 100) : 0;
                        const cond = mission.conditions[i];
                        const isROI = cond?.type === 'roi';
                        const isCPA = cond?.type === 'cpa';
                        const dc = isROI ? r.current.toFixed(2) : isCPA ? (r.current === Infinity ? '∞' : r.current.toFixed(1)) : Math.floor(r.current).toString();
                        const dt = isROI ? r.target.toFixed(2) : isCPA ? r.target.toFixed(1) : r.target.toString();
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className={r.met ? 'text-green-500' : 'text-slate-300'}>{r.met ? '✅' : '⬜'}</span>
                            <span className="text-slate-500 w-14">{r.label}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${r.met ? 'bg-green-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`font-mono w-20 text-right ${r.met ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                              {dc} / {dt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    {activeTab === 'available' && (
                      <button onClick={() => handleAccept(mission.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                        📋 接取
                      </button>
                    )}
                    {activeTab === 'active' && (
                      <button onClick={() => handleSubmit(mission.id, mission.difficulty)}
                        disabled={!allMet}
                        className={`px-3 py-1 text-xs rounded transition-colors ${allMet ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                        {allMet ? '✅ 提交完成' : '🔒 条件未满足'}
                      </button>
                    )}
                    <div className="p-2 bg-slate-50 rounded flex-1 text-[10px] text-slate-500">
                      💡 {mission.mentorHint.slice(0, 80)}{mission.mentorHint.length > 80 ? '...' : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MentorReview show={showReview} missionId={reviewMissionId} difficulty={reviewDifficulty} result={reviewResult} onClose={() => setShowReview(false)} />
    </div>
  );
}
