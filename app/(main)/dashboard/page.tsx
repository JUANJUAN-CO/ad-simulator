'use client';

import { useGameStore, CAREER_STAGES } from '@/lib/store/game-store';
import { useCampaignStore } from '@/lib/store/campaign-store';
import { PLATFORMS } from '@/lib/engine/platforms';
import TrendCharts from '@/components/dashboard/trend-charts';
import CompetitionPanel from '@/components/dashboard/competition-panel';
import SmartAnalysis from '@/components/mentor/smart-analysis';
import ClientOffer from '@/components/dashboard/client-offer';
import Link from 'next/link';

export default function Dashboard() {
  const { careerStage, exp, freeMoney, simDays, stats } = useGameStore();
  const { campaigns, metrics } = useCampaignStore();
  // 防止 hydration 期间 careerStage 为 0 导致崩溃
  const safeStage = careerStage >= 1 && careerStage <= 4 ? careerStage : 1;
  const currentStage = CAREER_STAGES[safeStage - 1];
  const progressPercent = currentStage?.expRequired === Infinity ? 100
    : Math.min(100, Math.round((exp / (currentStage?.expRequired || 2000)) * 100));

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const entries = activeCampaigns.map(c => metrics[c.id]).filter(Boolean);

  const todaySpend = entries.reduce((s, m) => s + (m?.dailySpend || 0), 0);
  const todayImp = entries.reduce((s, m) => s + (m?.impressions || 0), 0);
  const todayClick = entries.reduce((s, m) => s + (m?.clicks || 0), 0);
  const todayConv = entries.reduce((s, m) => s + (m?.conversions || 0), 0);
  const todayCTR = todayImp > 0 ? (todayClick / todayImp * 100) : 0;
  const todayCVR = todayClick > 0 ? (todayConv / todayClick * 100) : 0;
  const todayCPA = todayConv > 0 ? todaySpend / todayConv : 0;
  const todayValue = entries.reduce((s, m) => s + (m?.conversionValue || 0), 0);
  const todayROI = todaySpend > 0 ? todayValue / todaySpend : 0;

  const platformNames: Record<string, string> = {
    douyin_feed:'抖音信息流', douyin_search:'抖音搜索', qianchuan:'巨量千川',
    xiaohongshu_feed:'小红书信息流', xiaohongshu_search:'小红书搜索', xiaohongshu_live:'小红书直播',
    kuaishou_feed:'快手信息流', kuaishou_live:'快手直播', kuaishou_ecom:'快手电商',
    wechat_moments:'朋友圈', wechat_oa:'公众号', wechat_channels:'视频号',
    baidu_search:'百度搜索', baidu_feed:'百度信息流', weibo_feed:'微博粉丝通',
    bilibili_feed:'B站信息流', zhihu_feed:'知乎知+',
    tiktok_feed:'TikTok', tiktok_spark:'TikTok Spark', facebook_ads:'Facebook/IG',
    pinduoduo_ads:'拼多多', jd_ads:'京东京准通',
  };

  const statusLabel: Record<string, string> = { active:'投放中', paused:'已暂停', draft:'草稿', ended:'已结束' };

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-800">首页概览</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            第 {simDays + 1} 天 · {currentStage?.title} · 更新于刚刚
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/campaigns/new"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors">
            + 新建推广计划
          </Link>
        </div>
      </div>

      {/* KPI卡片 — 仿巨量引擎 */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <Kpi label="今日消耗" value={`¥${todaySpend.toFixed(0)}`} sub={`余额 ¥${freeMoney.toLocaleString()}`} />
        <Kpi label="展示量" value={todayImp.toLocaleString()} sub={`CTR ${todayCTR.toFixed(2)}%`} />
        <Kpi label="点击量" value={todayClick.toLocaleString()} sub={`CVR ${todayCVR.toFixed(2)}%`} />
        <Kpi label="转化数" value={todayConv.toString()} sub={`转化价值 ¥${todayValue.toFixed(0)}`} accent />
        <Kpi label="转化成本" value={`¥${todayCPA.toFixed(1)}`} sub={`ROI ${todayROI.toFixed(2)}`} accent />
        <Kpi label="活跃计划" value={activeCampaigns.length.toString()} sub={`共 ${campaigns.length} 条`} />
      </div>

      {/* 趋势图 */}
      <TrendCharts />

      {/* 竞争态势 */}
      <CompetitionPanel />

      {/* 客户需求 */}
      <ClientOffer />

      {/* 计划列表 + 职业卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* 计划列表 */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded border border-slate-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-semibold text-slate-800">推广计划</h2>
              <div className="flex gap-3 text-[11px]">
                <span className="text-slate-400">全部 {campaigns.length}</span>
                <span className="text-green-600">投放中 {activeCampaigns.length}</span>
                <span className="text-yellow-600">暂停 {campaigns.filter(c=>c.status==='paused').length}</span>
                <span className="text-slate-300">已结束 {campaigns.filter(c=>c.status==='ended').length}</span>
              </div>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-2">📢</div>
              <p className="text-sm text-slate-400 mb-1">暂无推广计划</p>
              <p className="text-[11px] text-slate-300 mb-4">点击右上角「新建推广计划」开始投放</p>
              <Link href="/campaigns/new"
                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors inline-block">
                + 新建推广计划
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-3 py-2 font-medium text-slate-500 w-8"><input type="checkbox" className="rounded" /></th>
                  <th className="text-left px-2 py-2 font-medium text-slate-500">计划名称</th>
                  <th className="text-left px-2 py-2 font-medium text-slate-500">平台</th>
                  <th className="text-center px-2 py-2 font-medium text-slate-500">状态</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">今日消耗</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">展示</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">点击</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">转化</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">CPA</th>
                  <th className="text-right px-2 py-2 font-medium text-slate-500">ROI</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 15).map(c => {
                  const m = metrics[c.id];
                  const exhausted = (m?.dailySpend||0) >= c.dailyBudget;
                  return (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2"><input type="checkbox" className="rounded" /></td>
                      <td className="px-2 py-2">
                        <Link href={`/campaigns/detail?id=${c.id}`} className="text-blue-600 hover:underline font-medium">
                          {c.name}
                        </Link>
                        <div className="text-[10px] text-slate-400">{c.bidMode.toUpperCase()} ¥{c.bidPrice}</div>
                      </td>
                      <td className="px-2 py-2 text-slate-500">{platformNames[c.platform] || c.platform}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                          c.status==='active' ? 'bg-green-50 text-green-600' :
                          c.status==='paused' ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-100 text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status==='active'&&!exhausted?'bg-green-500 animate-pulse':c.status==='active'?'bg-yellow-400':'bg-current'}`} />
                          {statusLabel[c.status]}
                          {c.status==='active' && exhausted && <span className="text-amber-500 ml-0.5">预算耗尽</span>}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-slate-700">
                        ¥{m?.dailySpend.toFixed(0)||'0'}<span className="text-[10px] text-slate-400">/{c.dailyBudget}</span>
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-slate-500">{m?.impressions.toLocaleString()||'0'}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-500">{m?.clicks.toLocaleString()||'0'}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-700 font-medium">{m?.conversions||'0'}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-600">¥{m?.cpa.toFixed(1)||'-'}</td>
                      <td className="px-2 py-2 text-right font-mono">
                        <span className={(m?.roi||0)>=1?'text-green-600':'text-red-400'}>{(m?.roi||0).toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
          {/* 预算总览 */}
          {activeCampaigns.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 space-y-1">
              {activeCampaigns.map(c => {
                const m = metrics[c.id];
                const dp = m ? (m.dailySpend / c.dailyBudget * 100) : 0;
                const tp = m ? (m.spend / c.totalBudget * 100) : 0;
                return (
                  <div key={c.id} className="flex items-center gap-2 text-[10px]">
                    <span className="w-24 truncate text-slate-500">{c.name}</span>
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${dp>=95?'bg-green-400':dp>70?'bg-yellow-400':'bg-blue-400'}`}
                        style={{width:`${Math.min(100,dp)}%`}} />
                    </div>
                    <span className="w-20 text-right text-slate-400">日 ¥{m?.dailySpend.toFixed(0)||0}/{c.dailyBudget}</span>
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${tp>=95?'bg-red-400':tp>80?'bg-orange-400':'bg-slate-300'}`}
                        style={{width:`${Math.min(100,tp)}%`}} />
                    </div>
                    <span className="w-20 text-right text-slate-400">总 ¥{m?.spend.toFixed(0)||0}/{c.totalBudget}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧职业面板 */}
        <div className="space-y-3">
          <SmartAnalysis />
          <div className="bg-white rounded border border-slate-200 p-3">
            <h3 className="text-[11px] font-medium text-slate-500 uppercase mb-2">职业成长</h3>
            <div className="text-center mb-2">
              <span className="text-xl">{careerStage===1?'🌱':careerStage===2?'🌿':careerStage===3?'🌳':'🏆'}</span>
              <p className="text-sm font-bold text-slate-800">{currentStage?.title}</p>
              <p className="text-[10px] text-slate-400">{exp} / {currentStage?.expRequired===Infinity?'∞':currentStage?.expRequired} EXP</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{width:`${progressPercent}%`}} />
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 p-3">
            <h3 className="text-[11px] font-medium text-slate-500 uppercase mb-2">可用平台</h3>
            <div className="space-y-1 text-[11px]">
              {currentStage?.availablePlatforms.slice(0,8).map(pid => {
                const p = PLATFORMS[pid];
                return p ? <div key={pid} className="flex justify-between"><span className="text-slate-600">{p.name}</span><span className="text-slate-400">CPM ¥{p.avgCPM}</span></div> : null;
              })}
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 p-3">
            <h3 className="text-[11px] font-medium text-slate-500 uppercase mb-2">账户统计</h3>
            <div className="space-y-1 text-[11px]">
              <StatR l="累计消耗" v={`¥${(stats.totalSpend+todaySpend).toLocaleString()}`} />
              <StatR l="累计转化" v={(stats.totalConversions+todayConv).toLocaleString()} />
              <StatR l="最佳ROI" v={Math.max(stats.bestROI,todayROI).toFixed(2)} />
              <StatR l="完成任务" v={`${stats.missionsCompleted} 个`} />
              <StatR l="经营天数" v={`${stats.daysPlayed+simDays} 天`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label:string; value:string; sub:string; accent?:boolean }) {
  return (
    <div className={`bg-white rounded border px-3 py-2.5 ${accent ? 'border-l-2 border-l-blue-500' : 'border-slate-200'}`}>
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className="text-base font-bold text-slate-800 font-mono">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

function StatR({ l, v }: { l:string; v:string }) {
  return <div className="flex justify-between"><span className="text-slate-400">{l}</span><span className="text-slate-600 font-mono">{v}</span></div>;
}
