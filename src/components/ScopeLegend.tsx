import { Alert, Card, Col, Row, Space, Tag, Tooltip } from 'antd'
import { SCOPE_META, SCOPE_ORDER } from '@/utils/scopeLabels'
import type { ScopeType } from '@/mock/types'
import type { ReactNode } from 'react'

/** 页头/侧栏用的范围说明卡片 */
export function ScopeLegend({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Space size={[8, 8]} wrap>
        {SCOPE_ORDER.map((key) => {
          const m = SCOPE_META[key]
          return (
            <Tooltip
              key={key}
              title={
                <div>
                  <div>{m.hint}</div>
                  <div style={{ marginTop: 4, opacity: 0.85 }}>举例：{m.examples}</div>
                </div>
              }
            >
              <Tag color={key === 'scope1' ? 'orange' : key === 'scope2' ? 'blue' : 'purple'}>
                {m.full}
              </Tag>
            </Tooltip>
          )
        })}
      </Space>
    )
  }

  return (
    <Row gutter={[12, 12]}>
      {SCOPE_ORDER.map((key) => {
        const m = SCOPE_META[key]
        const color =
          key === 'scope1' ? '#ea580c' : key === 'scope2' ? '#2563eb' : '#7c3aed'
        return (
          <Col xs={24} md={8} key={key}>
            <Card
              size="small"
              styles={{
                body: { padding: '12px 14px', borderTop: `3px solid ${color}` },
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{m.full}</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{m.hint}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                举例：{m.examples}
              </div>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}

/** 任务覆盖范围：带 Tooltip 的标签 */
export function ScopeTags({ scopes }: { scopes: ScopeType[] }) {
  return (
    <Space size={4} wrap>
      {scopes.map((s) => {
        const m = SCOPE_META[s]
        return (
          <Tooltip
            key={s}
            title={
              <div>
                <div>{m.hint}</div>
                <div style={{ marginTop: 4, opacity: 0.85 }}>举例：{m.examples}</div>
              </div>
            }
          >
            <Tag color={s === 'scope1' ? 'orange' : s === 'scope2' ? 'blue' : 'purple'}>
              {m.full}
            </Tag>
          </Tooltip>
        )
      })}
    </Space>
  )
}

/** 详情抽屉内：本任务覆盖了哪些范围 */
export function ScopeCoverageAlert({
  scopes,
  extra,
}: {
  scopes: ScopeType[]
  extra?: ReactNode
}) {
  const covered = new Set(scopes)
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      message="本任务核算边界说明"
      description={
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          {SCOPE_ORDER.map((key) => {
            const m = SCOPE_META[key]
            const on = covered.has(key)
            return (
              <div key={key} style={{ marginBottom: 6, opacity: on ? 1 : 0.45 }}>
                <Tag
                  color={on ? (key === 'scope1' ? 'orange' : key === 'scope2' ? 'blue' : 'purple') : 'default'}
                  style={{ marginRight: 8 }}
                >
                  {on ? '已纳入' : '未纳入'}
                </Tag>
                <strong>{m.full}</strong>
                <span style={{ color: '#64748b' }}> — {m.hint}</span>
              </div>
            )
          })}
          {extra}
        </div>
      }
    />
  )
}
