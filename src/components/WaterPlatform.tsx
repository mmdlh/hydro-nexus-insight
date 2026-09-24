import { Link } from "@tanstack/react-router";
import * as echarts from "echarts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Droplets,
  Gauge,
  Network,
  Radio,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useEffect, useRef } from "react";
import cityBackground from "@/assets/smart-water-city-bg.jpg";

type PageKey = "overview" | "network" | "dispatch" | "alerts" | "equipment" | "reports";
type ChartKind = "line" | "bar" | "radar" | "pie" | "area" | "scatter";

const navItems = [
  { key: "overview", label: "态势总览", to: "/", icon: Activity },
  { key: "network", label: "管网监测", to: "/network", icon: Network },
  { key: "dispatch", label: "智慧调度", to: "/dispatch", icon: Radio },
  { key: "alerts", label: "告警中心", to: "/alerts", icon: AlertTriangle },
  { key: "equipment", label: "设备运维", to: "/equipment", icon: Wrench },
  { key: "reports", label: "分析报表", to: "/reports", icon: BarChart3 },
] as const;

const pageCopy: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: "供水态势总览", subtitle: "全域感知 · 实时管网 GIS 态势 · 数据每 5 秒刷新" },
  network: { title: "管网运行监测", subtitle: "2,846 公里管线 · 压力分区 · 漏损智能识别" },
  dispatch: { title: "智慧供水调度", subtitle: "需水预测 · 泵组协同 · 能耗最优控制" },
  alerts: { title: "全域告警中心", subtitle: "风险聚合 · 事件闭环 · 处置过程追踪" },
  equipment: { title: "设备全生命周期", subtitle: "状态检修 · 健康评估 · 工单协同" },
  reports: { title: "运营分析报表", subtitle: "产销差分析 · 水质洞察 · 经营指标对标" },
};

const metricSets: Record<PageKey, Array<[string, string, string]>> = {
  overview: [["今日供水量", "18.6 万吨", "+2.4%"], ["平均压力", "0.42 MPa", "运行平稳"], ["在线设备", "1,284 台", "在线率 98.6%"], ["漏损率", "6.8%", "优于目标 1.2%"], ["水质达标", "99.2%", "浊度 0.31 NTU"], ["活跃告警", "7 条", "2 条待处置"]],
  network: [["管网总长", "2,846 km", "+18.2 km"], ["压力监测点", "438 个", "在线率 99.1%"], ["最低压力", "0.23 MPa", "城西 DMA-12"], ["夜间最小流量", "386 m³/h", "下降 4.8%"], ["疑似漏点", "3 处", "置信度 > 85%"], ["阀门启闭", "96.7%", "14 个检修"]],
  dispatch: [["预测需水量", "19.2 万吨", "误差 1.6%"], ["当前供水量", "18.6 万吨", "调节余量 3.2%"], ["泵组效率", "87.4%", "+2.1%"], ["单位能耗", "0.286 kWh/m³", "节能 4.3%"], ["清水池水位", "4.82 m", "安全区间"], ["调度指令", "12 条", "执行率 100%"]],
  alerts: [["今日告警", "38 条", "较昨日 -12%"], ["紧急事件", "2 条", "处置中"], ["平均响应", "4.6 min", "快 1.2 min"], ["闭环率", "94.7%", "+3.1%"], ["重复告警", "3 条", "已抑制 26 条"], ["值班人员", "8 人", "全部在线"]],
  equipment: [["设备资产", "1,302 台", "总值 3.8 亿元"], ["健康设备", "1,184 台", "占比 90.9%"], ["预测性维护", "23 项", "本月计划"], ["在途工单", "17 张", "超时 2 张"], ["备件库存", "86.2%", "满足率"], ["平均无故障", "386 天", "+24 天"]],
  reports: [["本月供水", "568 万吨", "+3.8%"], ["售水量", "529 万吨", "+4.1%"], ["产销差率", "6.87%", "下降 0.42%"], ["综合电耗", "162 万 kWh", "节省 7.4 万"], ["水质合格", "99.36%", "+0.12%"], ["运营成本", "0.82 元/m³", "下降 2.6%"]],
};

