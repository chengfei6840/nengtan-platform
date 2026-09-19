import type { EvCharger, MicrogridFlow, PvInverter, PvStation, StorageSystem } from './types'

/** 园区光伏总装机约 8 MW */
export const pvStations: PvStation[] = [
  {
    id: 'pv-st-001',
    name: '东区屋顶光伏电站',
    capacityMw: 3.6,
    zoneId: 'zone-east',
    buildingIds: ['bld-001', 'bld-004', 'bld-007', 'bld-010', 'bld-013'],
    inverterCount: 18,
    todayGeneration: 14280,
    monthGeneration: 286400,
    yearGeneration: 785000,
    status: 'normal',
    irradiance: 685,
    pr: 82.4,
  },
  {
    id: 'pv-st-002',
    name: '西区屋顶光伏电站',
    capacityMw: 2.8,
    zoneId: 'zone-west',
    buildingIds: ['bld-023', 'bld-026', 'bld-027', 'bld-028'],
    inverterCount: 14,
    todayGeneration: 9860,
    monthGeneration: 198600,
    yearGeneration: 542000,
    status: 'normal',
    irradiance: 672,
    pr: 81.1,
  },
  {
    id: 'pv-st-003',
    name: '公共配套光伏车棚电站',
    capacityMw: 1.6,
    zoneId: 'zone-public',
    buildingIds: ['bld-035', 'bld-037', 'bld-039'],
    inverterCount: 8,
    todayGeneration: 4500,
    monthGeneration: 127850,
    yearGeneration: 353000,
    status: 'partial',
    irradiance: 690,
    pr: 78.6,
  },
]

export const pvSummary = {
  totalCapacityMw: 8.0,
  todayGeneration: 28640,
  monthGeneration: 612850,
  yearGeneration: 1.68e6,
  selfUseRate: 78.6,
  gridExportToday: 6120,
  co2AvoidedToday: 16.34,
  co2AvoidedYear: 958,
}

/** 代表性逆变器（每站抽样，合计 40 台量级展示） */
export const pvInverters: PvInverter[] = [
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `inv-e-${String(i + 1).padStart(2, '0')}`,
    stationId: 'pv-st-001',
    name: `东区逆变器#${i + 1}`,
    capacityKw: 200,
    status: (i === 7 ? 'fault' : i === 12 ? 'offline' : 'online') as PvInverter['status'],
    powerKw: i === 7 || i === 12 ? 0 : 145 + (i % 5) * 8,
    todayKwh: i === 7 || i === 12 ? 0 : 720 + i * 18,
    efficiency: i === 7 ? 0 : 97.2 + (i % 4) * 0.3,
  })),
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `inv-w-${String(i + 1).padStart(2, '0')}`,
    stationId: 'pv-st-002',
    name: `西区逆变器#${i + 1}`,
    capacityKw: 200,
    status: (i === 3 ? 'offline' : 'online') as PvInverter['status'],
    powerKw: i === 3 ? 0 : 132 + (i % 6) * 7,
    todayKwh: i === 3 ? 0 : 640 + i * 22,
    efficiency: i === 3 ? 0 : 96.8 + (i % 3) * 0.4,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `inv-p-${String(i + 1).padStart(2, '0')}`,
    stationId: 'pv-st-003',
    name: `车棚逆变器#${i + 1}`,
    capacityKw: 200,
    status: (i === 5 ? 'fault' : 'online') as PvInverter['status'],
    powerKw: i === 5 ? 0 : 118 + (i % 4) * 6,
    todayKwh: i === 5 ? 120 : 520 + i * 25,
    efficiency: i === 5 ? 88.0 : 96.5 + (i % 3) * 0.3,
  })),
]

export const storageSystems: StorageSystem[] = [
  {
    id: 'ess-001',
    name: '园区集中式储能电站',
    capacityMwh: 2.0,
    powerMw: 1.0,
    soc: 62.5,
    powerKw: -420,
    mode: 'discharge',
    cycles: 486,
    status: 'normal',
    zoneId: 'zone-public',
  },
]

export const storageTodayStats = {
  chargeKwh: 1860,
  dischargeKwh: 1720,
  efficiency: 92.5,
  peakShavingBenefit: 1.86,
  benefitUnit: '万元',
  arbiCycles: 1.2,
}

