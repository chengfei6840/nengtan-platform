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
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import {
  energyCostSummary,
  enterpriseEnergyRanking,
  monthlyEnergy,
  touEnergy,
} from '@/mock/energy'
import { chartColors } from '@/theme'
import { moneyFormat, numFormat, percentFormat, energyFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'

interface CostShareRow {
  id: string
  enterpriseId: string
  name: string
  industry: string
  energy: number
  share: number
  costWan: number
}

type CostFormValues = {
  enterpriseId: string
  name: string
  industry: string
  energy: number
  share: number
  costWan: number
}

const TOU_COLORS: Record<string, string> = {
  尖: '#dc2626',
  峰: '#ea580c',
  平: '#ca8a04',
  谷: '#059669',
}

const totalEnergySeed = enterpriseEnergyRanking.reduce((s, r) => s + r.energy, 0)

const COST_SEED: CostShareRow[] = enterpriseEnergyRanking.map((r) => {
  const share = totalEnergySeed ? (r.energy / totalEnergySeed) * 100 : 0
  return {
    id: r.enterpriseId,
    enterpriseId: r.enterpriseId,
    name: r.name,
    industry: r.industry,
    energy: r.energy,
    share: +share.toFixed(1),
    costWan: +((energyCostSummary.totalCost * share) / 100).toFixed(1),
  }
})

export default function CostPage() {
  const summary = energyCostSummary
  const { items, create, update, remove } = useCrudList(COST_SEED, 'cost')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CostShareRow | null>(null)
  const [form] = Form.useForm<CostFormValues>()

  const totalEnergy = items.reduce((s, r) => s + r.energy, 0)

  const costTrendOption = useMemo(() => {
    return {
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['能源费用(万元)', '用电量(万kWh)'] },
      grid: { left: 48, right: 48, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        data: monthlyEnergy.map((m) => m.month),
        axisLabel: { rotate: 30, fontSize: 11 },
      },
      yAxis: [
        { type: 'value', name: '万元', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '万kWh', splitLine: { show: false } },
      ],
      series: [
        {
          name: '能源费用(万元)',
          type: 'bar',
          barMaxWidth: 18,
          data: monthlyEnergy.map((m) => m.cost),
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '用电量(万kWh)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: monthlyEnergy.map((m) => +(m.electricity / 1e4).toFixed(1)),
        },
      ],
    }
  }, [])

  const touCostOption = useMemo(
    () => ({
      color: touEnergy.map((t) => TOU_COLORS[t.period] ?? chartColors.primary),
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 万元 ({d}%)',
      },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{c}万', fontSize: 11 },
          data: touEnergy.map((t) => ({ name: `${t.period}电费`, value: t.cost })),
        },
      ],
    }),
    [],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      enterpriseId: '',
      name: '',
      industry: '',
      energy: 0,
      share: 0,
      costWan: 0,
    })
    setModalOpen(true)
  }

  const openEdit = (row: CostShareRow) => {
    setEditing(row)
    form.setFieldsValue({
      enterpriseId: row.enterpriseId,
      name: row.name,
      industry: row.industry,
      energy: row.energy,
      share: row.share,
      costWan: row.costWan,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const row = {
      ...values,
      id: values.enterpriseId || editing?.id || `cost-${Date.now()}`,
      enterpriseId: values.enterpriseId || editing?.enterpriseId || `ent-${Date.now()}`,
    }
    if (editing) {
      update(editing.id, row)
      message.success('费用分摊已更新')
    } else {
      create(row)
      message.success('费用分摊已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<CostShareRow> = [
    { title: '企业', dataIndex: 'name', ellipsis: true },
    { title: '行业', dataIndex: 'industry', width: 110 },
    {
      title: '综合能耗',
      dataIndex: 'energy',
      width: 110,
      render: (v: number) => `${numFormat(v, { digits: 0 })} tce`,
    },
    {
      title: '费用占比',
      dataIndex: 'share',
      width: 100,
      render: (v: number) => percentFormat(v),
      sorter: (a, b) => a.share - b.share,
      defaultSortOrder: 'descend',
    },
    {
      title: '分摊费用',
      dataIndex: 'costWan',
      width: 110,
      render: (v: number) => `${numFormat(v, { digits: 1 })} 万元`,
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
        title="能源费用"
        subtitle={`${summary.month} · 单位 ${summary.unit}`}
        breadcrumbs={[{ title: '能源管理' }, { title: '能源费用' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="总费用" value={numFormat(summary.totalCost, { digits: 1 })} unit={summary.unit} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="电费"
            value={numFormat(summary.electricityCost, { digits: 1 })}
            unit={summary.unit}
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="气费" value={numFormat(summary.gasCost, { digits: 1 })} unit={summary.unit} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="蒸汽费"
            value={numFormat(summary.steamCost, { digits: 1 })}
            unit={summary.unit}
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="水+柴油"
            value={numFormat(summary.waterCost + summary.dieselCost, { digits: 1 })}
            unit={summary.unit}
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="平均电价"
            value={numFormat(summary.avgPrice, { digits: 3 })}
            unit={summary.avgPriceUnit}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <ChartCard title="费用趋势" subtitle="由 monthlyEnergy.cost 推导" height={340}>
            <ReactECharts option={costTrendOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={10}>
          <ChartCard title="分时电费构成" subtitle="尖峰平谷电费（万元）" height={340}>
            <ReactECharts option={touCostOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="企业费用分摊"
          subtitle={`按综合能耗占比分摊本月总费用 ${moneyFormat(summary.totalCost, { unit: '万元', digits: 1 })}（演示）`}
          height="auto"
        >
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 760 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>合计（Top）</Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}>
                  {numFormat(totalEnergy, { digits: 0 })} tce
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  {percentFormat(items.reduce((s, r) => s + r.share, 0))}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {numFormat(
                    items.reduce((s, r) => s + r.costWan, 0),
                    { digits: 1 },
                  )}{' '}
                  万元
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} />
              </Table.Summary.Row>
            )}
          />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16, color: '#64748b', fontSize: 13 }}>
        分时明细：
        {touEnergy.map((t) => (
          <span key={t.period} style={{ marginRight: 16 }}>
            {t.period} {energyFormat(t.energy)} / {numFormat(t.price, { digits: 4 })} 元/kWh /{' '}
            {numFormat(t.cost, { digits: 1 })} 万元
          </span>
        ))}
      </div>

      <Modal
        title={editing ? '编辑费用分摊' : '新建费用分摊'}
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
          <Form.Item name="industry" label="行业" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item name="energy" label="综合能耗 (tce)" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 140 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="share" label="费用占比 (%)" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 140 }}>
              <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
            </Form.Item>
            <Form.Item name="costWan" label="分摊费用 (万元)" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 140 }}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