const axis = { axisLine: { lineStyle: { color: "rgba(126,235,255,.18)" } }, axisLabel: { color: "rgba(188,239,250,.48)", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(126,235,255,.08)" } } };
const palette = ["#20B8F2", "#7EEBFF", "#1266A8", "#39E6A7", "#FFB85C"];

function chartOption(kind: ChartKind, variant = 0): echarts.EChartsOption {
  const labels = variant % 2 ? ["城东", "城西", "城南", "城北", "开发区", "临港"] : ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const base = { color: palette, backgroundColor: "transparent", textStyle: { fontFamily: "DM Sans", color: "#BCEFFA" }, tooltip: { trigger: "axis", backgroundColor: "rgba(7,26,47,.92)", borderColor: "rgba(126,235,255,.35)", textStyle: { color: "#DFFAFF" } }, animationDuration: 850 } as echarts.EChartsOption;
  if (kind === "pie") return { ...base, tooltip: { trigger: "item" }, legend: { top: 4, right: 4, orient: "vertical", textStyle: { color: "rgba(188,239,250,.62)", fontSize: 10 } }, series: [{ type: "pie", radius: ["48%", "72%"], center: ["40%", "55%"], label: { show: false }, itemStyle: { borderColor: "#071A2F", borderWidth: 3 }, data: [{ value: 58, name: "泵组" }, { value: 24, name: "输配" }, { value: 12, name: "净化" }, { value: 6, name: "其他" }] }] };
  if (kind === "radar") return { ...base, tooltip: {}, radar: { radius: "62%", center: ["50%", "56%"], splitNumber: 4, indicator: ["浊度", "余氯", "pH", "氨氮", "色度", "电导"].map((name) => ({ name, max: 100 })), axisName: { color: "rgba(188,239,250,.58)", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(126,235,255,.14)" } }, splitArea: { areaStyle: { color: ["rgba(32,184,242,.01)", "rgba(32,184,242,.04)"] } }, axisLine: { lineStyle: { color: "rgba(126,235,255,.15)" } } }, series: [{ type: "radar", symbolSize: 4, areaStyle: { color: "rgba(32,184,242,.24)" }, lineStyle: { color: "#7EEBFF", width: 2 }, data: [{ value: [96, 88, 94, 90, 93, 86] }] }] };
  if (kind === "scatter") return { ...base, grid: { top: 24, right: 18, bottom: 28, left: 42 }, xAxis: { ...axis, name: "运行时长", nameTextStyle: { color: "rgba(188,239,250,.4)" } }, yAxis: { ...axis, name: "健康度", nameTextStyle: { color: "rgba(188,239,250,.4)" } }, series: [{ type: "scatter", symbolSize: (value: number[]) => Math.max(8, (value[2] ?? 0) / 3), data: [[12, 96, 28], [26, 88, 44], [33, 74, 36], [46, 65, 52], [58, 91, 24], [72, 48, 42], [81, 82, 33]] }] };
  const primarySeries: echarts.SeriesOption = kind === "bar"
    ? { name: variant % 2 ? "实际值" : "供水量", type: "bar", barMaxWidth: 22, data: [42, 58, 51, 76, 69, 88] }
    : { name: variant % 2 ? "实际值" : "供水量", type: "line", smooth: true, data: [42, 58, 51, 76, 69, 88], lineStyle: { width: 3 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(32,184,242,.42)" }, { offset: 1, color: "rgba(32,184,242,0)" }]) } };
  const series: echarts.SeriesOption[] = [primarySeries];
  if (variant > 1) series.push({ name: "目标值", type: "line", smooth: true, data: [45, 54, 60, 72, 74, 82], lineStyle: { color: "#39E6A7", type: "dashed" } });
  return { ...base, legend: { top: 4, left: "center", textStyle: { color: "rgba(188,239,250,.62)", fontSize: 10 } }, grid: { top: 40, right: 16, bottom: 24, left: 42 }, xAxis: { type: "category", data: labels, ...axis }, yAxis: { type: "value", ...axis }, series };
}

function Chart({ kind, variant = 0 }: { kind: ChartKind; variant?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(chartOption(kind, variant), true);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); chart.dispose(); };
  }, [kind, variant]);
  return <div ref={ref} className="h-full min-h-44 w-full" />;
}

function GlassPanel({ title, kicker, children, className = "" }: { title: string; kicker?: string; children: React.ReactNode; className?: string }) {
  return <section className={`water-panel group ${className}`}><div className="panel-flow" /><div className="relative z-10 flex h-full flex-col"><header className="mb-3 flex items-start justify-between"><div><p className="font-display text-sm font-semibold text-foreground">{title}</p>{kicker && <p className="mt-0.5 text-[10px] text-muted-foreground">{kicker}</p>}</div><span className="status-dot" /></header><div className="min-h-0 flex-1">{children}</div></div></section>;
}

function Metrics({ page }: { page: PageKey }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{metricSets[page].map(([label, value, note], index) => <div className="metric-panel animate-rise" style={{ animationDelay: `${index * 45}ms` }} key={label}><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-semibold text-primary xl:text-2xl">{value}</p><p className="mt-1 text-[10px] text-secondary-foreground">{note}</p></div>)}</div>;
}

const alarmRows = [
  ["03:12:08", "城东 3 号泵站", "压力越限", "0.61 MPa", "紧急"], ["03:06:42", "城西 DMA-12", "疑似漏损", "置信度 91%", "处置中"], ["02:58:16", "南城水质站", "浊度偏高", "0.48 NTU", "关注"], ["02:41:55", "北城 7 号泵", "振动异常", "4.2 mm/s", "派单"], ["02:30:21", "临港 9 号水表", "通信中断", "离线 12min", "离线"],
];

function DataTable({ equipment = false }: { equipment?: boolean }) {
  const rows = equipment ? [["P-102", "城东加压泵", "92", "运行 3,842h", "健康"], ["V-208", "城西电动阀", "78", "运行 6,129h", "关注"], ["T-033", "南城浊度仪", "64", "运行 8,012h", "检修"], ["F-210", "北城流量计", "88", "运行 4,680h", "健康"], ["B-017", "临港提升泵", "53", "运行 9,240h", "工单中"]] : alarmRows;
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="text-[10px] text-muted-foreground"><tr>{(equipment ? ["编号", "设备", "健康度", "累计运行", "状态"] : ["时间", "设备 / 位置", "事件类型", "实时值", "状态"]).map((h) => <th className="border-b border-border px-3 py-2 font-medium" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-b border-border/60 transition-colors hover:bg-accent/30" key={row[0]}>{row.map((cell, i) => <td className={`px-3 py-2.5 ${i === row.length - 1 ? "text-primary" : "text-foreground/70"}`} key={cell}>{i === row.length - 1 && <span className="mr-2 inline-block size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}{cell}</td>)}</tr>)}</tbody></table></div>;
}

function NetworkMap() {
  return <div className="network-map relative h-full min-h-[360px] overflow-hidden rounded-md"><img src={cityBackground} alt="智慧城市供水管网夜景" width={1920} height={1080} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-background/35" /><svg viewBox="0 0 800 380" className="absolute inset-0 size-full" aria-hidden="true"><g fill="none" stroke="currentColor" className="text-primary"><path d="M10 305 C120 280 135 160 260 190 S430 320 530 230 S660 80 790 115" strokeWidth="3" /><path d="M82 80 C190 115 205 260 350 238 S555 82 720 270" strokeWidth="2" opacity=".7" /></g>{[[82,80],[260,190],[350,238],[530,230],[720,270],[660,130]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="10" fill="rgba(32,184,242,.12)" stroke="#7EEBFF"/><circle cx={x} cy={y} r="3" fill="#7EEBFF"/></g>)}</svg><div className="absolute bottom-3 left-3 flex gap-3 rounded bg-background/70 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md"><span><i className="mr-1 inline-block size-1.5 rounded-full bg-primary" />正常节点 1,240</span><span><i className="mr-1 inline-block size-1.5 rounded-full bg-warning" />风险点 3</span></div></div>;
}

function Overview() { return <><Metrics page="overview" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="核心供水态势 · 管网 GIS" kicker="压力 / 流量 / 泄漏点位实时叠加" className="col-span-12 min-h-[470px] lg:col-span-8"><NetworkMap /></GlassPanel><div className="col-span-12 grid gap-4 lg:col-span-4"><GlassPanel title="24h 供水量趋势"><Chart kind="line" /></GlassPanel><GlassPanel title="水质六维评估"><Chart kind="radar" /></GlassPanel></div><GlassPanel title="分区用水量" className="col-span-12 lg:col-span-4"><Chart kind="bar" variant={1} /></GlassPanel><GlassPanel title="能耗结构" className="col-span-12 lg:col-span-4"><Chart kind="pie" /></GlassPanel><GlassPanel title="告警与设备状态" className="col-span-12 lg:col-span-4"><DataTable /></GlassPanel></div></>; }

function NetworkPage() { return <><Metrics page="network" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="DMA 分区压力拓扑" kicker="点击节点可追溯上下游" className="col-span-12 min-h-[560px] xl:col-span-7"><NetworkMap /></GlassPanel><div className="col-span-12 grid gap-4 xl:col-span-5"><GlassPanel title="压力波动曲线"><Chart kind="line" variant={2} /></GlassPanel><div className="grid grid-cols-2 gap-4"><GlassPanel title="漏损等级"><Chart kind="pie" /></GlassPanel><GlassPanel title="分区夜流"><Chart kind="bar" variant={1} /></GlassPanel></div></div><GlassPanel title="疑似漏点定位清单" className="col-span-12"><DataTable /></GlassPanel></div></>; }

function DispatchPage() { return <><Metrics page="dispatch" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="未来 24h 需水预测" kicker="AI 预测与计划供水对比" className="col-span-12 min-h-[360px] xl:col-span-8"><Chart kind="area" variant={3} /></GlassPanel><GlassPanel title="调度策略评分" className="col-span-12 xl:col-span-4"><Chart kind="radar" /></GlassPanel><GlassPanel title="四大水厂供水负荷" className="col-span-12 xl:col-span-5"><Chart kind="bar" variant={1} /></GlassPanel><GlassPanel title="泵组运行效率" className="col-span-12 xl:col-span-3"><Chart kind="pie" /></GlassPanel><GlassPanel title="调度指令流" className="col-span-12 xl:col-span-4"><div className="space-y-3">{["东城二泵频率调整至 46Hz", "南城清水池目标水位 4.9m", "临港联络阀开度调整至 68%", "北城高峰供水策略已下发"].map((x,i)=><div className="flex gap-3 border-l border-primary/40 pl-3" key={x}><span className="font-display text-xs text-primary">0{i+1}</span><div><p className="text-xs text-foreground/75">{x}</p><p className="text-[10px] text-muted-foreground">已执行 · {i*4+2} 分钟前</p></div></div>)}</div></GlassPanel></div></>; }

function AlertsPage() { return <><Metrics page="alerts" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="告警时间热力分布" kicker="颜色越亮表示事件越集中" className="col-span-12 min-h-[300px] xl:col-span-8"><Chart kind="bar" variant={2} /></GlassPanel><GlassPanel title="告警来源构成" className="col-span-12 xl:col-span-4"><Chart kind="pie" /></GlassPanel><GlassPanel title="实时事件队列" className="col-span-12 xl:col-span-9"><DataTable /></GlassPanel><GlassPanel title="处置 SLA" className="col-span-12 xl:col-span-3"><div className="grid h-full place-items-center"><div className="relative grid size-40 place-items-center rounded-full border-[12px] border-primary/15 after:absolute after:inset-[-12px] after:rounded-full after:border-[12px] after:border-primary after:border-b-transparent after:border-l-transparent"><div className="text-center"><p className="font-display text-3xl font-semibold text-primary">94.7%</p><p className="text-[10px] text-muted-foreground">按时闭环</p></div></div></div></GlassPanel></div></>; }

function EquipmentPage() { return <><Metrics page="equipment" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="资产健康矩阵" kicker="气泡大小代表资产价值" className="col-span-12 min-h-[370px] xl:col-span-5"><Chart kind="scatter" /></GlassPanel><GlassPanel title="设备健康趋势" className="col-span-12 xl:col-span-7"><Chart kind="line" variant={2} /></GlassPanel><GlassPanel title="重点设备状态" className="col-span-12 xl:col-span-8"><DataTable equipment /></GlassPanel><GlassPanel title="本月维护节奏" className="col-span-12 xl:col-span-4"><div className="grid grid-cols-7 gap-1.5">{Array.from({length:35},(_,i)=><div key={i} className={`aspect-square rounded-sm ${i%9===0 ? "bg-warning/70" : i%4===0 ? "bg-primary/65" : "bg-primary/10"}`} title={`${i+1} 日`} />)}</div><div className="mt-4 flex justify-between text-[10px] text-muted-foreground"><span>已完成 18</span><span>计划中 7</span><span>逾期 2</span></div></GlassPanel></div></>; }

function ReportsPage() { return <><Metrics page="reports" /><div className="mt-4 grid grid-cols-12 gap-4"><GlassPanel title="供售水与产销差趋势" kicker="近 12 个月经营核心指标" className="col-span-12 min-h-[390px] xl:col-span-9"><Chart kind="area" variant={3} /></GlassPanel><GlassPanel title="成本构成" className="col-span-12 xl:col-span-3"><Chart kind="pie" /></GlassPanel><GlassPanel title="水厂综合绩效雷达" className="col-span-12 xl:col-span-4"><Chart kind="radar" /></GlassPanel><GlassPanel title="区域运营对标" className="col-span-12 xl:col-span-8"><Chart kind="bar" variant={2} /></GlassPanel></div></>; }

export function WaterPlatform({ page }: { page: PageKey }) {
  const [left, right] = [navItems.slice(0, 3), navItems.slice(3)];
  const content = { overview: <Overview />, network: <NetworkPage />, dispatch: <DispatchPage />, alerts: <AlertsPage />, equipment: <EquipmentPage />, reports: <ReportsPage /> }[page];
  return <div className="water-app min-h-screen"><img src={cityBackground} alt="" width={1920} height={1080} className="fixed inset-0 size-full object-cover" /><div className="fixed inset-0 bg-background/72" /><div className="fixed inset-0 water-grid" /><header className="water-nav"><nav>{left.map((item)=><NavItem key={item.key} item={item} active={page===item.key} />)}</nav><div className="brand"><Droplets className="size-5 text-primary"/><div><strong>澜川智慧水务</strong><span>LANCHUAN WATER OPS</span></div></div><nav className="justify-end">{right.map((item)=><NavItem key={item.key} item={item} active={page===item.key} />)}</nav></header><main className="relative z-10 mx-auto max-w-[1500px] px-4 pb-10 pt-24 sm:px-6"><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[10px] uppercase text-primary/70"><ShieldCheck className="size-3.5"/>SMART WATER COMMAND</div><h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{pageCopy[page].title}</h1><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{pageCopy[page].subtitle}</p></div><div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><i className="status-dot"/>系统在线</span><span className="flex items-center gap-2"><Gauge className="size-3.5 text-primary"/>数据延迟 12ms</span><span className="rounded border border-border bg-card/30 px-2.5 py-1 font-display text-foreground/70">2026-09-24 10:56:08</span></div></div>{content}</main><button className="fixed bottom-5 right-5 z-30 grid size-10 place-items-center rounded-md border border-border bg-card/60 text-primary backdrop-blur-xl transition hover:-translate-y-1" title="平台设置" aria-label="平台设置"><Settings2 className="size-4"/></button></div>;
}

function NavItem({ item, active }: { item: typeof navItems[number]; active: boolean }) { const Icon=item.icon; return <Link to={item.to} className={`nav-item ${active ? "active" : ""}`}><Icon className="size-4 shrink-0"/><span>{item.label}</span></Link>; }