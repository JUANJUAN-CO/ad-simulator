'use client';

import { useEffect, useState, useCallback } from 'react';
import { create } from 'zustand';

// ============================================================
// 通知系统 — 全局 toast + 事件推送
// ============================================================

export interface AppNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'event';
  title: string;
  message: string;
  icon?: string;
  duration?: number; // ms, 默认 5000，0 表示不自动消失
  action?: { label: string; onClick: () => void };
}

interface NotificationStore {
  notifications: AppNotification[];
  push: (n: Omit<AppNotification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  push: (n) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set(s => ({ notifications: [...s.notifications, { ...n, id }] }));
    // 自动消失
    if (n.duration !== 0) {
      setTimeout(() => {
        set(s => ({ notifications: s.notifications.filter(x => x.id !== id) }));
      }, n.duration || 5000);
    }
  },
  dismiss: (id) => set(s => ({ notifications: s.notifications.filter(x => x.id !== id) })),
  clear: () => set({ notifications: [] }),
}));

const typeConfig: Record<string, { bg: string; border: string; text: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  event: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
};

/** 通知浮层 — 放在 layout 顶部 */
export default function NotificationToast() {
  const notifications = useNotifications(s => s.notifications);
  const dismiss = useNotifications(s => s.dismiss);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const n of notifications) {
      next[n.id] = true;
    }
    // 延迟一帧触发动画
    requestAnimationFrame(() => setVisible(next));
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-12 lg:top-14 right-2 lg:right-4 z-[100] flex flex-col gap-1.5 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        const cfg = typeConfig[n.type] || typeConfig.info;
        const show = visible[n.id];
        return (
          <div
            key={n.id}
            className={`pointer-events-auto ${cfg.bg} ${cfg.border} border rounded-lg px-3 py-2.5 shadow-lg transition-all duration-300 ${
              show ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="flex items-start gap-2">
              {n.icon && <span className="text-lg flex-shrink-0">{n.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${cfg.text}`}>{n.title}</div>
                <div className={`text-[11px] ${cfg.text} opacity-80 mt-0.5`}>{n.message}</div>
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 text-sm"
              >
                ✕
              </button>
            </div>
            {n.action && (
              <button
                onClick={() => { n.action!.onClick(); dismiss(n.id); }}
                className={`mt-1.5 text-[10px] ${cfg.text} font-medium underline hover:opacity-80`}
              >
                {n.action.label} →
              </button>
            )}
          </div>
        )}
      )}
    </div>
  );
}
