'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useAchievementStore, ACHIEVEMENTS } from '@/lib/store/achievement-store';

// 综合评分 = 消耗*0.3 + 转化*0.4 + ROI*100*0.2 + 完成任务*50*0.1
function calcScore(
  totalSpend: number, totalConv: number, bestROI: number,
  missionsDone: number, achievements: number,
): number {
  return Math.round(
    totalSpend * 0.0003 +
    totalConv * 0.4 +
    bestROI * 10 +
    missionsDone * 50 +
    achievements * 30,
  );
}

interface LeaderboardEntry {
  name: string;
  score: number;
  stage: string;
  days: number;
  achievements: number;
  updatedAt: number;
}

export function saveToLeaderboard() {
  try {
    const state = useGameStore.getState();
    const campaigns = useCampaignStore.getState().campaigns;
    const metrics = useCampaignStore.getState().metrics;
    const achievements = useAchievementStore.getState().unlocked.length;

    const totalSpend = campaigns.reduce((s, c) => s + (metrics[c.id]?.spend || 0), 0);
    const totalConv = campaigns.reduce((s, c) => s + (metrics[c.id]?.conversions || 0), 0);
    const bestROI = campaigns.reduce((best, c) => Math.max(best, metrics[c.id]?.roi || 0), 0);

    const stages = ['投放助理', '独立优化师', '高级优化师', '投放总监'];
    const entry: LeaderboardEntry = {
      name: state.saves.find(s => s.id === state.activeSaveId)?.name || '匿名投手',
      score: calcScore(totalSpend, totalConv, bestROI, state.completedMissions.length, achievements),
      stage: stages[state.careerStage - 1] || '未知',
      days: state.simDays,
      achievements,
      updatedAt: Date.now(),
    };

    const existing = JSON.parse(localStorage.getItem('ad-simulator-leaderboard') || '[]') as LeaderboardEntry[];
    const idx = existing.findIndex(e => e.name === entry.name);
    if (idx >= 0) {
      if (entry.score > existing[idx].score) existing[idx] = entry;
    } else {
      existing.push(entry);
    }
    existing.sort((a, b) => b.score - a.score);
    localStorage.setItem('ad-simulator-leaderboard', JSON.stringify(existing.slice(0, 50)));
  } catch (_) {}
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('ad-simulator-leaderboard') || '[]');
  } catch {
    return [];
  }
}

export default function Leaderboard() {
  const entries = useMemo(() => getLeaderboard(), []);
  const mySaveId = useGameStore(s => s.activeSaveId);
  const myName = useGameStore(s => s.saves.find(x => x.id === s.activeSaveId)?.name || '');

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded border border-slate-200 p-4">
        <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">🏅 排行榜</h3>
        <div className="text-center py-6 text-[11px] text-slate-400">
          <p>暂无排名数据</p>
          <p className="mt-1">继续投放经营，你的分数会自动上榜</p>
        </div>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">🏅 排行榜 · TOP 20</h3>
      <div className="space-y-1">
        {entries.slice(0, 20).map((entry, i) => {
          const isMe = entry.name === myName;
          return (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] ${
              isMe ? 'bg-blue-50 border border-blue-200' : ''
            } ${i < 3 ? 'bg-amber-50/50' : ''}`}>
              <span className="w-6 text-center font-mono text-slate-400">
                {i < 3 ? medals[i] : `${i + 1}`}
              </span>
              <span className={`flex-1 truncate font-medium ${isMe ? 'text-blue-700' : 'text-slate-700'}`}>
                {entry.name}
                {isMe && <span className="text-[9px] text-blue-500 ml-1">(你)</span>}
              </span>
              <span className="text-[10px] text-slate-400 w-12 text-center">{entry.stage}</span>
              <span className="text-[10px] text-slate-400 w-12 text-center">D{entry.days}</span>
              <span className="text-[10px] text-slate-400 w-8 text-center">🏅{entry.achievements}</span>
              <span className="font-mono font-bold text-slate-700 w-16 text-right">
                {entry.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
