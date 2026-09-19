import {
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FireOutlined,
  FundProjectionScreenOutlined,
  SettingOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  ClusterOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

export interface MenuLeaf {
  key: string
  path: string
  label: string
}

export interface MenuGroup {
  key: string
  label: string
  icon: ReactNode
  children: MenuLeaf[]
}

export const menuGroups: MenuGroup[] = [
  {
    key: 'cockpit',
    label: '综合驾驶舱',
    icon: <DashboardOutlined />,
    children: [
      { key: 'overview', path: '/cockpit/overview', label: '园区总览' },
      { key: 'energy-map', path: '/cockpit/energy-map', label: '能源一张图' },
      { key: 'carbon-map', path: '/cockpit/carbon-map', label: '碳排放一张图' },
    ],
  },
  {
    key: 'archive',
    label: '基础档案',
    icon: <ShopOutlined />,
    children: [
      { key: 'enterprises', path: '/archive/enterprises', label: '企业档案' },
      { key: 'buildings', path: '/archive/buildings', label: '建筑档案' },
      { key: 'devices', path: '/archive/devices', label: '设备档案' },
      { key: 'meters', path: '/archive/meters', label: '计量点档案' },
    ],
  },
  {
    key: 'energy',
    label: '能源管理',
    icon: <ThunderboltOutlined />,
    children: [
      { key: 'realtime', path: '/energy/realtime', label: '实时监测' },
      { key: 'stats', path: '/energy/stats', label: '能耗统计' },
      { key: 'benchmark', path: '/energy/benchmark', label: '能效对标' },
      { key: 'cost', path: '/energy/cost', label: '能源费用' },
      { key: 'plan', path: '/energy/plan', label: '计划与指标' },
    ],
  },
  {
    key: 'carbon',
    label: '碳排放管理',
    icon: <FireOutlined />,
    children: [
      { key: 'accounting', path: '/carbon/accounting', label: '组织碳核算' },
      { key: 'overview', path: '/carbon/overview', label: '园区碳总览' },
      { key: 'factors', path: '/carbon/factors', label: '排放因子库' },
      { key: 'budget', path: '/carbon/budget', label: '碳目标与预算' },
      { key: 'assets', path: '/carbon/assets', label: '碳资产' },
    ],
  },
  {
    key: 'renewable',
    label: '新能源管理',
    icon: <ClusterOutlined />,
    children: [
      { key: 'pv', path: '/renewable/pv', label: '光伏' },
      { key: 'storage', path: '/renewable/storage', label: '储能' },
      { key: 'charger', path: '/renewable/charger', label: '充电桩' },
      { key: 'microgrid', path: '/renewable/microgrid', label: '微电网' },
    ],
  },
  {
    key: 'ops',
    label: '设备运维',
    icon: <AlertOutlined />,
    children: [
      { key: 'monitor', path: '/ops/monitor', label: '设备监控' },
      { key: 'alarms', path: '/ops/alarms', label: '告警中心' },
      { key: 'workorders', path: '/ops/workorders', label: '运维工单' },
    ],
  },
  {
    key: 'saving',
    label: '节能降碳',
    icon: <FundProjectionScreenOutlined />,
    children: [
      { key: 'diagnosis', path: '/saving/diagnosis', label: '节能诊断' },
      { key: 'projects', path: '/saving/projects', label: '改造项目' },
      { key: 'verify', path: '/saving/verify', label: '成效评价' },
    ],
  },
  {
    key: 'portal',
    label: '企业服务',
    icon: <FileTextOutlined />,
    children: [
      { key: 'workbench', path: '/portal/workbench', label: '企业工作台' },
      { key: 'fill', path: '/portal/fill', label: '数据填报' },
      { key: 'rectify', path: '/portal/rectify', label: '整改任务' },
      { key: 'notices', path: '/portal/notices', label: '通知公告' },
    ],
  },
  {
    key: 'data',
    label: '数据中心',
    icon: <DatabaseOutlined />,
    children: [
      { key: 'quality', path: '/data/quality', label: '数据质量' },
      { key: 'query', path: '/data/query', label: '数据查询' },
      { key: 'interfaces', path: '/data/interfaces', label: '接口监控' },
    ],
  },
  {
    key: 'reports',
    label: '报表中心',
    icon: <ToolOutlined />,
    children: [{ key: 'list', path: '/reports', label: '报表列表' }],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    children: [
      { key: 'users', path: '/system/users', label: '用户与权限' },
      { key: 'workflows', path: '/system/workflows', label: '流程配置' },
      { key: 'interfaces', path: '/system/interfaces', label: '接口管理' },
      { key: 'audit', path: '/system/audit', label: '日志审计' },
    ],
  },
]