const chargerBuildings = ['bld-035', 'bld-037', 'bld-039', 'bld-040']
const chargerStatuses: EvCharger['status'][] = [
  'idle',
  'charging',
  'idle',
  'charging',
  'idle',
  'reserved',
  'fault',
  'offline',
  'idle',
  'charging',
]

/** 40 枪充电桩 */
export const evChargers: EvCharger[] = Array.from({ length: 40 }, (_, i) => {
  const status = chargerStatuses[i % chargerStatuses.length]
  const isFast = i < 24
  return {
    id: `chg-${String(i + 1).padStart(2, '0')}`,
    name: `${isFast ? '快充' : '慢充'}桩#${i + 1}`,
    code: `EV-${isFast ? 'DC' : 'AC'}-${String(i + 1).padStart(2, '0')}`,
    powerKw: isFast ? 120 : 7,
    type: isFast ? '快充' : '慢充',
    status,
    zoneId: 'zone-public',
    buildingId: chargerBuildings[i % chargerBuildings.length],
    currentSoc: status === 'charging' ? 35 + (i % 40) : undefined,
    sessionKwh: status === 'charging' ? 12 + (i % 20) : undefined,
  }
})

export const chargerSummary = {
  total: 40,
  fast: 24,
  slow: 16,
  idle: evChargers.filter((c) => c.status === 'idle').length,
  charging: evChargers.filter((c) => c.status === 'charging').length,
  fault: evChargers.filter((c) => c.status === 'fault').length,
  offline: evChargers.filter((c) => c.status === 'offline').length,
  todayKwh: 3680,
  monthKwh: 86540,
}

/** 微网功率流（近 12 个采样点，15 分钟） */
export const microgridFlows: MicrogridFlow[] = [
  { timestamp: '2026-03-20 07:00:00', gridImportKw: 11200, gridExportKw: 0, pvKw: 1850, storageKw: 200, loadKw: 13250, chargerKw: 420 },
  { timestamp: '2026-03-20 07:15:00', gridImportKw: 12150, gridExportKw: 0, pvKw: 2280, storageKw: 150, loadKw: 14580, chargerKw: 480 },
  { timestamp: '2026-03-20 07:30:00', gridImportKw: 12880, gridExportKw: 0, pvKw: 2750, storageKw: 80, loadKw: 15710, chargerKw: 520 },
  { timestamp: '2026-03-20 07:45:00', gridImportKw: 13620, gridExportKw: 0, pvKw: 3120, storageKw: -100, loadKw: 16640, chargerKw: 560 },
  { timestamp: '2026-03-20 08:00:00', gridImportKw: 14600, gridExportKw: 0, pvKw: 3200, storageKw: -180, loadKw: 17800, chargerKw: 620 },
  { timestamp: '2026-03-20 08:15:00', gridImportKw: 14280, gridExportKw: 0, pvKw: 3680, storageKw: -250, loadKw: 18150, chargerKw: 640 },
  { timestamp: '2026-03-20 08:30:00', gridImportKw: 13950, gridExportKw: 0, pvKw: 4120, storageKw: -320, loadKw: 18480, chargerKw: 680 },
  { timestamp: '2026-03-20 08:45:00', gridImportKw: 13520, gridExportKw: 0, pvKw: 4580, storageKw: -380, loadKw: 18680, chargerKw: 700 },
  { timestamp: '2026-03-20 09:00:00', gridImportKw: 14350, gridExportKw: 0, pvKw: 4850, storageKw: -400, loadKw: 19200, chargerKw: 720 },
  { timestamp: '2026-03-20 09:15:00', gridImportKw: 13820, gridExportKw: 0, pvKw: 5120, storageKw: -420, loadKw: 18980, chargerKw: 740 },
  { timestamp: '2026-03-20 09:30:00', gridImportKw: 13240, gridExportKw: 80, pvKw: 5380, storageKw: -420, loadKw: 18720, chargerKw: 760 },
  { timestamp: '2026-03-20 09:45:00', gridImportKw: 12900, gridExportKw: 120, pvKw: 5620, storageKw: -420, loadKw: 18520, chargerKw: 780 },
]
