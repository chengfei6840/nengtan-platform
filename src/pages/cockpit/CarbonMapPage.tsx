import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { ParkMap } from '@/components/ParkMap'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { ScopeLegend } from '@/components/ScopeLegend'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { useDemo } from '@/context/DemoContext'
import { useArchive, indexById } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { scopeBreakdowns as seedScopes } from '@/mock/carbon'
import { chartColors } from '@/theme'
import { emissionFormat, numFormat } from '@/utils/format'
import { SCOPE_META } from '@/utils/scopeLabels'
import type { ColumnsType } from 'antd/es/table'
import type { GeoPoint, ScopeBreakdown } from '@/mock/types'

type ScopeRow = ScopeBreakdown & { id: string }

const SEED: ScopeRow[] = seedScopes.map((s) => ({ ...s, id: s.enterpriseId }))

export default function CarbonMapPage() {
  const { zoneId } = useDemo()
  const { enterprises, buildings } = useArchive()
  const enterprisesById = useMemo(() => indexById(enterprises), [enterprises])
  const buildingsById = useMemo(() => indexById(buildings), [buildings])
  const { items, create, update, remove } = useCrudList(SEED, 'scope')

  const [selected, setSelected] = useState<GeoPoint | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ScopeRow | null>(null)
  const [form] = Form.useForm()

  const points = useMemo(() => {
    const list = parkOverview.mapPoints
    if (zoneId === 'all') return list
    return list.filter((p) => p.zoneId === zoneId)
  }, [zoneId])

  const filteredScopes = useMemo(() => {
    if (zoneId === 'all') return items
    return items.filter((s) => enterprisesById[s.enterpriseId]?.zoneId === zoneId)
  }, [zoneId, items, enterprisesById])

  const zoneEnterprises = useMemo(() => {
    if (zoneId === 'all') return enterprises
    return enterprises.filter((e) => e.zoneId === zoneId)
  }, [zoneId, enterprises])

  const totalEmission = filteredScopes.reduce((s, i) => s + i.total, 0)
  const scope1 = filteredScopes.reduce((s, i) => s + i.scope1, 0)
  const scope2 = filteredScopes.reduce((s, i) => s + i.scope2, 0)
  const scope3 = filteredScopes.reduce((s, i) => s + i.scope3, 0)

  const zoneName =
    zoneId === 'all'
      ? '全园'
      : parkOverview.zones.find((z) => z.id === zoneId)?.name ?? zoneId

  const pieOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂e ({d}%)' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '46%'],
          label: { formatter: '{b}\n{d}%', fontSize: 12 },
          data: [
            { name: SCOPE_META.scope1.full, value: +scope1.toFixed(1) },
            { name: SCOPE_META.scope2.full, value: +scope2.toFixed(1) },
            { name: SCOPE_META.scope3.full, value: +scope3.toFixed(1) },
          ],
        },
      ],
    }),
    [scope1, scope2, scope3],
  )

  const ranking = useMemo(
    () =>
      [...filteredScopes]
        .sort((a, b) => b.total - a.total)
        .map((item, idx) => ({ ...item, rank: idx + 1 })),
    [filteredScopes],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      enterpriseId: '',
      scope1: 0,
      scope2: 0,
      scope3: 0,
      intensity: 1,
    })
    setModalOpen(true)
  }

  const openEdit = (row: ScopeRow) => {
    setEditing(row)
    form.setFieldsValue(row)
    setModalOpen(true)
  }

  const onOk = async () => {
    const values = await form.validateFields()
    const total = +(values.scope1 + values.scope2 + values.scope3).toFixed(1)
    const payload: ScopeRow = {
      id: editing?.id ?? (values.enterpriseId || `ent-demo-${Date.now()}`),
      enterpriseId: values.enterpriseId || editing?.enterpriseId || `ent-demo-${Date.now()}`,
      name: values.name,
      scope1: values.scope1,
      scope2: values.scope2,
      scope3: values.scope3,
      total,
      intensity: values.intensity,
    }
    if (editing) {
      update(editing.id, payload)
      message.success('已更新排放排名')
    } else {
      create(payload)
      message.success('已新增排放排名')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<ScopeRow & { rank: number }> = [
    { title: '排名', dataIndex: 'rank', width: 64 },
    { title: '企业', dataIndex: 'name', ellipsis: true },
    {
      title: (
        <Tooltip title={SCOPE_META.scope1.hint}>
          <span>范围一·直接</span>
        </Tooltip>
      ),
      dataIndex: 'scope1',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: (
        <Tooltip title={SCOPE_META.scope2.hint}>
          <span>范围二·外购能源</span>
        </Tooltip>
      ),
      dataIndex: 'scope2',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: (
        <Tooltip title={SCOPE_META.scope3.hint}>
          <span>范围三·价值链</span>
        </Tooltip>
      ),
      dataIndex: 'scope3',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '合计',
      dataIndex: 'total',
      width: 110,
      render: (v: number) => emissionFormat(v),
      sorter: (a, b) => a.total - b.total,
      defaultSortOrder: 'descend',
    },
    {
      title: '强度',
      dataIndex: 'intensity',
      width: 120,
      render: (v: number) => `${numFormat(v, { digits: 3 })} tCO₂e/万元`,
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            message.success('已删除')
          }}
        />
      ),
    },
  ]

  const handleSelect = (point: GeoPoint) => {
    setSelected(point)
    setOpen(true)
  }

  const enterprise =
    selected?.type === 'enterprise' && selected.refId
      ? enterprisesById[selected.refId]
      : undefined

  const scopeDetail =
    selected?.refId != null
      ? filteredScopes.find((s) => s.enterpriseId === selected.refId) ??
        items.find((s) => s.enterpriseId === selected.refId)
      : undefined

  const building =
    selected?.refId && (selected.type === 'facility' || selected.type === 'building')
      ? buildingsById[selected.refId]
      : undefined

  return (
    <div>
      <PageHeader
        title="碳排放一张图"
        subtitle={`${parkOverview.name} · ${zoneName} · 企业点位按排放强度着色；范围一直接排放 / 范围二外购能源 / 范围三价值链`}
        breadcrumbs={[{ title: '综合驾驶舱' }, { title: '碳排放一张图' }]}
        tags={<Tag color="green">{zoneName}</Tag>}
        extra={
          <Button type="primary" onClick={openCreate}>
            新建排名
          </Button>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <ScopeLegend compact />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title="核算企业数"
            value={filteredScopes.length}
            unit="家"
            extra={
              <span style={{ fontSize: 12, color: '#64748b' }}>档案 {zoneEnterprises.length}</span>
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="排放合计" value={numFormat(totalEmission, { digits: 0 })} unit="tCO₂e" />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title="范围二（外购能源）占比"
            value={totalEmission > 0 ? +((scope2 / totalEmission) * 100).toFixed(1) : 0}
            unit="%"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card styles={{ body: { padding: 12 } }}>
            <ParkMap
              points={points}
              colorMode="emission"
              selectedId={selected?.id}
              onSelect={handleSelect}
              height={480}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <ChartCard
            title="排放范围结构"
            subtitle="范围一直接 · 范围二外购能源 · 范围三价值链"
            height={480}
          >
            <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="企业排放排名" subtitle="按核算合计排放（可增删改）" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={ranking}
            pagination={false}
            scroll={{ x: 920 }}
          />
        </ChartCard>
      </div>

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
              <Card size="small" title="企业排放">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="全称">{enterprise.name}</Descriptions.Item>
                  <Descriptions.Item label="年碳排放">
                    {emissionFormat(enterprise.yearlyEmission)}
                  </Descriptions.Item>
                  <Descriptions.Item label="排放排名">第 {enterprise.emissionRank} 名</Descriptions.Item>
                  <Descriptions.Item label="强度排名">第 {enterprise.intensityRank} 名</Descriptions.Item>
                  <Descriptions.Item label="碳边界">{enterprise.carbonBoundary}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {scopeDetail && (
              <Card size="small" title="按核算范围分解">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={SCOPE_META.scope1.full}>
                    {emissionFormat(scopeDetail.scope1)}
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{SCOPE_META.scope1.hint}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label={SCOPE_META.scope2.full}>
                    {emissionFormat(scopeDetail.scope2)}
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{SCOPE_META.scope2.hint}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label={SCOPE_META.scope3.full}>
                    {emissionFormat(scopeDetail.scope3)}
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{SCOPE_META.scope3.hint}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="合计">{emissionFormat(scopeDetail.total)}</Descriptions.Item>
                  <Descriptions.Item label="强度">
                    {numFormat(scopeDetail.intensity, { digits: 3 })} tCO₂e/万元
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {building && (
              <Card size="small" title="设施 / 建筑">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="名称">{building.name}</Descriptions.Item>
                  <Descriptions.Item label="类型">{building.type}</Descriptions.Item>
                  <Descriptions.Item label="地址">{building.address}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Space>
        )}
      </Drawer>

      <Modal
        title={editing ? '编辑排放排名' : '新建排放排名'}
        open={modalOpen}
        onOk={onOk}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="name" label="企业名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="enterpriseId" label="企业 ID" rules={[{ required: !editing }]}>
            <Input disabled={!!editing} placeholder="如 ent-001" />
          </Form.Item>
          <Form.Item name="scope1" label="范围一" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="scope2" label="范围二" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="scope3" label="范围三" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="intensity" label="强度 (tCO₂e/万元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
          </Form.Item>
        </Form>
      </Modal>
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
