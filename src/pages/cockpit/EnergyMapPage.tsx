import { Card, Col, Descriptions, Drawer, Row, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { ParkMap } from '@/components/ParkMap'
import { KpiCard } from '@/components/KpiCard'
import { useDemo } from '@/context/DemoContext'
import { parkOverview } from '@/mock/park'
import { enterprisesById, enterprises } from '@/mock/enterprises'
import { buildingsById } from '@/mock/buildings'
import { energyFormat, emissionFormat, numFormat } from '@/utils/format'
import type { GeoPoint } from '@/mock/types'

const { Text } = Typography

export default function EnergyMapPage() {
  const { zoneId } = useDemo()
  const [selected, setSelected] = useState<GeoPoint | null>(null)
  const [open, setOpen] = useState(false)

  const points = useMemo(() => {
    const list = parkOverview.mapPoints
    if (zoneId === 'all') return list
    return list.filter((p) => p.zoneId === zoneId)
  }, [zoneId])

  const zoneEnterprises = useMemo(() => {
    if (zoneId === 'all') return enterprises
    return enterprises.filter((e) => e.zoneId === zoneId)
  }, [zoneId])

  const totalEnergy = zoneEnterprises.reduce((s, e) => s + e.yearlyEnergy, 0)
  const totalEmission = zoneEnterprises.reduce((s, e) => s + e.yearlyEmission, 0)
  const keyCount = zoneEnterprises.filter((e) => e.isKeyEnergy).length

  const zoneName =
    zoneId === 'all'
      ? '全园'
      : parkOverview.zones.find((z) => z.id === zoneId)?.name ?? zoneId

  const handleSelect = (point: GeoPoint) => {
    setSelected(point)
    setOpen(true)
  }

  const enterprise =
    selected?.type === 'enterprise' && selected.refId
      ? enterprisesById[selected.refId]
      : undefined

  const building =
    selected?.refId && (selected.type === 'facility' || selected.type === 'building')
      ? buildingsById[selected.refId]
      : undefined

  return (
    <div>
      <PageHeader
        title="能源一张图"
        subtitle={`${parkOverview.name} · ${zoneName} · 按分区着色，企业点位热力反映年综合能耗`}
        breadcrumbs={[{ title: '综合驾驶舱' }, { title: '能源一张图' }]}
        tags={<Tag color="cyan">{zoneName}</Tag>}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <KpiCard title="企业数" value={zoneEnterprises.length} unit="家" />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title="年综合能耗"
            value={numFormat(totalEnergy, { digits: 0 })}
            unit="tce"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="重点用能单位" value={keyCount} unit="家" />
        </Col>
      </Row>

      <Card styles={{ body: { padding: 12 } }}>
        <ParkMap
          points={points}
          colorMode="energy"
          selectedId={selected?.id}
          onSelect={handleSelect}
          height={520}
        />
      </Card>

      <Drawer
        title={selected?.name ?? '点位详情'}
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        destroyOnHidden
      >
        {selected && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Tag>{pointTypeLabel(selected.type)}</Tag>
              <Tag color="blue">
                {parkOverview.zones.find((z) => z.id === selected.zoneId)?.name}
              </Tag>
            </div>

            {enterprise && (
              <Card size="small" title="企业信息">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="全称">{enterprise.name}</Descriptions.Item>
                  <Descriptions.Item label="行业">{enterprise.industry}</Descriptions.Item>
                  <Descriptions.Item label="地址">{enterprise.address}</Descriptions.Item>
                  <Descriptions.Item label="年综合能耗">
                    {energyFormat(enterprise.yearlyEnergy, { unit: 'tce' })}
                  </Descriptions.Item>
                  <Descriptions.Item label="年碳排放">
                    {emissionFormat(enterprise.yearlyEmission)}
                  </Descriptions.Item>
                  <Descriptions.Item label="能耗排名">第 {enterprise.energyRank} 名</Descriptions.Item>
                  <Descriptions.Item label="重点用能">
                    {enterprise.isKeyEnergy ? '是' : '否'}
                  </Descriptions.Item>
                  <Descriptions.Item label="联系人">
                    {enterprise.contact.name}（{enterprise.contact.title}） {enterprise.contact.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="工艺简述">{enterprise.processDesc}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {building && (
              <Card size="small" title="设施 / 建筑">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="名称">{building.name}</Descriptions.Item>
                  <Descriptions.Item label="编码">{building.code}</Descriptions.Item>
                  <Descriptions.Item label="类型">{building.type}</Descriptions.Item>
                  <Descriptions.Item label="面积">{numFormat(building.area)} m²</Descriptions.Item>
                  <Descriptions.Item label="地址">{building.address}</Descriptions.Item>
                  <Descriptions.Item label="表计数量">{building.meterCount}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {!enterprise && !building && (
              <Card size="small" title="点位信息">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="名称">{selected.name}</Descriptions.Item>
                  <Descriptions.Item label="类型">{pointTypeLabel(selected.type)}</Descriptions.Item>
                  <Descriptions.Item label="经度">{selected.lng}</Descriptions.Item>
                  <Descriptions.Item label="纬度">{selected.lat}</Descriptions.Item>
                  {selected.refId && (
                    <Descriptions.Item label="关联 ID">{selected.refId}</Descriptions.Item>
                  )}
                </Descriptions>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  年碳排放合计（当前筛选）：{emissionFormat(totalEmission)}
                </Text>
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  )
}

function pointTypeLabel(type: GeoPoint['type']): string {
  const map: Record<GeoPoint['type'], string> = {
    enterprise: '企业',
    building: '建筑',
    facility: '设施',
    pv: '光伏',
    storage: '储能',
    charger: '充电桩',
    gate: '出入口',
  }
  return map[type]
}
