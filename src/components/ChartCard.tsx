import { Card, Empty, Spin } from 'antd'
import type { ReactNode } from 'react'

export interface ChartCardProps {
  title: string
  subtitle?: string
  extra?: ReactNode
  loading?: boolean
  empty?: boolean
  emptyDescription?: string
  height?: number | string
  children?: ReactNode
}

export function ChartCard({
  title,
  subtitle,
  extra,
  loading,
  empty,
  emptyDescription = '暂无数据',
  height = 320,
  children,
}: ChartCardProps) {
  return (
    <Card
      title={
        <div>
          <div style={{ fontWeight: 600, color: '#134e4a' }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 12, fontWeight: 400, color: '#64748b', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
      }
      extra={extra}
      styles={{ body: { paddingTop: 8 } }}
    >
      <div style={{ height, position: 'relative' }}>
        {loading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin />
          </div>
        ) : empty ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  )
}
