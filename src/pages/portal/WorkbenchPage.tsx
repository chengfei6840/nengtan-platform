import { useMemo, useState } from 'react'
import { Card, Col, List, Row, Select, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { enterprises } from '@/mock/enterprises'
import { notices } from '@/mock/enterprisePortal'
import { usePortal } from '@/context/PortalContext'
import { emissionFormat, numFormat } from '@/utils/format'

export default function WorkbenchPage() {
  const [enterpriseId, setEnterpriseId] = useState(enterprises[0]?.id)
  const { fillTasks, rectifications } = usePortal()

  const enterprise = useMemo(
    () => enterprises.find((e) => e.id === enterpriseId) ?? enterprises[0],
    [enterpriseId],
  )

  const pendingFill = useMemo(
    () =>
      fillTasks.filter(
        (t) =>
          t.enterpriseId === enterprise?.id &&
          (t.status === 'pending' || t.status === 'draft' || t.status === 'rejected'),
      ).length,
    [enterprise, fillTasks],
  )

  const pendingRectify = useMemo(
    () =>
      rectifications.filter(
        (r) =>
          r.enterpriseId === enterprise?.id &&
          (r.status === 'open' || r.status === 'rectifying' || r.status === 'pending_review'),
      ).length,
    [enterprise, rectifications],
  )

  const myNotices = useMemo(() => {
    return notices
      .filter((n) => {
        if (n.audience === 'all') return true
        if (n.audience === 'key_energy' && enterprise?.isKeyEnergy) return true
        if (n.audience === 'key_emission' && enterprise?.isKeyEmission) return true
        if (n.audience === 'zone' && n.zoneId === enterprise?.zoneId) return true
        return false
      })
      .slice(0, 4)
  }, [enterprise])

  if (!enterprise) return null

  return (
    <div>
      <PageHeader
        title="企业工作台"
        subtitle={`${enterprise.name} · 能耗与排放概览`}
        breadcrumbs={[{ title: '企业门户' }, { title: '企业工作台' }]}
        tags={
          <>
            {enterprise.isKeyEnergy && <Tag color="orange">重点用能</Tag>}
            {enterprise.isKeyEmission && <Tag color="red">重点排放</Tag>}
          </>
        }
        extra={
          <Select
            style={{ width: 240 }}
            value={enterprise.id}
            onChange={setEnterpriseId}
            showSearch
            optionFilterProp="label"
            options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
          />
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="年综合能耗"
            value={numFormat(enterprise.yearlyEnergy, { digits: 0 })}
            unit="tce"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="年碳排放" value={emissionFormat(enterprise.yearlyEmission)} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="待填报/待整改填报" value={pendingFill} unit="项" trend="flat" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="待整改" value={pendingRectify} unit="项" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="表计数量" value={enterprise.meterCount} unit="块" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="设备数量" value={enterprise.deviceCount} unit="台" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="能耗排名" value={enterprise.energyRank} unit="位" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="排放排名" value={enterprise.emissionRank} unit="位" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="企业摘要" size="small">
            <p style={{ marginBottom: 8, color: '#475569' }}>{enterprise.processDesc}</p>
            <p style={{ marginBottom: 8 }}>
              <Tag>{enterprise.industry}</Tag>
              <Tag>{enterprise.zoneId}</Tag>
              <StatusTag status={enterprise.status} />
            </p>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              碳边界：{enterprise.carbonBoundary}
              <br />
              能源品种：{enterprise.energyTypes.join('、')}
              <br />
              产值：{numFormat(enterprise.outputValue, { digits: 0 })} 万元 · 员工{' '}
              {enterprise.employees} 人
            </div>
            <div style={{ marginTop: 12 }}>
              <Link to="/portal/fill">去填报 →</Link>
              <span style={{ margin: '0 12px' }}>|</span>
              <Link to="/portal/rectify">整改任务 →</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <ChartCard title="相关通知" subtitle="按受众筛选" height="auto">
            <List
              size="small"
              dataSource={myNotices}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.pinned ? <Tag color="gold">置顶</Tag> : null,
                    <Tag key="t">{item.type}</Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to="/portal/notices">{item.title}</Link>}
                    description={`${item.publishedAt} · ${item.content.slice(0, 48)}…`}
                  />
                </List.Item>
              )}
            />
          </ChartCard>
        </Col>
      </Row>
    </div>
  )
}
