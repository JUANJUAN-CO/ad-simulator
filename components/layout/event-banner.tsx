'use client';

import { useGameStore } from '@/lib/store/game-store';
import { useEffect, useState } from 'react';

export default function EventBanner() {
  const activeRandomEvent = useGameStore(s => s.activeRandomEvent);
  const [visible, setVisible] = useState(false);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (activeRandomEvent) {
      setEvent(activeRandomEvent);
      setVisible(true);
      // 5秒后自动淡出（但事件效果仍在）
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [activeRandomEvent]);

  if (!event || !visible) return null;

  const isPositive = event.type === 'positive';
  const bgColor = isPositive ? 'bg-green-500' : event.type === 'negative' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-2 text-center text-xs font-medium animate-pulse`}>
      <span className="text-lg mr-2">{event.icon}</span>
      {event.notification}
      <span className="ml-3 opacity-70 text-[10px]">
        {event.type === 'positive' ? '✨ 利好' : event.type === 'negative' ? '⚠️ 不利' : '📊 中性'}
      </span>
    </div>
  );
}
