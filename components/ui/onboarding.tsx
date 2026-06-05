'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// 新手指引 — 分步骤交互式引导
// ============================================================

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      complete: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ hasCompletedOnboarding: false }),
    }),
    { name: 'ad-simulator-onboarding' }
  )
);

const STEPS = [
  {
    target: 'topbar-speed',
    title: '⏱ 时间控制',
    description: '这是模拟速度控制器。点击不同速度来推进游戏时间。建议新手从 100× 开始快速体验。',
    tip: '点击 100× 按钮开始模拟，数据会在几秒内快速变化。',
    position: 'bottom' as const,
  },
  {
    target: 'dashboard-kpis',
    title: '📊 核心指标',
    description: '这 6 个 KPI 卡片是你投放的晴雨表——消耗、展示、点击、转化、CPA、ROI，每一个都值得关注。',
    tip: '重点关注 CPA（获客成本）和 ROI（投资回报率），越低/越高越好。',
    position: 'bottom' as const,
  },
  {
    target: 'create-campaign-btn',
    title: '🎯 创建第一条计划',
    description: '点击这里进入 7 步创建向导。选择平台、人群、素材，设定预算和出价，然后开始你的第一次投放！',
    tip: '新手推荐：抖音信息流 + 年轻女性人群 + OCPM 15元出价 + 日预算 300元。',
    position: 'bottom' as const,
  },
  {
    target: 'nav-tasks',
    title: '🎯 任务中心',
    description: '完成任务获取经验和金币。从引导任务开始，一步步解锁新平台和更高的预算上限。',
    tip: '先去任务中心接取「创建第一条计划」，跟着任务走就能快速上手。',
    position: 'right' as const,
  },
];

export default function OnboardingOverlay() {
  const hasCompleted = useOnboardingStore(s => s.hasCompletedOnboarding);
  const complete = useOnboardingStore(s => s.complete);
  const hasSave = useGameStore(s => s.saves.length > 0);
  const campaignsCount = useCampaignStore(s => s.campaigns.length);

  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 只在首次进入且无计划时自动触发
    if (!hasCompleted && campaignsCount === 0) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted, campaignsCount]);

  // 用户创建了计划后自动完成引导
  useEffect(() => {
    if (!hasCompleted && campaignsCount > 0 && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        complete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [campaignsCount, hasCompleted, visible, complete]);

  if (!visible) return null;

  const step = STEPS[stepIndex];
  if (!step) return null;

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setVisible(false);
      complete();
    }
  };

  const handleSkip = () => {
    setVisible(false);
    complete();
  };

  return (
    <div className="fixed inset-0 z-[150]">
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 引导卡片 */}
      <div className="absolute inset-x-0 bottom-20 mx-auto max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-5 mx-4 animate-in">
          {/* 步骤条 */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < stepIndex ? 'bg-green-400' : i === stepIndex ? 'bg-blue-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-sm font-bold text-slate-800">{step.title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.description}</p>

          {/* 老王提示 */}
          <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-start gap-1.5">
              <span className="text-base flex-shrink-0">🧔</span>
              <div>
                <span className="text-[10px] font-medium text-amber-700">老王说：</span>
                <span className="text-[10px] text-amber-600">{step.tip}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600"
            >
              跳过引导
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {stepIndex < STEPS.length - 1 ? '下一步 →' : '✓ 开始投放'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
