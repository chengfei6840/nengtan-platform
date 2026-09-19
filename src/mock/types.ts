/** 绿港智造产业园 Demo — 共享类型定义 */

export type ZoneId = 'zone-east' | 'zone-west' | 'zone-public'

export type EnergyType = '电' | '水' | '天然气' | '蒸汽' | '柴油' | '光伏发电'

export type MeterType = '电' | '水' | '气' | '蒸汽'

export type MeterStatus = 'online' | 'offline' | 'fault'

export type DeviceType =
  | '变压器'
  | '空压机'
  | '锅炉'
  | '冷机'
  | '水泵'
  | '风机'
  | '配电柜'
  | '热交换器'
  | '冷却塔'
  | '充电桩'

export type DeviceStatus = 'running' | 'idle' | 'fault' | 'maintenance'

export type AlarmLevel = 'critical' | 'major' | 'minor' | 'warning' | 'info'

export type AlarmStatus = 'open' | 'ack' | 'closed'

export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'done' | 'cancelled'

export type PeriodType = 'day' | 'month' | 'year'

export type TouPeriod = '尖' | '峰' | '平' | '谷'

export type ScopeType = 'scope1' | 'scope2' | 'scope3'

export type ProjectStatus = 'planning' | 'approving' | 'implementing' | 'verifying' | 'completed' | 'cancelled'

export type FillTaskStatus = 'pending' | 'draft' | 'submitted' | 'rejected' | 'approved'

export type InterfaceStatus = 'healthy' | 'degraded' | 'down'

export interface ContactInfo {
  name: string
  phone: string
  email: string
  title?: string
}

export interface GeoPoint {
  id: string
  name: string
  lng: number
  lat: number
  type: 'enterprise' | 'building' | 'facility' | 'pv' | 'storage' | 'charger' | 'gate'
  zoneId: ZoneId
  refId?: string
}

export interface ZoneInfo {
  id: ZoneId
  name: string
  areaKm2: number
  description: string
  enterpriseCount: number
  buildingCount: number
  color: string
}

export interface ParkOverview {
  id: string
  name: string
  shortName: string
  region: string
  province: string
  city: string
  district: string
  areaKm2: number
  establishedYear: number
  address: string
  operator: string
  zones: ZoneInfo[]
  mapCenter: { lng: number; lat: number }
  mapZoom: number
  mapPoints: GeoPoint[]
}

export interface KpiItem {
  key: string
  label: string
  value: number
  unit: string
  yoy?: number
  mom?: number
  target?: number
  trend?: 'up' | 'down' | 'flat'
}

export interface PeriodKpiSummary {
  period: PeriodType
  label: string
  asOf: string
  items: KpiItem[]
}

export interface Enterprise {
  id: string
  name: string
  shortName: string
  creditCode: string
  industry: string
  zoneId: ZoneId
  address: string
  contact: ContactInfo
  area: number
  employees: number
  outputValue: number
  isKeyEnergy: boolean
  isKeyEmission: boolean
  energyTypes: EnergyType[]
  processDesc: string
  carbonBoundary: string
  meterCount: number
  deviceCount: number
  yearlyEnergy: number
  yearlyEmission: number
  energyRank: number
  emissionRank: number
  intensityRank: number
  status: 'active' | 'inactive'
}

export interface Building {
  id: string
  name: string
  code: string
  zoneId: ZoneId
  enterpriseId?: string
  type: '厂房' | '办公楼' | '仓库' | '宿舍' | '配套' | '能源站' | '门卫'
  floors: number
  area: number
  builtYear: number
  address: string
  lng: number
  lat: number
  meterCount: number
  status: 'in_use' | 'idle' | 'renovating'
}

export interface Meter {
  id: string
  name: string
  code: string
  type: MeterType
  unit: string
  enterpriseId?: string
  buildingId?: string
  zoneId: ZoneId
  parentMeterId?: string
  level: number
  status: MeterStatus
  lastDataTime: string
  lastValue: number
  multiplier: number
  installDate: string
  manufacturer: string
  model: string
  isGateway: boolean
}

export interface Device {
  id: string
  name: string
  code: string
  type: DeviceType
  enterpriseId?: string
  buildingId?: string
  zoneId: ZoneId
  relatedMeterIds: string[]
  ratedPower: number
  status: DeviceStatus
  installDate: string
  manufacturer: string
  model: string
  runHours: number
  lastMaintainDate: string
}

