import type {
  BenchmarkItem,
  EnterpriseEnergyRank,
  EnergyPlan,
  HourlyLoadItem,
  MonthlyEnergyItem,
  TouEnergyItem,
} from './types'

/** 近 12 个月园区能源（2025-04 ~ 2026-03） */
export const monthlyEnergy: MonthlyEnergyItem[] = [
  { month: '2025-04', electricity: 9.12e6, water: 38200, gas: 268000, steam: 11200, diesel: 42, pvGeneration: 720000, totalTce: 3980, cost: 912 },
  { month: '2025-05', electricity: 9.45e6, water: 40100, gas: 252000, steam: 10850, diesel: 38, pvGeneration: 810000, totalTce: 4050, cost: 928 },
  { month: '2025-06', electricity: 1.02e7, water: 42800, gas: 241000, steam: 10520, diesel: 35, pvGeneration: 865000, totalTce: 4280, cost: 968 },
  { month: '2025-07', electricity: 1.08e7, water: 45600, gas: 228000, steam: 9980, diesel: 32, pvGeneration: 892000, totalTce: 4480, cost: 1012 },
  { month: '2025-08', electricity: 1.06e7, water: 44800, gas: 232000, steam: 10120, diesel: 33, pvGeneration: 878000, totalTce: 4410, cost: 998 },
  { month: '2025-09', electricity: 9.68e6, water: 41200, gas: 255000, steam: 10980, diesel: 36, pvGeneration: 742000, totalTce: 4160, cost: 945 },
  { month: '2025-10', electricity: 9.35e6, water: 39600, gas: 278000, steam: 11850, diesel: 40, pvGeneration: 655000, totalTce: 4080, cost: 932 },
  { month: '2025-11', electricity: 9.52e6, water: 38800, gas: 312000, steam: 12680, diesel: 45, pvGeneration: 528000, totalTce: 4220, cost: 978 },
  { month: '2025-12', electricity: 9.78e6, water: 37500, gas: 345000, steam: 13240, diesel: 48, pvGeneration: 486000, totalTce: 4380, cost: 1015 },
  { month: '2026-01', electricity: 9.64e6, water: 36800, gas: 338000, steam: 12980, diesel: 46, pvGeneration: 512000, totalTce: 4310, cost: 996 },
  { month: '2026-02', electricity: 8.86e6, water: 34200, gas: 298000, steam: 11860, diesel: 41, pvGeneration: 548000, totalTce: 3920, cost: 908 },
  { month: '2026-03', electricity: 9.86e6, water: 39100, gas: 286420, steam: 12480, diesel: 39, pvGeneration: 612850, totalTce: 4126.5, cost: 986.4 },
]

/** 典型工作日 24 小时负荷曲线（kW） */
export const hourlyLoad: HourlyLoadItem[] = [
  { hour: 0, label: '00:00', load: 8200, pv: 0, grid: 8200 },
  { hour: 1, label: '01:00', load: 7800, pv: 0, grid: 7800 },
  { hour: 2, label: '02:00', load: 7600, pv: 0, grid: 7600 },
  { hour: 3, label: '03:00', load: 7450, pv: 0, grid: 7450 },
  { hour: 4, label: '04:00', load: 7520, pv: 0, grid: 7520 },
  { hour: 5, label: '05:00', load: 8100, pv: 120, grid: 7980 },
  { hour: 6, label: '06:00', load: 9800, pv: 680, grid: 9120 },
  { hour: 7, label: '07:00', load: 14200, pv: 1850, grid: 12350 },
  { hour: 8, label: '08:00', load: 17800, pv: 3200, grid: 14600 },
  { hour: 9, label: '09:00', load: 19200, pv: 4850, grid: 14350 },
  { hour: 10, label: '10:00', load: 18520, pv: 5620, grid: 12900 },
  { hour: 11, label: '11:00', load: 18860, pv: 5980, grid: 12880 },
  { hour: 12, label: '12:00', load: 16540, pv: 6120, grid: 10420 },
  { hour: 13, label: '13:00', load: 18200, pv: 6050, grid: 12150 },
  { hour: 14, label: '14:00', load: 19150, pv: 5480, grid: 13670 },
  { hour: 15, label: '15:00', load: 18980, pv: 4620, grid: 14360 },
  { hour: 16, label: '16:00', load: 18640, pv: 3180, grid: 15460 },
  { hour: 17, label: '17:00', load: 17820, pv: 1650, grid: 16170 },
  { hour: 18, label: '18:00', load: 16200, pv: 420, grid: 15780 },
  { hour: 19, label: '19:00', load: 14850, pv: 0, grid: 14850 },
  { hour: 20, label: '20:00', load: 12600, pv: 0, grid: 12600 },
  { hour: 21, label: '21:00', load: 10800, pv: 0, grid: 10800 },
  { hour: 22, label: '22:00', load: 9450, pv: 0, grid: 9450 },
  { hour: 23, label: '23:00', load: 8680, pv: 0, grid: 8680 },
]

/** 江苏一般工商业分时电量结构（本月） */
export const touEnergy: TouEnergyItem[] = [
  { period: '尖', hours: '11:00-13:00 / 19:00-21:00', energy: 1.42e6, price: 1.1868, cost: 168.5, share: 14.4 },
  { period: '峰', hours: '08:00-11:00 / 13:00-19:00 / 21:00-22:00', energy: 3.86e6, price: 0.9986, cost: 385.5, share: 39.1 },
  { period: '平', hours: '06:00-08:00 / 22:00-24:00', energy: 2.48e6, price: 0.6235, cost: 154.6, share: 25.2 },
  { period: '谷', hours: '00:00-06:00', energy: 2.10e6, price: 0.3128, cost: 65.7, share: 21.3 },
]

