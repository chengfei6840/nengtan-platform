import type { Building } from './types'

export const buildings: Building[] = [
  // 东区制造 — 重点企业厂房
  { id: 'bld-001', name: '华芯 A1 主厂房', code: 'E-A1', zoneId: 'zone-east', enterpriseId: 'ent-001', type: '厂房', floors: 3, area: 18600, builtYear: 2017, address: '东区 A1', lng: 120.6452, lat: 31.3705, meterCount: 6, status: 'in_use' },
  { id: 'bld-002', name: '华芯 A1 动力站', code: 'E-A1P', zoneId: 'zone-east', enterpriseId: 'ent-001', type: '能源站', floors: 1, area: 2200, builtYear: 2017, address: '东区 A1 北侧', lng: 120.6455, lat: 31.3709, meterCount: 4, status: 'in_use' },
  { id: 'bld-003', name: '华芯办公楼', code: 'E-A1O', zoneId: 'zone-east', enterpriseId: 'ent-001', type: '办公楼', floors: 5, area: 4800, builtYear: 2018, address: '东区 A1 南侧', lng: 120.6448, lat: 31.3701, meterCount: 2, status: 'in_use' },
  { id: 'bld-004', name: '鼎力 A3 机加厂房', code: 'E-A3', zoneId: 'zone-east', enterpriseId: 'ent-002', type: '厂房', floors: 2, area: 24200, builtYear: 2016, address: '东区 A3', lng: 120.6468, lat: 31.3718, meterCount: 5, status: 'in_use' },
  { id: 'bld-005', name: '鼎力热处理车间', code: 'E-A3H', zoneId: 'zone-east', enterpriseId: 'ent-002', type: '厂房', floors: 1, area: 6800, builtYear: 2016, address: '东区 A3 东', lng: 120.6472, lat: 31.3721, meterCount: 3, status: 'in_use' },
  { id: 'bld-006', name: '鼎力研发楼', code: 'E-A3R', zoneId: 'zone-east', enterpriseId: 'ent-002', type: '办公楼', floors: 4, area: 4200, builtYear: 2019, address: '东区 A3 西', lng: 120.6464, lat: 31.3715, meterCount: 2, status: 'in_use' },
  { id: 'bld-007', name: '绿能 B2 组件厂房', code: 'E-B2', zoneId: 'zone-east', enterpriseId: 'ent-003', type: '厂房', floors: 2, area: 32800, builtYear: 2018, address: '东区 B2', lng: 120.6441, lat: 31.3726, meterCount: 6, status: 'in_use' },
  { id: 'bld-008', name: '绿能仓储库', code: 'E-B2W', zoneId: 'zone-east', enterpriseId: 'ent-003', type: '仓库', floors: 1, area: 5600, builtYear: 2018, address: '东区 B2 北', lng: 120.6438, lat: 31.3730, meterCount: 2, status: 'in_use' },
  { id: 'bld-009', name: '绿能办公楼', code: 'E-B2O', zoneId: 'zone-east', enterpriseId: 'ent-003', type: '办公楼', floors: 4, area: 3400, builtYear: 2019, address: '东区 B2 南', lng: 120.6444, lat: 31.3722, meterCount: 2, status: 'in_use' },
  { id: 'bld-010', name: '安驰 B5 冲压焊接厂房', code: 'E-B5', zoneId: 'zone-east', enterpriseId: 'ent-004', type: '厂房', floors: 1, area: 16800, builtYear: 2017, address: '东区 B5', lng: 120.6475, lat: 31.3688, meterCount: 4, status: 'in_use' },
  { id: 'bld-011', name: '安驰涂装车间', code: 'E-B5C', zoneId: 'zone-east', enterpriseId: 'ent-004', type: '厂房', floors: 2, area: 7200, builtYear: 2017, address: '东区 B5 东', lng: 120.6479, lat: 31.3691, meterCount: 3, status: 'in_use' },
  { id: 'bld-012', name: '安驰成品仓', code: 'E-B5W', zoneId: 'zone-east', enterpriseId: 'ent-004', type: '仓库', floors: 1, area: 2500, builtYear: 2018, address: '东区 B5 北', lng: 120.6472, lat: 31.3694, meterCount: 1, status: 'in_use' },
  { id: 'bld-013', name: '恒达 C1 反应车间', code: 'E-C1', zoneId: 'zone-east', enterpriseId: 'ent-005', type: '厂房', floors: 2, area: 9800, builtYear: 2016, address: '东区 C1', lng: 120.6488, lat: 31.3702, meterCount: 4, status: 'in_use' },
  { id: 'bld-014', name: '恒达罐区与锅炉房', code: 'E-C1B', zoneId: 'zone-east', enterpriseId: 'ent-005', type: '能源站', floors: 1, area: 3200, builtYear: 2016, address: '东区 C1 北', lng: 120.6491, lat: 31.3706, meterCount: 3, status: 'in_use' },
  { id: 'bld-015', name: '星河 A5 洁净厂房', code: 'E-A5', zoneId: 'zone-east', enterpriseId: 'ent-009', type: '厂房', floors: 3, area: 11200, builtYear: 2020, address: '东区 A5', lng: 120.6458, lat: 31.3695, meterCount: 3, status: 'in_use' },
  { id: 'bld-016', name: '海川 A7 模具厂房', code: 'E-A7', zoneId: 'zone-east', enterpriseId: 'ent-010', type: '厂房', floors: 2, area: 7600, builtYear: 2019, address: '东区 A7', lng: 120.6462, lat: 31.3682, meterCount: 2, status: 'in_use' },
  { id: 'bld-017', name: '瑞丰 C3 调配车间', code: 'E-C3', zoneId: 'zone-east', enterpriseId: 'ent-012', type: '厂房', floors: 1, area: 5400, builtYear: 2018, address: '东区 C3', lng: 120.6492, lat: 31.3685, meterCount: 2, status: 'in_use' },
  { id: 'bld-018', name: '威特 B7 装配厂房', code: 'E-B7', zoneId: 'zone-east', enterpriseId: 'ent-016', type: '厂房', floors: 2, area: 10800, builtYear: 2019, address: '东区 B7', lng: 120.6482, lat: 31.3678, meterCount: 3, status: 'in_use' },
  { id: 'bld-019', name: '盛德 A9 加工厂房', code: 'E-A9', zoneId: 'zone-east', enterpriseId: 'ent-018', type: '厂房', floors: 1, area: 6200, builtYear: 2017, address: '东区 A9', lng: 120.6465, lat: 31.3672, meterCount: 2, status: 'in_use' },
  { id: 'bld-020', name: '晶科 B9 辅材厂房', code: 'E-B9', zoneId: 'zone-east', enterpriseId: 'ent-019', type: '厂房', floors: 2, area: 8400, builtYear: 2021, address: '东区 B9', lng: 120.6448, lat: 31.3675, meterCount: 2, status: 'in_use' },
  { id: 'bld-021', name: '安盾 C5 生产厂房', code: 'E-C5', zoneId: 'zone-east', enterpriseId: 'ent-023', type: '厂房', floors: 1, area: 3800, builtYear: 2020, address: '东区 C5', lng: 120.6495, lat: 31.3672, meterCount: 2, status: 'in_use' },
  { id: 'bld-022', name: '东区公共配电室', code: 'E-PS1', zoneId: 'zone-east', type: '能源站', floors: 1, area: 860, builtYear: 2016, address: '东区配电中心', lng: 120.6455, lat: 31.3688, meterCount: 4, status: 'in_use' },

  // 西区科创
  { id: 'bld-023', name: '金谷 D2 食品厂房', code: 'W-D2', zoneId: 'zone-west', enterpriseId: 'ent-006', type: '厂房', floors: 2, area: 14600, builtYear: 2017, address: '西区 D2', lng: 120.6395, lat: 31.3712, meterCount: 4, status: 'in_use' },
  { id: 'bld-024', name: '金谷冷库', code: 'W-D2C', zoneId: 'zone-west', enterpriseId: 'ent-006', type: '仓库', floors: 1, area: 4800, builtYear: 2017, address: '西区 D2 北', lng: 120.6392, lat: 31.3716, meterCount: 2, status: 'in_use' },
  { id: 'bld-025', name: '金谷锅炉房', code: 'W-D2B', zoneId: 'zone-west', enterpriseId: 'ent-006', type: '能源站', floors: 1, area: 1200, builtYear: 2017, address: '西区 D2 东', lng: 120.6399, lat: 31.3710, meterCount: 2, status: 'in_use' },
  { id: 'bld-026', name: '博瑞 D4 包装厂房', code: 'W-D4', zoneId: 'zone-west', enterpriseId: 'ent-008', type: '厂房', floors: 2, area: 9800, builtYear: 2018, address: '西区 D4', lng: 120.6388, lat: 31.3702, meterCount: 3, status: 'in_use' },
  { id: 'bld-027', name: '云智科创大厦', code: 'W-KT', zoneId: 'zone-west', enterpriseId: 'ent-011', type: '办公楼', floors: 12, area: 18600, builtYear: 2020, address: '西区科创大道1号', lng: 120.6385, lat: 31.3695, meterCount: 4, status: 'in_use' },
  { id: 'bld-028', name: '优鲜 D6 冷链厂房', code: 'W-D6', zoneId: 'zone-west', enterpriseId: 'ent-013', type: '厂房', floors: 2, area: 8600, builtYear: 2019, address: '西区 D6', lng: 120.6398, lat: 31.3688, meterCount: 2, status: 'in_use' },
  { id: 'bld-029', name: '创美 E1 彩印厂房', code: 'W-E1', zoneId: 'zone-west', enterpriseId: 'ent-015', type: '厂房', floors: 1, area: 5200, builtYear: 2018, address: '西区 E1', lng: 120.6378, lat: 31.3682, meterCount: 2, status: 'in_use' },
  { id: 'bld-030', name: '光启 E3 光电厂房', code: 'W-E3', zoneId: 'zone-west', enterpriseId: 'ent-017', type: '厂房', floors: 3, area: 6800, builtYear: 2021, address: '西区 E3', lng: 120.6382, lat: 31.3675, meterCount: 2, status: 'in_use' },
  { id: 'bld-031', name: '味美 E5 调味厂房', code: 'W-E5', zoneId: 'zone-west', enterpriseId: 'ent-020', type: '厂房', floors: 1, area: 4200, builtYear: 2019, address: '西区 E5', lng: 120.6375, lat: 31.3668, meterCount: 2, status: 'in_use' },
  { id: 'bld-032', name: '启航 E7 智能装备厂房', code: 'W-E7', zoneId: 'zone-west', enterpriseId: 'ent-022', type: '厂房', floors: 2, area: 7400, builtYear: 2022, address: '西区 E7', lng: 120.6388, lat: 31.3662, meterCount: 2, status: 'renovating' },
  { id: 'bld-033', name: '合美 D8 软包厂房', code: 'W-D8', zoneId: 'zone-west', enterpriseId: 'ent-024', type: '厂房', floors: 2, area: 5600, builtYear: 2018, address: '西区 D8', lng: 120.6402, lat: 31.3678, meterCount: 2, status: 'in_use' },
  { id: 'bld-034', name: '西区人才公寓', code: 'W-DORM', zoneId: 'zone-west', type: '宿舍', floors: 8, area: 9800, builtYear: 2020, address: '西区生活区', lng: 120.6372, lat: 31.3708, meterCount: 2, status: 'in_use' },

  // 公共配套
  { id: 'bld-035', name: '综合能源站', code: 'P-ES', zoneId: 'zone-public', type: '能源站', floors: 2, area: 4200, builtYear: 2019, address: '公共配套能源路1号', lng: 120.6428, lat: 31.3672, meterCount: 8, status: 'in_use' },
  { id: 'bld-036', name: '污水处理站', code: 'P-WW', zoneId: 'zone-public', type: '配套', floors: 1, area: 2800, builtYear: 2017, address: '公共配套环保路2号', lng: 120.6482, lat: 31.3665, meterCount: 3, status: 'in_use' },
  { id: 'bld-037', name: '迅达物流中心', code: 'P-LOG', zoneId: 'zone-public', enterpriseId: 'ent-007', type: '仓库', floors: 1, area: 24600, builtYear: 2018, address: '公共配套物流大道', lng: 120.6408, lat: 31.3662, meterCount: 3, status: 'in_use' },
  { id: 'bld-038', name: '捷运货运站', code: 'P-FRE', zoneId: 'zone-public', enterpriseId: 'ent-014', type: '仓库', floors: 1, area: 6200, builtYear: 2019, address: '公共配套货运站', lng: 120.6412, lat: 31.3655, meterCount: 1, status: 'in_use' },
  { id: 'bld-039', name: '综合服务楼', code: 'P-SVC', zoneId: 'zone-public', enterpriseId: 'ent-021', type: '办公楼', floors: 6, area: 6800, builtYear: 2016, address: '绿港大道188号', lng: 120.6405, lat: 31.3658, meterCount: 3, status: 'in_use' },
  { id: 'bld-040', name: '主门卫与访客中心', code: 'P-GATE', zoneId: 'zone-public', type: '门卫', floors: 2, area: 680, builtYear: 2016, address: '主入口', lng: 120.6382, lat: 31.3655, meterCount: 1, status: 'in_use' },
]

export const buildingsById = Object.fromEntries(buildings.map((b) => [b.id, b])) as Record<string, Building>
