'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useGameStore } from '@/lib/store/game-store';
import Link from 'next/link';

export default function CampaignsPage() {
  const router = useRouter();
  const campaigns = useCampaignStore(s => s.campaigns);
  const metrics = useCampaignStore(s => s.metrics);
  const deleteCampaign = useCampaignStore(s => s.deleteCampaign);

  // 防数据丢失：如果 store 为空但 localStorage 有数据，强制恢复
  useEffect(() => {
    const stored = localStorage.getItem('ad-simulator-campaigns');
    if (stored && campaigns.length === 0) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.campaigns?.length > 0) {
          console.log('[CampaignsPage] 检测到 localStorage 有数据但 store 为空，强制恢复');
          useCampaignStore.persist.rehydrate();
        }
      } catch(e) {}
    }
  }, []);
  const { careerStage } = useGameStore();

  const platformNames: Record<string, string> = {
    douyin: '抖音', xiaohongshu: '小红书', wechat: '微信', kuaishou: '快手',
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: '投放中', color: 'text-green-600', bg: 'bg-green-100' },
    paused: { label: '已暂停', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    draft: { label: '草稿', color: 'text-slate-500', bg: 'bg-slate-100' },
    ended: { label: '已结束', color: 'text-red-400', bg: 'bg-red-50' },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">推广计划管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">管理所有推广计划，查看投放数据</p>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
        >
          + 新建推广计划
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded border border-slate-200">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm text-slate-400 mb-4">暂无推广计划，创建你的第一个计划开始投放</p>
          <Link
            href="/campaigns/new"
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors inline-block"
          >
            + 新建推广计划
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 w-10">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left px-2 py-3 font-medium text-slate-500">计划名称</th>
                  <th className="text-left px-2 py-3 font-medium text-slate-500">平台</th>
                  <th className="text-left px-2 py-3 font-medium text-slate-500">出价方式</th>
                  <th className="text-left px-2 py-3 font-medium text-slate-500">状态</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">日预算</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">消耗</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">展示量</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">点击量</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">转化数</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">CPA</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">ROI</th>
                  <th className="text-right px-2 py-3 font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const m = metrics[c.id];
                  const status = statusConfig[c.status];
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => router.push(`/campaigns/detail?id=${c.id}`)}
                          className="text-blue-600 hover:underline font-medium text-left"
                        >
                          {c.name}
                        </button>
                        <div className="text-[10px] text-slate-400">{c.bidMode.toUpperCase()} ¥{c.bidPrice}</div>
                      </td>
                      <td className="px-2 py-2.5 text-slate-600">{platformNames[c.platform]}</td>
                      <td className="px-2 py-2.5 text-slate-500">{c.bidMode.toUpperCase()}</td>
                      <td className="px-2 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${status.bg} ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-600">¥{c.dailyBudget}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-700">¥{m?.spend.toFixed(0) || '0'}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-500">{m?.impressions.toLocaleString() || '0'}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-500">{m?.clicks.toLocaleString() || '0'}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-700 font-medium">{m?.conversions || '0'}</td>
                      <td className="px-2 py-2.5 text-right font-mono text-slate-600">¥{m?.cpa.toFixed(1) || '-'}</td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        <span className={(m?.roi || 0) >= 1 ? 'text-green-600' : 'text-red-400'}>
                          {m?.roi.toFixed(2) || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => router.push(`/campaigns/detail?id=${c.id}`)}
                            className="text-blue-500 hover:text-blue-700 text-[11px]">
                            详情
                          </button>
                          <button onClick={() => {
                            if (confirm(`删除「${c.name}」？`)) deleteCampaign(c.id);
                          }}
                            className="text-slate-300 hover:text-red-500 text-[11px]">
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">
            <span>共 {campaigns.length} 条计划</span>
            <div className="flex items-center gap-1">
              <span>10 条/页</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
