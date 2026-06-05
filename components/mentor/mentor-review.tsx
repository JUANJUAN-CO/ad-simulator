'use client';

import { useGameStore, CAREER_STAGES } from '@/lib/store/game-store';
import { MENTORS, getMentorMissionFeedback } from '@/lib/data/mentors';
import { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  missionId?: string;
  difficulty?: string;
  result?: 'success' | 'failure';
  onClose: () => void;
}

export default function MentorReview({ show, missionId, difficulty, result, onClose }: Props) {
  const { careerStage } = useGameStore();
  const currentStage = CAREER_STAGES[careerStage - 1];
  const mentor = MENTORS[currentStage?.mentorId || 'laowang'];
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (show && mentor) {
      if (result === 'success' && difficulty) {
        setFeedback(getMentorMissionFeedback(mentor.id, difficulty));
      } else if (result === 'failure') {
        setFeedback('没关系，失败是成功之母。复盘一下哪里出了问题，下次注意就可以了。');
      } else {
        setFeedback('随时需要帮助就来找我。');
      }
    }
  }, [show, mentor, difficulty, result]);

  if (!show || !mentor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <span className="text-5xl">{mentor.avatar}</span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{mentor.name}</h3>
          <p className="text-sm text-slate-500">{mentor.title}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-slate-700 text-center leading-relaxed">
            &ldquo;{feedback}&rdquo;
          </p>
        </div>

        {result === 'success' && (
          <div className="text-center text-green-600 text-sm mb-4">
            ✅ 任务完成！继续加油！
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          好的，知道了
        </button>
      </div>
    </div>
  );
}
