import { Tag } from 'antd'
import type { ReactNode } from 'react'

type StatusTone =
  | 'success'
  | 'processing'
  | 'warning'
  | 'error'
  | 'default'
  | 'online'
  | 'offline'
  | 'fault'
  | 'running'
  | 'idle'
  | 'maintenance'
  | 'open'
  | 'closed'
  | 'pending'
  | 'done'

const PRESETS: Record<
  string,
  { color: string; label: string }
> = {
  online: { color: 'success', label: '在线' },
  offline: { color: 'default', label: '离线' },
  fault: { color: 'error', label: '故障' },
  running: { color: 'success', label: '运行' },
  idle: { color: 'default', label: '待机' },
  maintenance: { color: 'warning', label: '维保' },
  open: { color: 'error', label: '未关闭' },
  ack: { color: 'warning', label: '已确认' },
  closed: { color: 'success', label: '已关闭' },
  pending: { color: 'default', label: '待处理' },
  assigned: { color: 'processing', label: '已派工' },
  processing: { color: 'processing', label: '处理中' },
  done: { color: 'success', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
  critical: { color: 'error', label: '紧急' },
  major: { color: 'orange', label: '重要' },
  minor: { color: 'gold', label: '次要' },
  warning: { color: 'warning', label: '预警' },
  info: { color: 'blue', label: '提示' },
  healthy: { color: 'success', label: '正常' },
  degraded: { color: 'warning', label: '降级' },
  down: { color: 'error', label: '中断' },
  active: { color: 'success', label: '启用' },
  disabled: { color: 'default', label: '停用' },
  good: { color: 'success', label: '良好' },
  warn: { color: 'warning', label: '关注' },
  bad: { color: 'error', label: '异常' },
  on_track: { color: 'success', label: '达标' },
  at_risk: { color: 'warning', label: '风险' },
  over: { color: 'error', label: '超标' },
  charging: { color: 'processing', label: '充电中' },
  reserved: { color: 'blue', label: '已预约' },
  normal: { color: 'success', label: '正常' },
  partial: { color: 'warning', label: '部分异常' },
}

export interface StatusTagProps {
  status: StatusTone | string
  label?: ReactNode
  color?: string
}

export function StatusTag({ status, label, color }: StatusTagProps) {
  const preset = PRESETS[status]
  return (
    <Tag color={color ?? preset?.color ?? 'default'}>{label ?? preset?.label ?? status}</Tag>
  )
}
