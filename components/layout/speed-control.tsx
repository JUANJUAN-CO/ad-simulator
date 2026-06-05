'use client';

import { useGameStore } from '@/lib/store/game-store';
import { playSpeedChange } from '@/lib/utils/sound';

const SPEEDS = [
  { value: 0, label: '⏸', labelSm: '⏸ 暂停', title: '暂停模拟' },
  { value: 1, label: '1×', labelSm: '1×', title: '1x 速度' },
  { value: 5, label: '5×', labelSm: '5×', title: '5x 速度' },
  { value: 20, label: '20×', labelSm: '20×', title: '20x 速度' },
  { value: 50, label: '50×', labelSm: '50×', title: '50x 速度' },
  { value: 100, label: '100×', labelSm: '100×', title: '100x 极速' },
] as const;

export default function SpeedControl() {
  const simSpeed = useGameStore(s => s.simSpeed);
  const setSimSpeed = useGameStore(s => s.setSimSpeed);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {SPEEDS.map(s => (
        <button
          key={s.value}
          onClick={() => { setSimSpeed(s.value); playSpeedChange(); }}
          title={s.title}
          className={`px-1 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded transition-colors ${
            simSpeed === s.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <span className="hidden sm:inline">{s.labelSm}</span>
          <span className="sm:hidden">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
