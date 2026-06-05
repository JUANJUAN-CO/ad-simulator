'use client';

import { useGameStore, CAREER_STAGES } from '@/lib/store/game-store';
import { MENTORS } from '@/lib/data/mentors';
import { PLATFORMS } from '@/lib/engine/platforms';
import { useAchievementStore, ACHIEVEMENTS } from '@/lib/store/achievement-store';
import Leaderboard from '@/components/career/leaderboard';
import { useMemo } from 'react';

export default function CareerPage() {
  const { careerStage, exp, simDays, stats, completedMissions } = useGameStore();
  const unlockedAchievements = useAchievementStore(s => s.unlocked);

  const currentStage = CAREER_STAGES[careerStage - 1];
  const mentor = MENTORS[currentStage?.mentorId || 'laowang'];

  const achievementsByCategory = useMemo(() => {
    const cats: Record<string, typeof ACHIEVEMENTS> = {};
    for (const a of ACHIEVEMENTS) {
      if (!cats[a.category]) cats[a.category] = [];
      cats[a.category].push(a);
    }
    return cats;
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">职业成长</h1>
        <p className="text-sm text-slate-500 mt-1">第 {simDays + 1} 天 · 已完成 {completedMissions.length} 个任务</p>
      </div>

      {/* 当前导师 */}
      {mentor && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{mentor.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-800">{mentor.name}</h2>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                  {mentor.title}
                </span>
              </div>
              <p className="text-sm text-slate-500">{mentor.personality}</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 italic">&ldquo;{mentor.greeting}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 阶段时间线 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">职业路径</h2>
        <div className="space-y-0">
          {CAREER_STAGES.map((stage, i) => {
            const isCurrent = stage.stage === careerStage;
            const isCompleted = careerStage > stage.stage;
            const isLocked = careerStage < stage.stage;

            return (
              <div key={stage.stage} className="flex gap-4">
                {/* 时间线 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isCompleted ? 'bg-green-100' :
                    isCurrent ? 'bg-blue-600 text-white' :
                    'bg-slate-100'
                  }`}>
                    {isCompleted ? '✅' : isCurrent ? stage.stage : '🔒'}
                  </div>
                  {i < CAREER_STAGES.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[60px] ${
                      isCompleted ? 'bg-green-300' : 'bg-slate-200'
                    }`} />
                  )}
                </div>

                {/* 内容 */}
                <div className={`flex-1 pb-6 ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                      {stage.title}
                    </h3>
                    <span className="text-xs text-slate-400">{stage.subtitle}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{stage.description}</p>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">
                      💰 日预算上限：{stage.dailyBudgetCap === Infinity ? '无限制' : `${stage.dailyBudgetCap.toLocaleString()} ¥`}
                    </div>
                    <div className="text-xs text-slate-400">
                      📊 经验需求：{stage.expRequired === Infinity ? '无限制（无尽模式）' : `${stage.expRequired.toLocaleString()} EXP`}
                    </div>
                    <div className="text-xs text-slate-400">
                      🏢 可用平台：{stage.availablePlatforms.map(p => PLATFORMS[p]?.name || p).join('、')}
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-400 mb-1">
                        经验进度：{exp} / {stage.expRequired === Infinity ? '∞' : stage.expRequired}
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden max-w-xs">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                          style={{
                            width: `${stage.expRequired === Infinity ? 100 : Math.min(100, (exp / stage.expRequired) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 生涯统计 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">生涯成就</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Achievement icon="💰" label="累计消耗" value={`${stats.totalSpend.toLocaleString()} ¥`} />
          <Achievement icon="✅" label="累计转化" value={stats.totalConversions.toLocaleString()} />
          <Achievement icon="👁" label="累计展示" value={stats.totalImpressions.toLocaleString()} />
          <Achievement icon="🏆" label="最佳ROI" value={stats.bestROI.toFixed(2)} />
          <Achievement icon="📋" label="创建计划" value={`${stats.campaignsCreated} 条`} />
          <Achievement icon="🎯" label="完成任务" value={`${stats.missionsCompleted} 个`} />
          <Achievement icon="📅" label="经营天数" value={`${stats.daysPlayed} 天`} />
          <Achievement icon="💵" label="最低CPA" value={`${stats.bestCPA.toFixed(1)} ¥`} />
        </div>
      </div>

      {/* 成就徽章墙 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">🏅 成就徽章</h2>
          <span className="text-xs text-slate-400">
            {unlockedAchievements.length} / {ACHIEVEMENTS.length} 解锁
          </span>
        </div>

        {Object.entries(achievementsByCategory).map(([cat, achievements]) => {
          const catNames: Record<string, string> = {
            milestone: '📊 里程碑', skill: '🎯 技能', challenge: '⚔️ 挑战', secret: '🔮 隐藏',
          };
          const unlocked = achievements.filter(a => unlockedAchievements.includes(a.id));
          return (
            <div key={cat} className="mb-4 last:mb-0">
              <h3 className="text-xs font-medium text-slate-500 mb-2">{catNames[cat] || cat} ({unlocked.length}/{achievements.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {achievements.map(a => {
                  const isUnlocked = unlockedAchievements.includes(a.id);
                  return (
                    <div key={a.id}
                      className={`rounded-lg p-2.5 text-center border transition-all ${
                        isUnlocked ? 'bg-white border-green-300 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'
                      }`}
                    >
                      <div className={`text-2xl mb-1 ${isUnlocked ? '' : 'grayscale'}`}>
                        {isUnlocked ? a.icon : '🔒'}
                      </div>
                      <div className={`text-[10px] font-medium ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                        {isUnlocked ? a.name : '???'}
                      </div>
                      {isUnlocked && a.reward && (
                        <div className="text-[9px] text-purple-500 mt-0.5">🏅{a.reward}</div>
                      )}
                      {isUnlocked && (
                        <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{a.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 排行榜 */}
      <Leaderboard />
    </div>
  );
}

function Achievement({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
