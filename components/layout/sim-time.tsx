'use client';

import { useGameStore } from '@/lib/store/game-store';
import { getSimulationEngine } from '@/lib/engine/ticker';
import { getActiveEvents } from '@/lib/data/events';
import { getSeasonFactor } from '@/lib/engine/platforms';
import { useEffect, useState } from 'react';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function SimTime() {
  const currentTime = useGameStore(s => s.currentTime);
  const simSpeed = useGameStore(s => s.simSpeed);
  const isRunning = useGameStore(s => s.isRunning);
  const simDays = useGameStore(s => s.simDays);
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const update = () => {
      const date = new Date(currentTime);
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = WEEKDAYS[date.getDay()];

      const events = getActiveEvents(month, day);
      const eventStr = events.length > 0 ? ` 🔥${events[0].name}` : '';

      setDisplayTime(`${month}月${day}日 周${weekday} ${hour}:${minute}${eventStr}`);
    };

    update();
    // 在高速模式下也定期更新显示
    const interval = setInterval(update, simSpeed > 0 ? 500 : 1000);
    return () => clearInterval(interval);
  }, [currentTime, simSpeed]);

  // 季节/时段指示
  const date = new Date(currentTime);
  const hour = date.getHours();
  const timeLabel = hour >= 19 && hour <= 22 ? '🌙 高峰' :
    hour >= 8 && hour <= 10 ? '🌅 早高峰' :
    hour >= 12 && hour <= 14 ? '☀️ 午高峰' :
    hour >= 2 && hour < 6 ? '🌚 低谷' : '📊 平峰';

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md font-mono text-slate-600">
        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
        <span>{displayTime}</span>
      </div>
      <span className="text-slate-400">{timeLabel}</span>
      <span className="text-slate-400">| 第 {simDays + 1} 天</span>
    </div>
  );
}
