import { Card, Statistic, Typography } from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

const { Text } = Typography

export interface KpiCardProps {
  title: string
  value: number | string
  unit?: string
  prefix?: ReactNode
  suffix?: ReactNode
  yoy?: number
  mom?: number
  target?: number
  trend?: 'up' | 'down' | 'flat'
  loading?: boolean
  extra?: ReactNode
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <ArrowUpOutlined style={{ color: '#dc2626' }} />
  if (trend === 'down') return <ArrowDownOutlined style={{ color: '#059669' }} />
  return <MinusOutlined style={{ color: '#94a3b8' }} />
}

function Delta({ label, value }: { label: string; value?: number }) {
  if (value === undefined) return null
  const positive = value > 0
  const color = positive ? '#dc2626' : value < 0 ? '#059669' : '#64748b'
  return (
    <Text style={{ fontSize: 12, color, marginRight: 8 }}>
      {label} {positive ? '+' : ''}
      {value.toFixed(1)}%
    </Text>
  )
}

export function KpiCard({
  title,
  value,
  unit,
  prefix,
  suffix,
  yoy,
  mom,
  target,
  trend,
  loading,
  extra,
}: KpiCardProps) {
  return (
    <Card size="small" loading={loading} extra={extra} styles={{ body: { padding: 16 } }}>
      <Statistic
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {title}
            <TrendIcon trend={trend} />
          </span>
        }
        value={value}
        prefix={prefix}
        suffix={suffix ?? unit}
        valueStyle={{ color: '#0f766e', fontWeight: 600 }}
      />
      <div style={{ marginTop: 8, minHeight: 20 }}>
        <Delta label="同比" value={yoy} />
        <Delta label="环比" value={mom} />
        {target !== undefined && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            目标 {target}
            {unit ? ` ${unit}` : ''}
          </Text>
        )}
      </div>
    </Card>
  )
}