export interface MonthlyEnergyItem {
  month: string
  electricity: number
  water: number
  gas: number
  steam: number
  diesel: number
  pvGeneration: number
  totalTce: number
  cost: number
}

export interface HourlyLoadItem {
  hour: number
  label: string
  load: number
  pv?: number
  grid?: number
}

export interface TouEnergyItem {
  period: TouPeriod
  hours: string
  energy: number
  price: number
  cost: number
  share: number
}

export interface EnterpriseEnergyRank {
  enterpriseId: string
  name: string
  industry: string
  energy: number
  emission: number
  intensity: number
  yoy: number
  rank: number
}

export interface EnergyPlan {
  id: string
  year: number
  enterpriseId?: string
  name: string
  targetTce: number
  actualTce: number
  targetEmission: number
  actualEmission: number
  progress: number
  status: 'on_track' | 'at_risk' | 'over'
}

export interface BenchmarkItem {
  industry: string
  parkAvgIntensity: number
  industryAvgIntensity: number
  bestPractice: number
  unit: string
}

export interface AccountingTask {
  id: string
  name: string
  year: number
  period: string
  status: 'draft' | 'collecting' | 'calculating' | 'reviewing' | 'locked' | 'published'
  enterpriseCount: number
  scopeCoverage: ScopeType[]
  totalEmission: number
  createdAt: string
  updatedAt: string
  owner: string
}

export interface ScopeBreakdown {
  enterpriseId: string
  name: string
  scope1: number
  scope2: number
  scope3: number
  total: number
  intensity: number
}

export interface EmissionFactor {
  id: string
  name: string
  category: string
  fuelOrActivity: string
  value: number
  unit: string
  source: string
  year: number
  region: string
  gwp?: number
}

export interface CarbonBudget {
  year: number
  totalBudget: number
  allocated: number
  used: number
  remaining: number
  byZone: { zoneId: ZoneId; budget: number; used: number }[]
  byEnterprise: { enterpriseId: string; budget: number; used: number }[]
}

export interface CarbonAsset {
  id: string
  type: 'quota' | 'ccer' | 'green_cert' | 'gec'
  name: string
  quantity: number
  unit: string
  vintage: number
  status: 'holding' | 'trading' | 'retired' | 'pending'
  price: number
  source: string
  updatedAt: string
}

export interface PvStation {
  id: string
  name: string
  capacityMw: number
  zoneId: ZoneId
  buildingIds: string[]
  inverterCount: number
  todayGeneration: number
  monthGeneration: number
  yearGeneration: number
  status: 'normal' | 'partial' | 'fault'
  irradiance: number
  pr: number
}

export interface PvInverter {
  id: string
  stationId: string
  name: string
  capacityKw: number
  status: MeterStatus
  powerKw: number
  todayKwh: number
  efficiency: number
}

export interface StorageSystem {
  id: string
  name: string
  capacityMwh: number
  powerMw: number
  soc: number
  powerKw: number
  mode: 'charge' | 'discharge' | 'idle' | 'standby'
  cycles: number
  status: 'normal' | 'fault' | 'maintenance'
  zoneId: ZoneId
}

export interface EvCharger {
  id: string
  name: string
  code: string
  powerKw: number
  type: '快充' | '慢充'
  status: 'idle' | 'charging' | 'fault' | 'offline' | 'reserved'
  zoneId: ZoneId
  buildingId?: string
  currentSoc?: number
  sessionKwh?: number
}

export interface MicrogridFlow {
  timestamp: string
  gridImportKw: number
  gridExportKw: number
  pvKw: number
  storageKw: number
  loadKw: number
  chargerKw: number
}

export interface Alarm {
  id: string
  title: string
  level: AlarmLevel
  status: AlarmStatus
  source: string
  sourceType: 'meter' | 'device' | 'system' | 'energy' | 'carbon' | 'renewable'
  sourceId?: string
  enterpriseId?: string
  zoneId?: ZoneId
  message: string
  triggeredAt: string
  ackAt?: string
  closedAt?: string
  assignee?: string
}

