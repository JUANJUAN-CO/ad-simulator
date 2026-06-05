'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useGameStore } from '@/lib/store/game-store';
import { PLATFORMS } from '@/lib/engine/platforms';
import { getMaterial, getMaterialsForPlatform } from '@/lib/data/materials';
import { getAudience } from '@/lib/data/audiences';
import { AUDIENCES } from '@/lib/data/audiences';
import { AD_TYPE_LABELS, BidMode } from '@/lib/engine/types';
import { useNotifications } from '@/components/ui/notification';
import Link from 'next/link';
import { Suspense } from 'react';

const BID_MODES: { value: BidMode; label: string }[] = [
  { value: 'ocpm', label: 'OCPM (推荐)' },
  { value: 'ocpc', label: 'OCPC' },
  { value: 'cpm', label: 'CPM' },
  { value: 'cpc', label: 'CPC' },
];

function CampaignDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';

  const campaigns = useCampaignStore(s => s.campaigns);
  const campaign = campaigns.find(c => c.id === id);
  const metrics = useCampaignStore(s => s.metrics[id]);
  const startCampaign = useCampaignStore(s => s.startCampaign);
  const pauseCampaign = useCampaignStore(s => s.pauseCampaign);
  const endCampaign = useCampaignStore(s => s.endCampaign);
  const deleteCampaign = useCampaignStore(s => s.deleteCampaign);
  const updateCampaign = useCampaignStore(s => s.updateCampaign);
  const addBudget = useCampaignStore(s => s.addBudget);
  const pushNotification = useNotifications(s => s.push);

  const [editMode, setEditMode] = useState(false);
  const [editBidPrice, setEditBidPrice] = useState(campaign?.bidPrice || 15);
  const [editDailyBudget, setEditDailyBudget] = useState(campaign?.dailyBudget || 300);
  const [editMaterialId, setEditMaterialId] = useState(campaign?.materialId || '');
  const [editAudienceId, setEditAudienceId] = useState(campaign?.audience || '');
  const [editBidMode, setEditBidMode] = useState<BidMode>(campaign?.bidMode || 'ocpm');
  const [extraBudget, setExtraBudget] = useState(1000);

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-slate-500 mb-4">找不到这个计划</p>
        <Link href="/campaigns" className="text-blue-500 hover:underline text-sm">← 返回计划列表</Link>
      </div>
    );
  }

  const platformConfig = PLATFORMS[campaign.platform];
  const material = getMaterial(campaign.materialId);
  const audience = getAudience(campaign.audience);
  const availableMaterials = getMaterialsForPlatform(campaign.platform);

  const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
    draft:   { label: '草稿',   cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    active:  { label: '投放中', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500 animate-pulse' },
    paused:  { label: '已暂停', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    ended:   { label: '已结束', cls: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
  };

  const learningConfig: Record<string, { label: string; cls: string }> = {
    cold_start: { label: '冷启动期', cls: 'bg-orange-100 text-orange-700' },
    learning:   { label: '学习期',   cls: 'bg-blue-100 text-blue-700' },
    stable:     { label: '稳定期',   cls: 'bg-green-100 text-green-700' },
    fatigue:    { label: '疲劳期',   cls: 'bg-red-100 text-red-700' },
  };

  const sc = statusConfig[campaign.status] || statusConfig.draft;
  const lc = metrics?.learningStage ? learningConfig[metrics.learningStage] : null;

  const dailySpend = metrics?.dailySpend || 0;
  const dailyBudget = campaign.dailyBudget;
  const dailyPercent = dailyBudget > 0 ? Math.min(100, (dailySpend / dailyBudget) * 100) : 0;
  const isDailyBudgetExhausted = dailySpend >= dailyBudget;

  const handleSaveEdit = () => {
    updateCampaign(id, {
      bidPrice: editBidPrice,
      dailyBudget: editDailyBudget,
      materialId: editMaterialId,
      audience: editAudienceId,
      bidMode: editBidMode,
    });
    setEditMode(false);
    pushNotification({
      type: 'success',
      title: '✅ 计划已更新',
      message: `「${campaign.name}」的出价、预算和素材已更新。`,
      icon: '✅',
      duration: 3000,
    });
  };

  const handleAddBudget = () => {
    addBudget(id, extraBudget);
    pushNotification({
      type: 'success',
      title: '💰 预算已追加',
      message: `为「${campaign.name}」追加了 ¥${extraBudget} 总预算`,
      icon: '💰',
      duration: 3000,
    });
  };

  const canEdit = campaign.status === 'active' || campaign.status === 'paused' || campaign.status === 'draft';

  return (
    <div className="max-w-6xl mx-auto px-2 space-y-4">
      {/* 面包屑 */}
      <div className="text-xs text-slate-400">
        <Link href="/campaigns" className="hover:text-blue-500">推广计划</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-600">{campaign.name}</span>
      </div>

      {/* 头部 */}
      <div className="bg-white rounded border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${sc.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
              {lc && (
                <span className={`text-xs px-2 py-0.5 rounded ${lc.cls}`}>{lc.label}</span>
              )}
              {isDailyBudgetExhausted && campaign.status === 'active' && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                  ⏳ 今日预算已用完，明天 0 点自动恢复
                </span>
              )}
              {metrics?.learningStage === 'fatigue' && campaign.status === 'active' && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 animate-pulse">
                  😴 素材疲劳！建议更换素材
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {campaign.status === 'draft' && (
              <button onClick={() => startCampaign(id)}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                ▶ 开始投放
              </button>
            )}
            {campaign.status === 'active' && (
              <button onClick={() => pauseCampaign(id)}
                className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors">
                ⏸ 暂停
              </button>
            )}
            {campaign.status === 'paused' && (
              <button onClick={() => startCampaign(id)}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                ▶ 恢复投放
              </button>
            )}
            {(campaign.status === 'active' || campaign.status === 'paused') && (
              <button onClick={() => endCampaign(id)}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors">
                ⏹ 结束
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => {
                  if (editMode) handleSaveEdit();
                  else {
                    setEditBidPrice(campaign.bidPrice);
                    setEditDailyBudget(campaign.dailyBudget);
                    setEditMaterialId(campaign.materialId);
                    setEditAudienceId(campaign.audience);
                    setEditBidMode(campaign.bidMode);
                    setEditMode(true);
                  }
                }}
                className={`px-4 py-1.5 text-xs rounded transition-colors ${
                  editMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {editMode ? '💾 保存修改' : '✏️ 编辑计划'}
              </button>
            )}
            {editMode && (
              <button onClick={() => setEditMode(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs rounded">
                取消
              </button>
            )}
            <button onClick={() => {
              if (confirm(`确定删除计划「${campaign.name}」吗？此操作不可撤销。`)) {
                deleteCampaign(id);
                router.push('/campaigns');
              }
            }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-600 text-xs rounded transition-colors">
              🗑 删除
            </button>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-2">
          <MetricBox label="展示量" value={metrics.impressions.toLocaleString()} />
          <MetricBox label="点击量" value={metrics.clicks.toLocaleString()} />
          <MetricBox label="转化数" value={metrics.conversions.toString()} highlight="green" />
          <MetricBox label="累计消耗" value={`¥${metrics.spend.toFixed(0)}`} />
          <MetricBox label="CTR" value={`${(metrics.ctr*100).toFixed(2)}%`} />
          <MetricBox label="CPA" value={`¥${metrics.cpa.toFixed(1)}`} />
          <MetricBox label="ROI" value={metrics.roi.toFixed(2)} highlight={metrics.roi >= 1 ? 'green' : 'red'} />
        </div>
      )}

      {/* 编辑面板 */}
      {editMode && (
        <div className="bg-blue-50 rounded border-2 border-blue-300 p-4">
          <h3 className="text-sm font-bold text-blue-800 mb-3">✏️ 编辑计划配置</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* 出价方式 + 出价 */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">出价方式</label>
              <div className="grid grid-cols-2 gap-1">
                {BID_MODES.map(b => (
                  <button key={b.value} onClick={() => setEditBidMode(b.value)}
                    className={`p-1.5 rounded border text-[11px] transition-colors ${
                      editBidMode === b.value ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-200 bg-white text-slate-500'
                    }`}>{b.label}</button>
                ))}
              </div>
              <label className="block text-[11px] font-medium text-slate-600 mt-2 mb-1">
                出价: ¥{editBidPrice}
              </label>
              <input type="range" min={2} max={100} value={editBidPrice}
                onChange={e => setEditBidPrice(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>¥2</span><span>参考 CPM: ¥{platformConfig?.avgCPM}</span><span>¥100</span>
              </div>
            </div>

            {/* 日预算 */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                日预算: ¥{editDailyBudget}/天
              </label>
              <input type="range" min={50} max={10000} step={50} value={editDailyBudget}
                onChange={e => setEditDailyBudget(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>¥50</span><span>¥{editDailyBudget}</span><span>¥10000</span>
              </div>
            </div>

            {/* 切换素材 */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                更换素材 {material && <span className="text-slate-400">(当前: {material.name})</span>}
              </label>
              <select value={editMaterialId}
                onChange={e => setEditMaterialId(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white">
                {availableMaterials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} (吸引力:{m.appeal} 清晰度:{m.clarity})
                  </option>
                ))}
              </select>
            </div>

            {/* 切换人群 */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                更换人群 {audience && <span className="text-slate-400">(当前: {audience.name})</span>}
              </label>
              <select value={editAudienceId}
                onChange={e => setEditAudienceId(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white">
                {AUDIENCES.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.gender === 'all' ? '不限' : a.gender === 'female' ? '女' : '男'} · {a.ageRange[0]}-{a.ageRange[1]}岁)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 今日预算进度 */}
        <div className="bg-white rounded border border-slate-200 p-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">今日预算消耗</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-slate-800">¥{dailySpend.toFixed(0)}</span>
            <span className="text-sm text-slate-400 mb-0.5">/ ¥{dailyBudget}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${dailyPercent >= 90 ? 'bg-red-500' : dailyPercent >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>{dailyPercent.toFixed(0)}%</span>
            <span>{isDailyBudgetExhausted ? '今日预算已用完' : `剩余 ¥${(dailyBudget - dailySpend).toFixed(0)}`}</span>
          </div>
          {isDailyBudgetExhausted && (
            <p className="text-[10px] text-amber-600 mt-2 bg-amber-50 p-2 rounded">
              💡 真实平台也是这样的——日预算花完当天不再投放，明天 0 点自动恢复。加速模拟即可看到跨天重置。
            </p>
          )}
          {/* 总预算消耗 */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>总预算消耗</span><span>¥{metrics?.spend.toFixed(0) || 0} / ¥{campaign.totalBudget}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full"
                style={{ width: `${Math.min(100, ((metrics?.spend || 0) / campaign.totalBudget * 100))}%` }} />
            </div>
          </div>
          {/* 追加预算 */}
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <label className="text-[10px] text-slate-500 mb-1 block">追加总预算</label>
              <div className="flex gap-2">
                <select value={extraBudget} onChange={e => setExtraBudget(Number(e.target.value))}
                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-[11px] bg-white">
                  {[500, 1000, 2000, 5000, 10000].map(v => (
                    <option key={v} value={v}>¥{v.toLocaleString()}</option>
                  ))}
                </select>
                <button onClick={handleAddBudget}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] rounded transition-colors">
                  💰 追加
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 计划配置 */}
        <div className="bg-white rounded border border-slate-200 p-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">计划配置</h3>
          <div className="space-y-1.5 text-xs">
            <Row label="平台" value={platformConfig?.name || campaign.platform} />
            <Row label="广告类型" value={AD_TYPE_LABELS[campaign.adType] || campaign.adType} />
            <Row label="投放目标" value={
              campaign.goal === 'leads' ? '销售线索' :
              campaign.goal === 'app_install' ? '应用推广' :
              campaign.goal === 'ecommerce' ? '电商引流' : '品牌曝光'
            } />
            <Row label="人群定向" value={audience?.name || campaign.audience} />
            <Row label="出价方式" value={`${campaign.bidMode.toUpperCase()} · ¥${campaign.bidPrice}`} />
            <Row label="日预算" value={`¥${campaign.dailyBudget}/天`} />
            <Row label="总预算" value={`¥${campaign.totalBudget}`} />
            <Row label="创建时间" value={new Date(campaign.createdAt).toLocaleDateString('zh-CN')} />
          </div>
        </div>

        {/* 素材信息 */}
        <div className="bg-white rounded border border-slate-200 p-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">广告素材</h3>
          {material ? (
            <div className="space-y-1.5 text-xs">
              <Row label="素材名称" value={material.name} />
              <Row label="类型" value={AD_TYPE_LABELS[material.type] || material.type} />
              <Row label="吸引力" value={`${material.appeal}/100`} />
              <Row label="清晰度" value={`${material.clarity}/100`} />
              <Row label="落地页" value={`${material.landingScore}/100`} />
              <Row label="新鲜度" value={`${((metrics?.materialFreshness || 1)*100).toFixed(0)}%`} />
              {metrics?.materialFreshness && metrics.materialFreshness < 0.4 && (
                <div className="mt-2 p-2 bg-red-50 rounded text-[10px] text-red-600">
                  ⚠️ 素材新鲜度过低，CTR 已大幅衰减。建议更换素材。
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">素材未找到</p>
          )}
          {/* 人群信息 */}
          {audience && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-[10px] font-medium text-slate-500 uppercase mb-2">人群定向</h4>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-400">性别</span><span className="text-slate-600">{audience.gender === 'all' ? '不限' : audience.gender === 'female' ? '女性' : '男性'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">年龄</span><span className="text-slate-600">{audience.ageRange[0]}-{audience.ageRange[1]} 岁</span></div>
                <div className="flex justify-between"><span className="text-slate-400">城市</span><span className="text-slate-600">{audience.cityTiers.map(t => `${t}线`).join('、')}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  const color = highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-500' : 'text-slate-800';
  return (
    <div className="bg-white rounded border border-slate-200 px-3 py-2.5 text-center">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-slate-500">加载中...</p>
      </div>
    }>
      <CampaignDetail />
    </Suspense>
  );
}
