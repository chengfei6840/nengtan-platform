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
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { useDemo } from '@/context/DemoContext'
import { enterpriseEnergyRanking, monthlyEnergy } from '@/mock/energy'
import { enterprisesById } from '@/mock/enterprises'
import { parkOverview } from '@/mock/park'
import { chartColors } from '@/theme'
import { energyFormat, emissionFormat, numFormat, percentFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { EnterpriseEnergyRank, PeriodType } from '@/mock/types'

const PERIOD_LABEL: Record<PeriodType, string> = {
  day: '日',
  month: '月',
  year: '年',
}

type RankRow = EnterpriseEnergyRank & { id: string }

type RankFormValues = {
  enterpriseId: string
  name: string
  industry: string
  energy: number
  emission: number
  intensity: number
  yoy: number
  rank: number
}

const SEED: RankRow[] = enterpriseEnergyRanking.map((r) => ({
  ...r,
  id: r.enterpriseId,
}))

export default function StatsPage() {
  const { period, zoneId } = useDemo()
  const { items, create, update, remove } = useCrudList(SEED, 'rank')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RankRow | null>(null)
  const [form] = Form.useForm<RankFormValues>()

  const zoneName =
    zoneId === 'all'
      ? '全园'
      : parkOverview.zones.find((z) => z.id === zoneId)?.name ?? zoneId

  const ranking = useMemo(() => {
    if (zoneId === 'all') return items
    return items.filter((r) => enterprisesById[r.enterpriseId]?.zoneId === zoneId)
  }, [zoneId, items])

  const latest = monthlyEnergy[monthlyEnergy.length - 1]
  const prev = monthlyEnergy[monthlyEnergy.length - 2]
  const momTce =
    prev?.totalTce != null
      ? +(((latest.totalTce - prev.totalTce) / prev.totalTce) * 100).toFixed(1)
      : undefined

  const chartOption = useMemo(() => {
    const months = monthlyEnergy.map((m) => m.month)
    const slice =
      period === 'day'
        ? monthlyEnergy.slice(-3)
        : period === 'year'
          ? monthlyEnergy
          : monthlyEnergy
    const cats = slice.map((m) => m.month)
    return {
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        left: 'center',
        type: 'scroll',
        data: ['综合能耗(tce)', '用电(万kWh)', '天然气(万Nm³)', '光伏(万kWh)', '费用(万元)'],
      },
      grid: { left: 52, right: 52, top: 48, bottom: 56 },
      xAxis: {
        type: 'category',
        data: cats.length ? cats : months,
        axisLabel: { rotate: 35, fontSize: 11, margin: 12 },
      },
      yAxis: [
        { type: 'value', name: 'tce / 万kWh', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '万元', splitLine: { show: false } },
      ],
      series: [
        {
          name: '综合能耗(tce)',
          type: 'bar',
          barMaxWidth: 16,
          data: slice.map((m) => m.totalTce),
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '用电(万kWh)',
          type: 'line',
          smooth: true,
          data: slice.map((m) => +(m.electricity / 1e4).toFixed(1)),
        },
        {
          name: '天然气(万Nm³)',
          type: 'line',
          smooth: true,
          data: slice.map((m) => +(m.gas / 1e4).toFixed(2)),
        },
        {
          name: '光伏(万kWh)',
          type: 'line',
          smooth: true,
          data: slice.map((m) => +(m.pvGeneration / 1e4).toFixed(1)),
        },
        {
          name: '费用(万元)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: slice.map((m) => m.cost),
        },
      ],
    }
  }, [period])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      enterpriseId: '',
      name: '',
      industry: '',
      energy: 0,
      emission: 0,
      intensity: 0,
      yoy: 0,
      rank: items.length + 1,
    })
    setModalOpen(true)
  }

  const openEdit = (row: RankRow) => {
    setEditing(row)
    form.setFieldsValue({
      enterpriseId: row.enterpriseId,
      name: row.name,
      industry: row.industry,
      energy: row.energy,
      emission: row.emission,
      intensity: row.intensity,
      yoy: row.yoy,
      rank: row.rank,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const row = {
      ...values,
      id: values.enterpriseId,
      enterpriseId: values.enterpriseId,
    }
    if (editing) {
      update(editing.id, row)
      message.success('排名已更新')
    } else {
      create(row)
      message.success('排名已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<RankRow> = [
    { title: '排名', dataIndex: 'rank', width: 64 },
    { title: '企业', dataIndex: 'name', ellipsis: true },
    { title: '行业', dataIndex: 'industry', width: 110 },
    {
      title: '综合能耗',
      dataIndex: 'energy',
      width: 120,
      render: (v: number) => energyFormat(v, { unit: 'tce' }),
      sorter: (a, b) => a.energy - b.energy,
    },
    {
      title: '碳排放',
      dataIndex: 'emission',
      width: 120,
      render: (v: number) => emissionFormat(v),
      sorter: (a, b) => a.emission - b.emission,
    },
    {
      title: '强度',
      dataIndex: 'intensity',
      width: 120,
      render: (v: number) => `${numFormat(v, { digits: 3 })} tce/万元`,
    },
    {
      title: '同比',
      dataIndex: 'yoy',
      width: 90,
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#dc2626' : '#059669' }}>
          {v > 0 ? '+' : ''}
          {percentFormat(v)}
        </span>
      ),
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

  const onExport = () => {
    downloadCsv(
      `能耗统计-${zoneName}-${PERIOD_LABEL[period]}.csv`,
      ['排名', '企业', '行业', '综合能耗', '碳排放', '强度', '同比%'],
      ranking.map((r) => [
        r.rank,
        r.name,
        r.industry,
        r.energy,
        r.emission,
        r.intensity,
        r.yoy,
      ]),
    )
    message.success(`已导出能耗统计报表（${PERIOD_LABEL[period]} · ${zoneName}）`)
  }

  return (
    <div>
      <PageHeader
        title="能耗统计"
        subtitle={`${zoneName} · 统计周期：${PERIOD_LABEL[period]}（顶栏切换）`}
        breadcrumbs={[{ title: '能源管理' }, { title: '能耗统计' }]}
        tags={<Tag color="teal">{zoneName}</Tag>}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button type="primary" onClick={onExport}>
              导出报表
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title={`${latest.month} 综合能耗`}
            value={numFormat(latest.totalTce, { digits: 1 })}
            unit="tce"
            mom={momTce}
            trend={momTce != null && momTce > 0 ? 'up' : 'down'}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="用电量"
            value={numFormat(latest.electricity / 1e4, { digits: 1 })}
            unit="万kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="光伏发电"
            value={numFormat(latest.pvGeneration / 1e4, { digits: 1 })}
            unit="万kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="能源费用"
            value={numFormat(latest.cost, { digits: 1 })}
            unit="万元"
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="多能源消耗趋势"
          subtitle="柱：综合能耗 · 线：电/气/光伏/费用"
          height={380}
        >
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="企业能耗排名"
          subtitle={zoneId === 'all' ? '园区 Top 企业' : `${zoneName} 企业`}
          height="auto"
        >
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={ranking}
            pagination={false}
            scroll={{ x: 880 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑企业排名' : '新建企业排名'}
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
            <Form.Item name="rank" label="排名" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 100 }}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
            <Form.Item name="energy" label="综合能耗" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="emission" label="碳排放" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="intensity" label="强度" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
            </Form.Item>
            <Form.Item name="yoy" label="同比 (%)" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 120 }}>
              <InputNumber style={{ width: '100%' }} step={0.1} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
