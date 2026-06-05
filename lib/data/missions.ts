import { MissionConfig } from '../engine/types';

export const MISSIONS: MissionConfig[] = [

  // ═══════════════════════════════════════════
  // Tier 0: 新手引导 (7个) — 秒级完成，纯操作
  // ═══════════════════════════════════════════
  { id:'t0_01',title:'📝 创建第一条计划',description:'打开推广计划页面，点新建按钮，选择抖音信息流，随便填完6步。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：先摸摸后台，建条计划感受一下。',conditions:[{type:'plan_count',operator:'gte',value:1}],rewards:{exp:30,money:50},mentorHint:'点右上角 +新建，按向导走一遍。10秒搞定。' },
  { id:'t0_02',title:'▶ 启动投放',description:'进计划详情点开始投放，回仪表盘设 100× 速度。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：勇敢点，花的是模拟币。',conditions:[{type:'budget_spent',operator:'gte',value:1}],rewards:{exp:30,money:80},mentorHint:'进详情→点绿色按钮→回仪表盘→顶栏点100×→等5秒。',unlockAfter:['t0_01'] },
  { id:'t0_03',title:'👀 拿到第一个转化',description:'在100×速度下等30秒，观察数据跳动。拿到1个转化即可。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：看到数字在跳了吗？这就是投流的魅力。',conditions:[{type:'conversions',operator:'gte',value:1}],rewards:{exp:40,money:100},mentorHint:'100×跑30秒。如果1分钟还没转化，检查计划是否投放中、日预算是否≥300。',unlockAfter:['t0_02'] },
  { id:'t0_04',title:'📊 凑够5个转化',description:'让计划跑出5个转化，感受CTR/CVR/CPA的含义。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：会看数据和会投一样重要。',conditions:[{type:'conversions',operator:'gte',value:5}],rewards:{exp:50,money:120},mentorHint:'进详情页看CTR/CVR/CPA。CTR<2%说明素材不行，CVR<2%说明人群不对。',unlockAfter:['t0_03'] },
  { id:'t0_05',title:'🔧 创建第2条计划',description:'换一个人群或素材，创建第2条做对比。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：第一条是基准线，第二条尝试更好的方案。',conditions:[{type:'plan_count',operator:'gte',value:2},{type:'conversions',operator:'gte',value:10}],rewards:{exp:100,money:200},mentorHint:'第二条换个人群（如高消费意愿）或素材。两条同时跑，对比CPA。',unlockAfter:['t0_04'] },
  { id:'t0_06',title:'⏰ 理解日预算',description:'等日预算花到接近上限，观察跨天后自动重置。',difficulty:'tutorial',stageRequired:1,clientBrief:'老王：日预算是真实平台的基础机制，每天0点重置。',conditions:[{type:'budget_spent',operator:'gte',value:100}],rewards:{exp:100,money:200},mentorHint:'100×跑几分钟。日预算花完后计划状态不变但不再花钱，跨天后自动恢复。',unlockAfter:['t0_05'] },
  { id:'t0_07',title:'🎓 新手毕业',description:'累计30转化+CPA≤10元+消耗≥200元。',difficulty:'easy',stageRequired:1,clientBrief:'老王：你的毕业考！',conditions:[{type:'conversions',operator:'gte',value:30,platform:'douyin_feed'},{type:'cpa',operator:'lte',value:10,platform:'douyin_feed'},{type:'budget_spent',operator:'gte',value:200}],rewards:{exp:500,money:1000,title:'认证投手'},mentorHint:'日预算500、OCPM15元、年轻女性+电商素材。100×跑2-3分钟。',unlockAfter:['t0_06'] },

  // ═══════════════════════════════════════════
  // Tier 1: 入门 (8个) — 需要基本判断
  // ═══════════════════════════════════════════
  { id:'t1_01',title:'🎯 CPA压到8元',description:'单条计划CPA≤8元，至少15个转化验证。',difficulty:'easy',stageRequired:1,clientBrief:'美容院老板：获客成本不能超过8块。',conditions:[{type:'cpa',operator:'lte',value:8,platform:'douyin_feed'},{type:'conversions',operator:'gte',value:15,platform:'douyin_feed'}],rewards:{exp:200,money:400},mentorHint:'降CPA口诀：对的人群(年轻女性)+对的素材(美妆类)+合理出价(OCPM15-18)。' },
  { id:'t1_02',title:'📈 CTR超过3%',description:'单条计划CTR突破3%。证明你的素材吸引力。',difficulty:'easy',stageRequired:1,clientBrief:'客户：怎么判断素材好不好？看CTR。',conditions:[{type:'ctr',operator:'gte',value:0.03},{type:'conversions',operator:'gte',value:10}],rewards:{exp:200,money:400},mentorHint:'高CTR素材：吸引力80+的素材+精准人群。游戏类素材投学生群体CTR最高。' },
  { id:'t1_03',title:'💰 消耗突破500元',description:'累计消耗达到500元。说明你已经跑了一段时间了。',difficulty:'easy',stageRequired:1,clientBrief:'量变引起质变，500元是第一个里程碑。',conditions:[{type:'budget_spent',operator:'gte',value:500}],rewards:{exp:250,money:500},mentorHint:'多条计划同时跑，100×速度几分钟就达标。' },
  { id:'t1_04',title:'🏪 千川电商初体验',description:'在巨量千川平台创建一条计划并获取10个转化。',difficulty:'easy',stageRequired:1,clientBrief:'试试抖音电商专属的千川平台。',conditions:[{type:'conversions',operator:'gte',value:10,platform:'qianchuan'}],rewards:{exp:200,money:400},mentorHint:'千川专做电商，CPM18元，选商品卡或视频带货。电商素材匹配度100%。' },
  { id:'t1_05',title:'📱 朋友圈广告',description:'在微信朋友圈创建一条广告并获取5个转化。',difficulty:'easy',stageRequired:1,clientBrief:'试试微信朋友圈广告——人群更成熟，信任度更高。',conditions:[{type:'conversions',operator:'gte',value:5,platform:'wechat_moments'}],rewards:{exp:200,money:400},mentorHint:'朋友圈CPM25元较贵但转化率高。适合金融、教育、家居行业。' },
  { id:'t1_06',title:'🎬 快手试水',description:'在快手信息流创建计划并获取10个转化。',difficulty:'easy',stageRequired:1,clientBrief:'快手——下沉市场之王，CPM只有10元。',conditions:[{type:'conversions',operator:'gte',value:10,platform:'kuaishou_feed'}],rewards:{exp:200,money:400},mentorHint:'快手CPM仅10元！选接地气的素材，人群选下沉市场。游戏和食品行业最配。' },
  { id:'t1_07',title:'🔍 搜索广告尝鲜',description:'在抖音搜索广告创建计划并获取5个转化。',difficulty:'easy',stageRequired:1,clientBrief:'搜索广告——用户主动搜，转化意愿最强。',conditions:[{type:'conversions',operator:'gte',value:5,platform:'douyin_search'}],rewards:{exp:200,money:400},mentorHint:'搜索广告CVR最高(4%)，CPM贵但精准。教育、金融行业最适合。' },
  { id:'t1_08',title:'🌍 4平台各建一条',description:'在4个不同平台各有至少1条计划。',difficulty:'easy',stageRequired:1,clientBrief:'全面了解各平台差异。',conditions:[{type:'platform_count',operator:'gte',value:4}],rewards:{exp:300,money:600},mentorHint:'抖音+快手+朋友圈+小红书，各建一条。感受CPM、CTR、CVR的平台差异。' },

  // ═══════════════════════════════════════════
  // Tier 2: 进阶 (8个) — 需要数据分析
  // ═══════════════════════════════════════════
  { id:'t2_01',title:'🔬 正式A/B测试',description:'两条计划同平台同人群同出价，只换素材。合计50+转化决出优胜。',difficulty:'medium',stageRequired:2,clientBrief:'柯姐：科学投放从A/B测试开始。',conditions:[{type:'plan_count',operator:'gte',value:2},{type:'conversions',operator:'gte',value:50}],rewards:{exp:600,money:1500},mentorHint:'柯姐铁律：只改一个变量！两条计划除了素材不同，其他完全一样。' },
  { id:'t2_02',title:'📈 ROI破1.5',description:'综合ROI>1.5，每花1元赚回1.5元。消耗≥1000元验证。',difficulty:'medium',stageRequired:2,clientBrief:'客户：ROI不达标不续约。',conditions:[{type:'roi',operator:'gte',value:1.5},{type:'budget_spent',operator:'gte',value:1000}],rewards:{exp:800,money:2000},mentorHint:'提ROI两条路：降CPA(精准匹配)+提客单价(教育/金融/旅游高客单价行业)。' },
  { id:'t2_03',title:'🌿 小红书种草',description:'小红书信息流获取20+转化。CPM贵但用户消费意愿强。',difficulty:'medium',stageRequired:2,clientBrief:'美妆品牌要在小红书种草。75%女性用户，精致内容为王。',conditions:[{type:'conversions',operator:'gte',value:20,platform:'xiaohongshu_feed'}],rewards:{exp:500,money:1200},mentorHint:'小红书CPM28元(抖音的2倍)但CVR高。素材要精致有生活感，别用硬广风。' },
  { id:'t2_04',title:'🎯 CPA压到5元',description:'单条CPA≤5元。需要极致的人群-素材-出价匹配。',difficulty:'medium',stageRequired:2,clientBrief:'客户预算有限，获客成本必须控制在5元以内。',conditions:[{type:'cpa',operator:'lte',value:5},{type:'conversions',operator:'gte',value:20}],rewards:{exp:700,money:1500},mentorHint:'低CPA公式：快手(CPM10元)+游戏素材(高CTR)+通投人群(大流量)+OCPM10元出价。' },
  { id:'t2_05',title:'📢 同时跑3条计划',description:'3条活跃计划同时投放，总转化80+，管理多线作战。',difficulty:'medium',stageRequired:2,clientBrief:'规模扩大了，需要同时盯多条计划。',conditions:[{type:'plan_count',operator:'gte',value:3},{type:'conversions',operator:'gte',value:80}],rewards:{exp:600,money:1500},mentorHint:'3条计划分3个不同平台或人群，避免内部竞争。每条日预算300-500。' },
  { id:'t2_06',title:'🛒 拼多多投流',description:'在拼多多推广创建计划，体验极致性价比平台的投放逻辑。',difficulty:'medium',stageRequired:2,clientBrief:'拼多多CPM只要6元！试试这个极致性价比平台。',conditions:[{type:'conversions',operator:'gte',value:15,platform:'pinduoduo_ads'}],rewards:{exp:500,money:1000},mentorHint:'拼多多CPM极低(6元)适合跑量。电商类匹配度100%，下沉市场用户为主。' },
  { id:'t2_07',title:'📦 京东投流',description:'在京东京准通创建计划，品质电商的投放逻辑不同。',difficulty:'medium',stageRequired:2,clientBrief:'京东用户看重品质和物流，投放策略要调整。',conditions:[{type:'conversions',operator:'gte',value:10,platform:'jd_ads'}],rewards:{exp:500,money:1000},mentorHint:'京东CPM12元，用户品质敏感。家居、健康行业匹配度高。搜索+商品卡组合。' },
  { id:'t2_08',title:'🔥 百度搜索+信息流',description:'在百度两个平台各建一条计划，体验搜索+推荐的组合打法。',difficulty:'medium',stageRequired:2,clientBrief:'百度搜索(精准需求)+信息流(内容推荐)=全覆盖。',conditions:[{type:'conversions',operator:'gte',value:20,platform:'baidu_search'},{type:'plan_count',operator:'gte',value:2}],rewards:{exp:600,money:1200},mentorHint:'百度搜索CVR高(4%)适合教育金融，百度信息流CPM低适合放量。两条互补。' },

  // ═══════════════════════════════════════════
  // Tier 3: 挑战 (6个) — 需要策略思维
  // ═══════════════════════════════════════════
  { id:'t3_01',title:'🌐 跨平台组合',description:'同时2+平台有活跃计划，总转化150+，ROI>2.0。',difficulty:'hard',stageRequired:3,clientBrief:'陈总：真正的投手看全局，不是看单条计划。',conditions:[{type:'platform_count',operator:'gte',value:2},{type:'conversions',operator:'gte',value:150},{type:'roi',operator:'gte',value:2.0}],rewards:{exp:1500,money:8000},mentorHint:'陈总6:4法则：主力平台60%预算做量，辅助40%做ROI。抖音跑量+小红书跑质。' },
  { id:'t3_02',title:'🏭 5条计划同步',description:'5条活跃计划，总转化300+，ROI>1.8。',difficulty:'hard',stageRequired:3,clientBrief:'大规模投放管理能力是高级优化师的标志。',conditions:[{type:'plan_count',operator:'gte',value:5},{type:'conversions',operator:'gte',value:300},{type:'roi',operator:'gte',value:1.8}],rewards:{exp:2500,money:15000},mentorHint:'5条分组：2主力(大预算)+2测试(新方向)+1防御(竞品关键词)。人群错开防内卷。' },
  { id:'t3_03',title:'💎 ROI突破3.0',description:'综合ROI>3.0，每花1元赚3元。行业顶尖水平。消耗≥5000元验证。',difficulty:'hard',stageRequired:3,clientBrief:'顶级客户要求ROI3.0+，这是1%投手的门槛。',conditions:[{type:'roi',operator:'gte',value:3.0},{type:'budget_spent',operator:'gte',value:5000}],rewards:{exp:3000,money:20000,title:'ROI传奇'},mentorHint:'ROI3.0秘诀：高客单价(金融/教育500+元)+搜索广告(最高CVR)+精准人群+低CPA。' },
  { id:'t3_04',title:'⚡ 单日100转化',description:'一天内所有计划合计100+转化，ROI>2.0。',difficulty:'hard',stageRequired:3,clientBrief:'完美的一天——所有计划都在最佳状态。',conditions:[{type:'conversions',operator:'gte',value:100},{type:'roi',operator:'gte',value:2.0}],rewards:{exp:2500,money:12000,title:'完美投手'},mentorHint:'至少5条计划+大日预算(5000+/条)+100×速度持续跑。多个平台同时发力。' },
  { id:'t3_05',title:'🌍 TikTok出海',description:'在TikTok平台获取30+转化，体验海外投放。',difficulty:'hard',stageRequired:3,clientBrief:'出海！TikTok月活15亿，全球最大的短视频流量池。',conditions:[{type:'conversions',operator:'gte',value:30,platform:'tiktok_feed'}],rewards:{exp:2000,money:10000},mentorHint:'TikTok CPM30元(贵)但全球覆盖。电商和游戏行业匹配度最高。素材要国际化风格。' },
  { id:'t3_06',title:'📊 千转化里程碑',description:'累计获取1000个转化。这是量的飞跃。',difficulty:'hard',stageRequired:3,clientBrief:'1000个转化的数据量，足以让你发现任何投放规律。',conditions:[{type:'conversions',operator:'gte',value:1000}],rewards:{exp:5000,money:25000,title:'千转化达人'},mentorHint:'多平台+多条计划+大日预算+100×持续跑。这是长期积累的目标。' },

  // ═══════════════════════════════════════════
  // Tier 4: 专家 (4个) — 终极挑战
  // ═══════════════════════════════════════════
  { id:'t4_01',title:'🎯 极限CPA:3元',description:'单条CPA≤3元，至少50个转化。极致优化。',difficulty:'expert',stageRequired:4,clientBrief:'客户：获客成本3元，做得到就续约100万。',conditions:[{type:'cpa',operator:'lte',value:3},{type:'conversions',operator:'gte',value:50}],rewards:{exp:5000,money:30000,title:'极限优化师'},mentorHint:'极限公式：快手(CPM10)+通投+游戏素材(高CTR)+OCPM8元。这是游戏里CPA最低的组合。' },
  { id:'t4_02',title:'🏆 投流之神',description:'累计1000转化+消耗50000元+ROI>2.5。终极成就。',difficulty:'expert',stageRequired:4,clientBrief:'证明你是这个行业最顶尖的存在。',conditions:[{type:'conversions',operator:'gte',value:1000},{type:'budget_spent',operator:'gte',value:50000},{type:'roi',operator:'gte',value:2.5}],rewards:{exp:10000,money:100000,title:'🏆投流之神'},mentorHint:'持续经营。多平台协同+大预算+不断优化。你已经不需要提示了。' },
  { id:'t4_03',title:'💰 十万消耗',description:'累计消耗突破100000元。真正的广告费燃烧者。',difficulty:'expert',stageRequired:4,clientBrief:'你管理的预算超过了大多数小公司的年营收。',conditions:[{type:'budget_spent',operator:'gte',value:100000}],rewards:{exp:10000,money:50000,title:'💰广告大玩家'},mentorHint:'每天5+条计划，每条日预算5000+，100×持续跑。这是马拉松不是短跑。' },
  { id:'t4_04',title:'🌟 全平台制霸',description:'在8个以上不同平台都有转化记录。真正的全栈投手。',difficulty:'expert',stageRequired:4,clientBrief:'没有你投不了的平台。从抖音到TikTok，从朋友圈到知乎。',conditions:[{type:'platform_count',operator:'gte',value:8}],rewards:{exp:8000,money:40000,title:'🌟全平台大师'},mentorHint:'抖音系+腾讯系+小红书+快手+百度+微博+B站+知乎+TikTok+拼多多+京东。全部试一遍！' },
];

export function getMissionsForStage(stage: number): MissionConfig[] {
  return MISSIONS.filter(m => m.stageRequired <= stage);
}

export function getMission(id: string): MissionConfig | undefined {
  return MISSIONS.find(m => m.id === id);
}
