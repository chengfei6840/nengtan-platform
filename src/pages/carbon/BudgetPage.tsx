import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { carbonBudget2026, carbonTargets } from '@/mock/carbon'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import { parkOverview } from '@/mock/park'
import { chartColors } from '@/theme'
import { emissionFormat, numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { ZoneId } from '@/mock/types'

type ZoneBudgetRow = {
  id: string
  zoneId: ZoneId
  budget: number
  used: number
}

type EnterpriseBudgetRow = {
  id: string
  enterpriseId: string
  budget: number
  used: number
}

type ZoneFormValues = { zoneId: ZoneId; budget: number; used: number }
type EntFormValues = { enterpriseId: string; budget: number; used: number }

/** 情景推演倍率：1 = 基线；每次推演按强度外推放大已用量 */
const SCENARIO_FACTOR = 1.35

const ZONE_SEED: ZoneBudgetRow[] = carbonBudget2026.byZone.map((z) => ({
  ...z,
  id: z.zoneId,
}))

const ENT_SEED: EnterpriseBudgetRow[] = carbonBudget2026.byEnterprise.map((e) => ({
  ...e,
  id: e.enterpriseId,
}))

export default function BudgetPage() {
  const [scenarioOn, setScenarioOn] = useState(false)
  const factor = scenarioOn ? SCENARIO_FACTOR : 1

  const zoneCrud = useCrudList(ZONE_SEED, 'zone')
  const entCrud = useCrudList(ENT_SEED, 'ent')

  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ZoneBudgetRow | null>(null)
  const [zoneForm] = Form.useForm<ZoneFormValues>()

  const [entModalOpen, setEntModalOpen] = useState(false)
  const [editingEnt, setEditingEnt] = useState<EnterpriseBudgetRow | null>(null)
  const [entForm] = Form.useForm<EntFormValues>()

  const budget = carbonBudget2026

  const listUsedBase = useMemo(() => {
    const fromEnt = entCrud.items.reduce((s, r) => s + r.used, 0)
    if (fromEnt > 0) return fromEnt
    return zoneCrud.items.reduce((s, r) => s + r.used, 0)
  }, [entCrud.items, zoneCrud.items])

  const allocated = useMemo(
    () => zoneCrud.items.reduce((s, r) => s + r.budget, 0) || budget.allocated,
    [zoneCrud.items, budget.allocated],
  )

  const used = +(listUsedBase * factor).toFixed(1)
  const remaining = +(budget.totalBudget - used).toFixed(1)
  const projectedYear = +(carbonTargets.absoluteActual * 4 * factor).toFixed(0)
  const intensityActual = +(carbonTargets.intensityActual * factor).toFixed(3)

  const usedRate = budget.totalBudget ? (used / budget.totalBudget) * 100 : 0
  const allocatedRate = budget.totalBudget ? (allocated / budget.totalBudget) * 100 : 0

  const zoneRows = useMemo(
    () =>
      zoneCrud.items.map((z) => {
        const zUsed = +(z.used * factor).toFixed(1)
        return {
          ...z,
          used: zUsed,
          name: parkOverview.zones.find((x) => x.id === z.zoneId)?.name ?? z.zoneId,
          progress: z.budget ? +((zUsed / z.budget) * 100).toFixed(1) : 0,
        }
      }),
    [zoneCrud.items, factor],
  )

  const enterpriseRows = useMemo(
    () =>
      entCrud.items.map((e) => {
        const eUsed = +(e.used * factor).toFixed(1)
        return {
          ...e,
          name: enterprisesById[e.enterpriseId]?.shortName ?? e.enterpriseId,
          used: eUsed,
          remaining: +(e.budget - eUsed).toFixed(1),
          progress: e.budget ? +((eUsed / e.budget) * 100).toFixed(1) : 0,
        }
      }),
    [entCrud.items, factor],
  )

  const pathOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['达峰路径排放', '情景预计排放', '年度预算线'] },
      grid: { left: 52, right: 24, top: 40, bottom: 32 },
      xAxis: {
        type: 'category',
        data: carbonTargets.peakingPath.map((p) => String(p.year)),
      },
      yAxis: {
        type: 'value',
        name: 'tCO₂e',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '达峰路径排放',
          type: 'line',
          smooth: true,
          data: carbonTargets.peakingPath.map((p) => p.emission),
        },
        {
          name: '情景预计排放',
          type: 'line',
          smooth: true,
          lineStyle: { type: scenarioOn ? 'solid' : 'dashed' },
          data: carbonTargets.peakingPath.map((p) =>
            p.year === budget.year ? projectedYear : Math.round(p.emission * factor),
          ),
        },
        {
          name: '年度预算线',
          type: 'line',
          step: 'middle',
          data: carbonTargets.peakingPath.map((p) =>
            p.year === budget.year ? budget.totalBudget : null,
          ),
        },
      ],
    }),
    [budget.year, budget.totalBudget, factor, projectedYear, scenarioOn],
  )

  const openZoneCreate = () => {
    setEditingZone(null)
    zoneForm.setFieldsValue({ zoneId: 'zone-east', budget: 0, used: 0 })
    setZoneModalOpen(true)
  }

  const openZoneEdit = (row: (typeof zoneRows)[number]) => {
    const base = zoneCrud.items.find((z) => z.id === row.id)
    if (!base) return
    setEditingZone(base)
    zoneForm.setFieldsValue({ zoneId: base.zoneId, budget: base.budget, used: base.used })
    setZoneModalOpen(true)
  }

  const handleZoneSubmit = async () => {
    const values = await zoneForm.validateFields()
    if (editingZone) {
      zoneCrud.update(editingZone.id, { ...values, id: values.zoneId })
      message.success('分区预算已更新')
    } else {
      if (zoneCrud.items.some((z) => z.zoneId === values.zoneId)) {
        message.warning('该分区已存在预算行')
        return
      }
      zoneCrud.create({ ...values, id: values.zoneId })
      message.success('分区预算已创建')
    }
    setZoneModalOpen(false)
  }

  const openEntCreate = () => {
    setEditingEnt(null)
    entForm.setFieldsValue({
      enterpriseId: enterprises[0]?.id ?? '',
      budget: 0,
      used: 0,
    })
    setEntModalOpen(true)
  }

  const openEntEdit = (row: (typeof enterpriseRows)[number]) => {
    const base = entCrud.items.find((e) => e.id === row.id)
    if (!base) return
    setEditingEnt(base)
    entForm.setFieldsValue({
      enterpriseId: base.enterpriseId,
      budget: base.budget,
      used: base.used,
    })
    setEntModalOpen(true)
  }

  const handleEntSubmit = async () => {
    const values = await entForm.validateFields()
    if (editingEnt) {
      entCrud.update(editingEnt.id, { ...values, id: values.enterpriseId })
      message.success('企业预算已更新')
    } else {
      if (entCrud.items.some((e) => e.enterpriseId === values.enterpriseId)) {
        message.warning('该企业已存在预算行')
        return
      }
      entCrud.create({ ...values, id: values.enterpriseId })
      message.success('企业预算已创建')
    }
    setEntModalOpen(false)
  }

  const entColumns: ColumnsType<(typeof enterpriseRows)[number]> = [
    { title: '企业', dataIndex: 'name', ellipsis: true },
    {
      title: '预算',
      dataIndex: 'budget',
      width: 120,
      render: (v: number) => emissionFormat(v),
    },
    {
      title: '已用',
      dataIndex: 'used',
      width: 120,
      render: (v: number) => emissionFormat(v),
    },
    {
      title: '剩余',
      dataIndex: 'remaining',
      width: 120,
      render: (v: number) => emissionFormat(v),
    },
    {
      title: '使用进度',
      dataIndex: 'progress',
      width: 180,
      render: (v: number) => (
        <Progress
          percent={Math.min(v, 100)}
          size="small"
          status={v > 85 ? 'exception' : v > 60 ? 'active' : 'normal'}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEntEdit(row)}
          onDelete={() => {
            entCrud.remove(row.id)
            message.success('已删除企业预算')
          }}
        />
      ),
    },
  ]

  const zoneColumns: ColumnsType<(typeof zoneRows)[number]> = [
    { title: '分区', dataIndex: 'name' },
    {
      title: '预算',
      dataIndex: 'budget',
      render: (v: number) => emissionFormat(v),
    },
    {
      title: '已用',
      dataIndex: 'used',
      render: (v: number) => emissionFormat(v),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      render: (v: number) => (
        <Progress percent={Math.min(v, 100)} size="small" status={v > 100 ? 'exception' : 'normal'} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <CrudActions
          onEdit={() => openZoneEdit(row)}
          onDelete={() => {
            zoneCrud.remove(row.id)
            message.success('已删除分区预算')
          }}
        />
      ),
    },
  ]

  const onScenario = () => {
    const next = !scenarioOn
    setScenarioOn(next)
    if (next) {
      const nextUsed = +(listUsedBase * SCENARIO_FACTOR).toFixed(1)
      const nextProjected = +(carbonTargets.absoluteActual * 4 * SCENARIO_FACTOR).toFixed(0)
      const nextIntensity = +(carbonTargets.intensityActual * SCENARIO_FACTOR).toFixed(3)
      const risk = nextProjected > budget.totalBudget
      message.success(
        `情景已开启：强度按 ${nextIntensity} ${carbonTargets.intensityUnit} 外推，已用约 ${numFormat(nextUsed, { digits: 1 })}、全年预计 ${numFormat(nextProjected, { digits: 0 })} tCO₂e，相对预算${risk ? '存在超预算风险' : '总体可控'}`,
        5,
      )
    } else {
      message.info('已恢复基线情景')
    }
  }

  return (
    <div>
      <PageHeader
        title="碳目标与预算"
        subtitle={`${budget.year} 年度碳预算与强度/绝对量目标`}
        breadcrumbs={[{ title: '碳排放管理' }, { title: '碳目标与预算' }]}
        tags={scenarioOn ? <Tag color="orange">情景推演 ×{SCENARIO_FACTOR}</Tag> : undefined}
        extra={
          <Space>
            <Button type={scenarioOn ? 'default' : 'primary'} onClick={onScenario}>
              {scenarioOn ? '恢复基线' : '情景推演'}
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="年度总预算"
            value={numFormat(budget.totalBudget, { digits: 0 })}
            unit="tCO₂e"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已分配" value={numFormat(allocated, { digits: 0 })} unit="tCO₂e" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title={scenarioOn ? '情景已使用' : '已使用'}
            value={numFormat(used, { digits: 1 })}
            unit="tCO₂e"
            trend="up"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title={scenarioOn ? '情景剩余' : '剩余预算'}
            value={numFormat(remaining, { digits: 1 })}
            unit="tCO₂e"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ChartCard title="预算执行进度" height="auto">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 6 }}>已使用 / 总预算 {percentFormat(usedRate)}</div>
              <Progress
                percent={Math.min(+usedRate.toFixed(1), 100)}
                status={usedRate > 100 ? 'exception' : 'active'}
                strokeColor="#0d9488"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 6 }}>
                已分配 / 总预算 {percentFormat(allocatedRate)}
              </div>
              <Progress percent={+allocatedRate.toFixed(1)} strokeColor="#0891b2" />
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                强度目标达成（实际 {numFormat(intensityActual, { digits: 3 })} / 目标{' '}
                {numFormat(carbonTargets.intensityTarget, { digits: 2 })}）
              </div>
              <Progress
                percent={Math.min(
                  100,
                  +((carbonTargets.intensityTarget / intensityActual) * 100).toFixed(1),
                )}
                strokeColor="#059669"
                format={() =>
                  intensityActual <= carbonTargets.intensityTarget ? '已优于目标' : '未达目标'
                }
              />
            </div>
          </ChartCard>
        </Col>
        <Col xs={24} md={12}>
          <ChartCard
            title="达峰路径 vs 年度预算"
            subtitle={
              scenarioOn
                ? `情景全年预计 ${numFormat(projectedYear, { digits: 0 })} tCO₂e`
                : undefined
            }
            height={280}
          >
            <ReactECharts option={pathOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="分区预算"
          height="auto"
          extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openZoneCreate}>
              新建
            </Button>
          }
        >
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={zoneRows}
            columns={zoneColumns}
          />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="企业预算明细"
          subtitle="重点排放单位配额"
          height="auto"
          extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openEntCreate}>
              新建
            </Button>
          }
        >
          <Table
            size="small"
            rowKey="id"
            columns={entColumns}
            dataSource={enterpriseRows}
            pagination={false}
            scroll={{ x: 840 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editingZone ? '编辑分区预算' : '新建分区预算'}
        open={zoneModalOpen}
        onCancel={() => setZoneModalOpen(false)}
        onOk={handleZoneSubmit}
        destroyOnClose
      >
        <Form form={zoneForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
            <Select
              disabled={!!editingZone}
              options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))}
            />
          </Form.Item>
          <Form.Item name="budget" label="预算 (tCO₂e)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="used" label="已用 (tCO₂e)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingEnt ? '编辑企业预算' : '新建企业预算'}
        open={entModalOpen}
        onCancel={() => setEntModalOpen(false)}
        onOk={handleEntSubmit}
        destroyOnClose
      >
        <Form form={entForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true }]}>
            <Select
              disabled={!!editingEnt}
              showSearch
              optionFilterProp="label"
              options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
            />
          </Form.Item>
          <Form.Item name="budget" label="预算 (tCO₂e)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="used" label="已用 (tCO₂e)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