export const energyCostSummary = {
  month: '2026-03',
  electricityCost: 774.3,
  gasCost: 142.8,
  steamCost: 48.6,
  waterCost: 12.4,
  dieselCost: 8.3,
  totalCost: 986.4,
  unit: '万元',
  avgPrice: 0.785,
  avgPriceUnit: '元/kWh',
}

export const enterpriseEnergyRanking: EnterpriseEnergyRank[] = [
  { enterpriseId: 'ent-001', name: '华芯精密电子', industry: '电子', energy: 6850, emission: 14260, intensity: 1.658, yoy: -2.1, rank: 1 },
  { enterpriseId: 'ent-002', name: '鼎力机械装备', industry: '机械', energy: 5420, emission: 11280, intensity: 2.169, yoy: -1.4, rank: 2 },
  { enterpriseId: 'ent-003', name: '绿能光伏组件', industry: '光伏组件', energy: 4980, emission: 9860, intensity: 1.006, yoy: 3.2, rank: 3 },
  { enterpriseId: 'ent-004', name: '安驰汽车零部件', industry: '汽车零部件', energy: 4120, emission: 8650, intensity: 1.880, yoy: -0.8, rank: 4 },
  { enterpriseId: 'ent-005', name: '恒达化工配套', industry: '化工配套', energy: 3680, emission: 7920, intensity: 2.555, yoy: -3.5, rank: 5 },
  { enterpriseId: 'ent-006', name: '金谷食品加工', industry: '食品', energy: 3250, emission: 6480, intensity: 2.314, yoy: 1.2, rank: 6 },
  { enterpriseId: 'ent-009', name: '星河半导体', industry: '电子', energy: 1860, emission: 3920, intensity: 1.089, yoy: 5.6, rank: 7 },
  { enterpriseId: 'ent-016', name: '威特传动', industry: '汽车零部件', energy: 1560, emission: 3240, intensity: 1.473, yoy: -1.1, rank: 8 },
  { enterpriseId: 'ent-008', name: '博瑞包装', industry: '包装', energy: 1120, emission: 2380, intensity: 1.700, yoy: 0.4, rank: 9 },
  { enterpriseId: 'ent-019', name: '晶科辅材', industry: '光伏组件', energy: 980, emission: 2050, intensity: 1.139, yoy: 2.8, rank: 10 },
]

export const energyPlans: EnergyPlan[] = [
  {
    id: 'plan-2026-park',
    year: 2026,
    name: '园区2026年度双控目标',
    targetTce: 48500,
    actualTce: 11862.4,
    targetEmission: 82000,
    actualEmission: 19680.5,
    progress: 24.5,
    status: 'on_track',
  },
  {
    id: 'plan-2026-ent-001',
    year: 2026,
    enterpriseId: 'ent-001',
    name: '华芯精密电子能耗双控',
    targetTce: 6600,
    actualTce: 1680,
    targetEmission: 13800,
    actualEmission: 3520,
    progress: 25.5,
    status: 'on_track',
  },
  {
    id: 'plan-2026-ent-002',
    year: 2026,
    enterpriseId: 'ent-002',
    name: '鼎力机械装备能耗双控',
    targetTce: 5200,
    actualTce: 1340,
    targetEmission: 10800,
    actualEmission: 2780,
    progress: 25.8,
    status: 'on_track',
  },
  {
    id: 'plan-2026-ent-005',
    year: 2026,
    enterpriseId: 'ent-005',
    name: '恒达化工配套能耗双控',
    targetTce: 3400,
    actualTce: 980,
    targetEmission: 7500,
    actualEmission: 2180,
    progress: 28.8,
    status: 'at_risk',
  },
  {
    id: 'plan-2026-ent-006',
    year: 2026,
    enterpriseId: 'ent-006',
    name: '金谷食品加工能耗双控',
    targetTce: 3100,
    actualTce: 860,
    targetEmission: 6200,
    actualEmission: 1720,
    progress: 27.7,
    status: 'at_risk',
  },
]

export const energyBenchmarks: BenchmarkItem[] = [
  { industry: '电子', parkAvgIntensity: 1.32, industryAvgIntensity: 1.55, bestPractice: 0.95, unit: 'tce/万元产值' },
  { industry: '机械', parkAvgIntensity: 1.85, industryAvgIntensity: 2.10, bestPractice: 1.40, unit: 'tce/万元产值' },
  { industry: '食品', parkAvgIntensity: 2.05, industryAvgIntensity: 2.35, bestPractice: 1.60, unit: 'tce/万元产值' },
  { industry: '光伏组件', parkAvgIntensity: 0.98, industryAvgIntensity: 1.20, bestPractice: 0.75, unit: 'tce/万元产值' },
  { industry: '汽车零部件', parkAvgIntensity: 1.72, industryAvgIntensity: 1.95, bestPractice: 1.25, unit: 'tce/万元产值' },
  { industry: '化工配套', parkAvgIntensity: 2.48, industryAvgIntensity: 2.80, bestPractice: 1.90, unit: 'tce/万元产值' },
  { industry: '包装', parkAvgIntensity: 1.45, industryAvgIntensity: 1.70, bestPractice: 1.10, unit: 'tce/万元产值' },
  { industry: '物流', parkAvgIntensity: 0.82, industryAvgIntensity: 1.05, bestPractice: 0.60, unit: 'tce/万元产值' },
]
