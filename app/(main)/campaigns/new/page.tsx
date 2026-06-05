'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { useGameStore } from '@/lib/store/game-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Platform, PlatformConfig, CampaignGoal, BidMode, IndustryType, AdType, AD_TYPE_LABELS } from '@/lib/engine/types';
import { PLATFORMS, getPlatformsByGroup, isPlatformAvailable } from '@/lib/engine/platforms';
import { MATERIALS, getMaterialsForPlatform } from '@/lib/data/materials';
import { AUDIENCES } from '@/lib/data/audiences';
import { useEffect } from 'react';

const GOALS: { value: CampaignGoal; label: string }[] = [
  { value: 'leads', label: '销售线索' },
  { value: 'ecommerce', label: '电商引流' },
  { value: 'app_install', label: '应用推广' },
  { value: 'brand', label: '品牌曝光' },
];

const BID_MODES: { value: BidMode; label: string }[] = [
  { value: 'ocpm', label: 'OCPM (推荐)' },
  { value: 'ocpc', label: 'OCPC' },
  { value: 'cpm', label: 'CPM' },
  { value: 'cpc', label: 'CPC' },
];

const STEPS = ['选择平台', '广告类型', '投放目标', '人群定向', '预算出价', '素材选择', '确认发布'];

export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign } = useCampaignStore();
  const { careerStage, freeMoney, spendMoney, updateStats } = useGameStore();
  const { wizardDraft, saveWizardDraft, clearWizardDraft } = useUIStore();

  // 从持久化草稿恢复，没有则用默认值
  const draft = wizardDraft;
  const [step, setStep] = useState(draft?.step ?? 0);
  const [platform, setPlatform] = useState<Platform>(draft?.platform ?? 'douyin_feed');
  const [adType, setAdType] = useState<AdType>(draft?.adType ?? 'feed_video');
  const [goal, setGoal] = useState<CampaignGoal>(draft?.goal ?? 'leads');
  const [audienceId, setAudienceId] = useState(draft?.audienceId ?? AUDIENCES[0].id);
  const [bidMode, setBidMode] = useState<BidMode>(draft?.bidMode ?? 'ocpm');
  const [bidPrice, setBidPrice] = useState(draft?.bidPrice ?? 15);
  const [dailyBudget, setDailyBudget] = useState(draft?.dailyBudget ?? 300);
  const [totalBudget, setTotalBudget] = useState(draft?.totalBudget ?? 2100);
  const [materialId, setMaterialId] = useState(draft?.materialId ?? '');
  const [campaignName, setCampaignName] = useState(draft?.campaignName ?? '');

  // 每次修改自动保存草稿
  useEffect(() => {
    saveWizardDraft({ step, platform, adType, goal, audienceId, bidMode, bidPrice, dailyBudget, totalBudget, materialId, campaignName });
  }, [step, platform, adType, goal, audienceId, bidMode, bidPrice, dailyBudget, totalBudget, materialId, campaignName, saveWizardDraft]);

  const platformGroups = useMemo(() => getPlatformsByGroup(), []);
  const platformConfig = PLATFORMS[platform];
  const availableAdTypes = platformConfig?.adTypes || [];

  const filteredMaterials = useMemo(() =>
    MATERIALS.filter(m => m.platform.some(pid => {
      const cfg = PLATFORMS[pid];
      return cfg && cfg.group === platformConfig?.group;
    })),
  [platformConfig]);

  const selectedAudience = AUDIENCES.find(a => a.id === audienceId);
  const selectedMaterial = MATERIALS.find(m => m.id === materialId);

  const handleCreate = () => {
    if (!campaignName.trim() || !materialId) return;
    const initialCost = Math.floor(totalBudget * 0.3);
    if (freeMoney < initialCost) {
      alert(`资金不足！需要 ¥${initialCost}，当前余额 ¥${freeMoney}`);
      return;
    }
    spendMoney(initialCost);
    createCampaign({
      name: campaignName, platform, adType, goal,
      audience: audienceId, bidMode, bidPrice,
      dailyBudget, totalBudget, materialId,
    });
    clearWizardDraft(); // 创建成功后清除草稿
    updateStats({ campaignsCreated: (useGameStore.getState().stats.campaignsCreated || 0) + 1 });
    router.push('/campaigns');
  };

  return (
    <div className="max-w-4xl mx-auto px-2 mx-auto space-y-5">
      <h1 className="text-lg font-bold text-slate-800">新建推广计划</h1>

      {/* 步骤条 */}
      <div className="flex items-center gap-1 bg-white rounded border border-slate-200 px-4 py-3 overflow-x-auto">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              i < step ? 'bg-green-100 text-green-700' :
              i === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${i === step ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="text-slate-200 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="bg-white rounded border border-slate-200 p-5 min-h-[360px]">
        {/* 步骤 0: 平台选择（分组） */}
        {step === 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">选择投放平台 (共 {Object.keys(PLATFORMS).length} 个，已解锁 {Object.values(PLATFORMS).filter(p => isPlatformAvailable(p.id, careerStage)).length} 个)</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(platformGroups).map(([group, plats]) => {
                const firstPlat = plats[0];
                const unlockedCount = plats.filter(p => isPlatformAvailable(p.id, careerStage)).length;
                return (
                  <div key={group}>
                    <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                      <span>{firstPlat.groupIcon}</span> {group}
                      <span className="text-slate-300">({plats.length}个，解锁{unlockedCount}个)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {plats.map(p => {
                        const unlocked = isPlatformAvailable(p.id, careerStage);
                        const isSelected = platform === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => { if (unlocked) { setPlatform(p.id); setAdType(p.adTypes[0]); } }}
                            disabled={!unlocked}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              !unlocked ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' :
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                                {!unlocked && '🔒 '}{p.name}
                              </span>
                              <span className="text-[10px] text-slate-400">CPM ¥{p.avgCPM}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              MAU {p.mau}M · CTR {(p.avgCTR*100).toFixed(1)}%
                            </div>
                            {!unlocked && (
                              <div className="text-[10px] text-amber-500 mt-1">
                                阶段 {p.availableInStage} 解锁
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 步骤 1: 广告类型 */}
        {step === 1 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">选择广告类型 — {platformConfig?.name}</h2>
            <div className="grid grid-cols-2 gap-2">
              {availableAdTypes.map(at => (
                <button
                  key={at}
                  onClick={() => setAdType(at)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    adType === at ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800">{AD_TYPE_LABELS[at]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {at === 'feed_video' ? '短视频信息流，覆盖面广' :
                     at === 'feed_image' ? '图片展示，适合品牌' :
                     at === 'feed_live' ? '直播引流，实时转化' :
                     at === 'search' ? '搜索关键词精准投放' :
                     at === 'feed_carousel' ? '多图轮播，信息量大' :
                     at === 'product_card' ? '商品卡直接导购' :
                     '图文深度内容推广'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 步骤 2: 投放目标 */}
        {step === 2 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">选择投放目标</h2>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    goal === g.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className="text-sm font-medium text-slate-800">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 步骤 3: 人群定向 */}
        {step === 2 && null}
        {step === 3 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">选择人群定向</h2>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map(a => (
                <button key={a.id} onClick={() => setAudienceId(a.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    audienceId === a.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className="text-sm font-medium text-slate-800">{a.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {a.gender === 'all' ? '不限性别' : a.gender === 'female' ? '女性' : '男性'} · {a.ageRange[0]}-{a.ageRange[1]}岁 · 覆盖 {a.cityTiers.length} 级城市
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 步骤 4: 预算出价 */}
        {step === 4 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">设置预算和出价</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">出价方式</label>
                <div className="grid grid-cols-2 gap-2">
                  {BID_MODES.map(b => (
                    <button key={b.value} onClick={() => setBidMode(b.value)}
                      className={`p-2 rounded-lg border-2 text-xs transition-colors ${
                        bidMode === b.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">出价: ¥{bidPrice}</label>
                <input type="range" min={5} max={100} value={bidPrice}
                  onChange={e => setBidPrice(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>¥5</span><span>参考 CPM: ¥{platformConfig?.avgCPM}</span><span>¥100</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">日预算: ¥{dailyBudget}/天</label>
                <input type="range" min={50} max={10000} step={50} value={dailyBudget}
                  onChange={e => setDailyBudget(Number(e.target.value))} className="w-full" />
                <span className="text-[10px] text-slate-400">¥50 - ¥10000</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">总预算: ¥{totalBudget}</label>
                <input type="range" min={dailyBudget} max={dailyBudget * 30} step={dailyBudget} value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>¥{dailyBudget} (1天)</span>
                  <span>预付 30%: ¥{Math.floor(totalBudget * 0.3)}</span>
                  <span>¥{dailyBudget * 30} (30天)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 步骤 5: 素材选择 */}
        {step === 5 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">选择广告素材</h2>
            <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto">
              {filteredMaterials.map(m => (
                <button key={m.id} onClick={() => setMaterialId(m.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    materialId === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className="text-sm font-medium text-slate-800">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.description}</div>
                  <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
                    <span>吸引力:{m.appeal}</span><span>清晰度:{m.clarity}</span><span>落地页:{m.landingScore}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 步骤 6: 确认 */}
        {step === 6 && (
          <div>
            <h2 className="text-sm font-semibold mb-4">确认计划信息</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">计划名称</label>
                <input type="text" value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder="例如：抖音信息流-连衣裙-年轻女性-OCPM"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs">
                <Info label="平台" value={platformConfig?.name || platform} />
                <Info label="类型" value={AD_TYPE_LABELS[adType]} />
                <Info label="目标" value={GOALS.find(g => g.value === goal)?.label || goal} />
                <Info label="人群" value={selectedAudience?.name || ''} />
                <Info label="出价" value={`${bidMode.toUpperCase()} ¥${bidPrice}`} />
                <Info label="日预算" value={`¥${dailyBudget}/天`} />
                <Info label="总预算" value={`¥${totalBudget}`} />
                <Info label="预付" value={`¥${Math.floor(totalBudget * 0.3)}`} />
                <Info label="素材" value={selectedMaterial?.name || '未选择'} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 导航 */}
      <div className="flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded disabled:opacity-50">
          ← 上一步
        </button>
        {step < 6 ? (
          <button onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
            下一步 →
          </button>
        ) : (
          <button onClick={handleCreate} disabled={!campaignName.trim() || !materialId}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded disabled:opacity-50">
            ✅ 确认创建 (预付 ¥{Math.floor(totalBudget * 0.3)})
          </button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-50">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
