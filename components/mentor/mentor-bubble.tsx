'use client';

import { useState } from 'react';
import { useGameStore, CAREER_STAGES } from '@/lib/store/game-store';
import { MENTORS, getMentorTip } from '@/lib/data/mentors';

export default function MentorBubble() {
  const { careerStage, exp } = useGameStore();
  const currentStage = CAREER_STAGES[careerStage - 1];
  const mentor = MENTORS[currentStage?.mentorId || 'laowang'];
  const [tip, setTip] = useState(() => getMentorTip(mentor?.id || 'laowang', 'idle'));
  const [visible, setVisible] = useState(true);

  if (!mentor || !visible) return null;

  const refreshTip = () => {
    setTip(getMentorTip(mentor.id, 'idle'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 animate-in">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{mentor.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-800">{mentor.name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={refreshTip}
                  className="text-xs text-slate-400 hover:text-slate-600 p-1"
                  title="换一句提示"
                >
                  🔄
                </button>
                <button
                  onClick={() => setVisible(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 p-1"
                  title="关闭"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
            <div className="mt-2 text-xs text-slate-400">
              {mentor.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
