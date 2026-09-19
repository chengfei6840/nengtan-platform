import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { ScopeLegend } from '@/components/ScopeLegend'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { useDemo } from '@/context/DemoContext'
import { carbonTargets, scopeBreakdowns } from '@/mock/carbon'
import { monthlyEnergy } from '@/mock/energy'
import { enterprisesById } from '@/mock/enterprises'
import { parkOverview } from '@/mock/park'
import { chartColors } from '@/theme'
import { emissionFormat, numFormat, percentFormat } from '@/utils/format'
import { SCOPE_META } from '@/utils/scopeLabels'
import type { ColumnsType } from 'antd/es/table'
import type { ScopeBreakdown } from '@/mock/types'

type ScopeRow = ScopeBreakdown & { id: string }

type ScopeFormValues = {
  enterpriseId: string
  name: string
  scope1: number
  scope2: number
  scope3: number
  intensity: number
}

const SEED: ScopeRow[] = scopeBreakdowns.map((r) => ({
  ...r,
  id: r.enterpriseId,
}))

export default function OverviewPage() {
  const { zoneId } = useDemo()
  const { items, create, update, remove } = useCrudList(SEED, 'scope')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ScopeRow | null>(null)
  const [form] = Form.useForm<ScopeFormValues>()

  const zoneName =
    zoneId === 'all'
      ? '全园'
      : parkOverview.zones.find((z) => z.id === zoneId)?.name ?? zoneId

  const ranking = useMemo(() => {
    const list =
      zoneId === 'all'
        ? items
        : items.filter((r) => enterprisesById[r.enterpriseId]?.zoneId === zoneId)
    return [...list].sort((a, b) => b.total - a.total)
  }, [zoneId, items])

  const totals = useMemo(() => {
    const scope1 = ranking.reduce((s, r) => s + r.scope1, 0)
    const scope2 = ranking.reduce((s, r) => s + r.scope2, 0)
    const scope3 = ranking.reduce((s, r) => s + r.scope3, 0)
    const total = scope1 + scope2 + scope3
    const avgIntensity =
      ranking.length > 0
        ? ranking.reduce((s, r) => s + r.intensity, 0) / ranking.length
        : 0
    return { scope1, scope2, scope3, total, avgIntensity }
  }, [ranking])

  const scopePieOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂e ({d}%)' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: [
            { name: SCOPE_META.scope1.full, value: +totals.scope1.toFixed(1) },
            { name: SCOPE_META.scope2.full, value: +totals.scope2.toFixed(1) },
            { name: SCOPE_META.scope3.full, value: +totals.scope3.toFixed(1) },
          ],
        },
      ],
    }),
    [totals],
  )

  const hasMonthlyEmission = monthlyEnergy.some(
    (m) => 'emission' in m || 'emissions' in m,
  )

  const trendOption = useMemo(() => {
    if (hasMonthlyEmission) {
      const months = monthlyEnergy.map((m) => m.month)
      const values = monthlyEnergy.map((m) => {
        const row = m as typeof m & { emission?: number; emissions?: number }
        return row.emission ?? row.emissions ?? 0
      })
      return {
        color: chartColors.series,
        tooltip: { trigger: 'axis' },
        grid: { left: 48, right: 24, top: 32, bottom: 36 },
        xAxis: { type: 'category', data: months, axisLabel: { rotate: 30 } },
        yAxis: { type: 'value', name: 'tCO₂e', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [{ name: '月度排放', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: values }],
      }
    }
    return {
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['路径排放', '强度目标路径'] },
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
          name: '路径排放',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.08 },
          data: carbonTargets.peakingPath.map((p) => p.emission),
        },
        {
          name: '企业汇总参考',
          type: 'bar',
          barMaxWidth: 22,
          data: carbonTargets.peakingPath.map((p) =>
            p.year === carbonTargets.year ? totals.total : null,
          ),
        },
      ],
    }
  }, [hasMonthlyEmission, totals.total])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      enterpriseId: '',
      name: '',
      scope1: 0,
      scope2: 0,
      scope3: 0,
      intensity: 0,
    })
    setModalOpen(true)
  }

  const openEdit = (row: ScopeRow) => {
    setEditing(row)
    form.setFieldsValue({
      enterpriseId: row.enterpriseId,
      name: row.name,
      scope1: row.scope1,
      scope2: row.scope2,
      scope3: row.scope3,
      intensity: row.intensity,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const total = +(values.scope1 + values.scope2 + values.scope3).toFixed(1)
    const row: ScopeRow = {
      ...values,
      id: values.enterpriseId,
      enterpriseId: values.enterpriseId,
      total,
    }
    if (editing) {
      update(editing.id, row)
      message.success('排放排名已更新')
    } else {
      create(row)
      message.success('排放排名已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<ScopeRow> = [
    {
      title: '排名',
      width: 64,
      render: (_, __, index) => index + 1,
    },
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
      width: 120,
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
      key: 'actions',
      width: 120,
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

  return (
    <div>
      <PageHeader
        title="园区碳总览"
        subtitle={`${parkOverview.shortName} · ${zoneName} · ${carbonTargets.year} 目标跟踪 · 排放按范围一/二/三分类汇总`}
        breadcrumbs={[{ title: '碳排放管理' }, { title: '园区碳总览' }]}
        tags={<Tag color="teal">{zoneName}</Tag>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <ScopeLegend />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="园区碳排放（企业汇总）"
            value={numFormat(totals.total, { digits: 0 })}
            unit="tCO₂e"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="强度实际"
            value={numFormat(carbonTargets.intensityActual, { digits: 3 })}
            unit={carbonTargets.intensityUnit}
            target={carbonTargets.intensityTarget}
            trend="down"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="绝对量目标"
            value={numFormat(carbonTargets.absoluteTarget, { digits: 0 })}
            unit="tCO₂e"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="同比减排"
            value={percentFormat(carbonTargets.reductionYoyActual)}
            target={carbonTargets.reductionYoyTarget}
            trend="down"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <ChartCard
            title="排放构成（按核算范围）"
            subtitle="范围一直接 · 范围二外购能源 · 范围三价值链"
            height={340}
          >
            <ReactECharts option={scopePieOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={14}>
          <ChartCard
            title={hasMonthlyEmission ? '月度排放趋势' : '达峰路径趋势'}
            subtitle={
              hasMonthlyEmission
                ? '来自 monthlyEnergy 排放字段'
                : 'monthlyEnergy 无排放字段，使用 carbonTargets.peakingPath'
            }
            height={340}
          >
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="企业排放排名" subtitle={zoneName} height="auto">
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

      <Modal
        title={editing ? '编辑排放排名' : '新建排放排名'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="企业名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="enterpriseId" label="企业 ID" rules={[{ required: true }]}>
            <Input disabled={!!editing} placeholder="如 ent-001" />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item name="scope1" label="范围一" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="scope2" label="范围二" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="scope3" label="范围三" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="intensity" label="强度" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