export interface WorkOrder {
  id: string
  title: string
  type: '巡检' | '维修' | '校准' | '改造' | '应急'
  status: WorkOrderStatus
  priority: 'high' | 'medium' | 'low'
  alarmId?: string
  enterpriseId?: string
  deviceId?: string
  meterId?: string
  assignee: string
  creator: string
  createdAt: string
  dueAt: string
  completedAt?: string
  description: string
}

export interface Diagnosis {
  id: string
  enterpriseId: string
  name: string
  date: string
  findings: string[]
  potentialSavingTce: number
  potentialSavingCost: number
  potentialEmissionCut: number
  status: 'draft' | 'confirmed' | 'converted'
}

export interface RetrofitProject {
  id: string
  name: string
  enterpriseId?: string
  zoneId?: ZoneId
  category: string
  status: ProjectStatus
  investWan: number
  expectedSavingTce: number
  expectedEmissionCut: number
  paybackYears: number
  startDate: string
  endDate?: string
  progress: number
  description: string
}

export interface VerificationRecord {
  id: string
  projectId: string
  period: string
  baselineTce: number
  actualTce: number
  savedTce: number
  savedEmission: number
  method: string
  verifiedBy: string
  verifiedAt: string
  conclusion: string
}

export interface FillTask {
  id: string
  enterpriseId: string
  title: string
  period: string
  dataType: string
  status: FillTaskStatus
  deadline: string
  submittedAt?: string
  reviewer?: string
  remark?: string
  /** 填报表单内容（按 dataType 字段不同） */
  formData?: FillFormData
}

/** 填报明细行（活动数据分项，可增删改） */
export interface FillDataLine {
  id: string
  category: string
  itemName: string
  quantity: number
  unit: string
  source?: string
  remark?: string
}

/** 活动数据 / 问卷类填报字段（按需取用） */
export interface FillFormData {
  electricityKwh?: number
  naturalGasNm3?: number
  steamTon?: number
  waterTon?: number
  dieselKg?: number
  outputValueWan?: number
  productOutput?: number
  peakLoadKw?: number
  purchasedGoodsTco2e?: number
  upstreamTransportTco2e?: number
  employeeCommuteTco2e?: number
  wasteDisposalTco2e?: number
  sf6Kg?: number
  nf3Kg?: number
  otherProcessTco2e?: number
  note?: string
  fillerName?: string
  updatedAt?: string
  /** 活动数据明细行 */
  lines?: FillDataLine[]
}

export interface Rectification {
  id: string
  enterpriseId: string
  title: string
  source: string
  status: 'open' | 'rectifying' | 'pending_review' | 'closed'
  deadline: string
  description: string
  assignee: string
  /** 整改人填写的措施与说明 */
  response?: string
  evidenceNote?: string
  completedAt?: string
}

export interface Notice {
  id: string
  title: string
  type: '通知' | '公告' | '预警' | '政策'
  audience: 'all' | 'key_energy' | 'key_emission' | 'zone'
  zoneId?: ZoneId
  publishedAt: string
  content: string
  pinned: boolean
}

export interface QualityMetric {
  key: string
  label: string
  value: number
  unit: string
  target: number
  status: 'good' | 'warn' | 'bad'
}

export interface DataAnomaly {
  id: string
  meterId: string
  enterpriseId?: string
  type: '缺失' | '突变' | '超限' | '零值' | '负值' | '时序乱序'
  severity: AlarmLevel
  detectedAt: string
  value?: number
  expectedRange?: string
  status: 'open' | 'confirmed' | 'ignored' | 'fixed'
  description: string
}

export interface ReportItem {
  id: string
  name: string
  category: string
  period: string
  format: 'PDF' | 'Excel' | 'Word'
  status: 'ready' | 'generating' | 'failed'
  createdAt: string
  sizeKb: number
  description: string
}

export interface SysUser {
  id: string
  username: string
  name: string
  roleIds: string[]
  org: string
  enterpriseId?: string
  phone: string
  email: string
  status: 'active' | 'disabled'
  lastLoginAt: string
}

export interface SysRole {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
}

export interface WorkflowDef {
  id: string
  name: string
  code: string
  category: string
  steps: string[]
  status: 'enabled' | 'disabled'
}

export interface InterfaceItem {
  id: string
  name: string
  protocol: string
  endpoint: string
  status: InterfaceStatus
  lastSyncAt: string
  latencyMs: number
  successRate: number
  description: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  target: string
  ip: string
  at: string
  result: 'success' | 'fail'
  detail?: string
}
