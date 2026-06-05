'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';

export default function Home() {
  const router = useRouter();
  const { newGame, saves, loadGame } = useGameStore();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('我的存档');

  const handleNewGame = () => {
    newGame(name || '我的存档');
    // 用 setTimeout 确保 store 已更新再跳转
    setTimeout(() => router.push('/dashboard'), 50);
  };

  const handleLoadGame = (saveId: string) => {
    loadGame(saveId);
    setTimeout(() => router.push('/dashboard'), 50);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            投流<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">高手</span>
          </h1>
          <p className="text-slate-400 text-lg">
            职业生涯模拟器
          </p>
          <p className="text-slate-500 text-sm mt-2">
            从投放助理到总监，体验完整的广告投手成长之路
          </p>
        </div>

        {/* Actions */}
        {!showNew ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowNew(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              🆕 开始新的职业生涯
            </button>

            {saves.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h2 className="text-slate-400 text-sm mb-3">继续之前的存档</h2>
                <div className="space-y-2">
                  {saves.map(save => (
                    <button
                      key={save.id}
                      onClick={() => handleLoadGame(save.id)}
                      className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{save.name}</div>
                        <div className="text-xs text-slate-400">
                          第 {Math.floor((save.simState?.tickCount || 0) / 144) + 1} 天 · {
                            save.careerStage === 1 ? '投放助理' :
                            save.careerStage === 2 ? '独立优化师' :
                            save.careerStage === 3 ? '高级优化师' : '投放总监'
                          }
                        </div>
                      </div>
                      <span className="text-slate-400">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {saves.length === 0 && (
              <p className="text-center text-slate-600 text-sm">
                还没有存档，开始你的第一段职业旅程吧
              </p>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h2 className="text-white text-lg font-semibold mb-4">新建存档</h2>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="给你的存档起个名字"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleNewGame}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              >
                开始游戏
              </button>
            </div>
          </div>
        )}

        {/* 特性 */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-2xl mb-1">🏢</div>
            <div className="text-xs text-slate-500">4大平台</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-xs text-slate-500">真实数据</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-2xl mb-1">🎓</div>
            <div className="text-xs text-slate-500">导师引导</div>
          </div>
        </div>
      </div>
    </main>
  );
}
