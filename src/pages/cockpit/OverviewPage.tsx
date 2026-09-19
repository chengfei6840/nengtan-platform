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
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { useDemo } from '@/context/DemoContext'
import { parkKpiByPeriod, parkOverview } from '@/mock/park'
import { enterpriseEnergyRanking, monthlyEnergy } from '@/mock/energy'
import { enterprisesById } from '@/mock/enterprises'
import { chartColors } from '@/theme'
import { energyFormat, emissionFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { EnterpriseEnergyRank } from '@/mock/types'

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

export default function OverviewPage() {
  const { period, zoneId } = useDemo()
  const { items, create, update, remove } = useCrudList(SEED, 'rank')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RankRow | null>(null)
  const [form] = Form.useForm<RankFormValues>()

  const kpiSummary = parkKpiByPeriod[period]
  const zoneName =
    zoneId === 'all'
      ? '全园'
      : parkOverview.zones.find((z) => z.id === zoneId)?.name ?? zoneId

  const ranking = useMemo(() => {
    if (zoneId === 'all') return items
    return items.filter((r) => enterprisesById[r.enterpriseId]?.zoneId === zoneId)
  }, [zoneId, items])

  const latestMonth = monthlyEnergy[monthlyEnergy.length - 1]

  const trendOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        left: 'center',
        data: ['综合能耗(tce)', '用电量(万kWh)', '光伏发电(万kWh)'],
      },
      grid: { left: 52, right: 52, top: 48, bottom: 56 },
      xAxis: {
        type: 'category',
        data: monthlyEnergy.map((m) => m.month),
        axisLabel: { rotate: 35, fontSize: 11, margin: 12 },
      },
      yAxis: [
        { type: 'value', name: 'tce', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '万kWh', splitLine: { show: false } },
      ],
      series: [
        {
          name: '综合能耗(tce)',
          type: 'bar',
          data: monthlyEnergy.map((m) => m.totalTce),
          barMaxWidth: 18,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '用电量(万kWh)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: monthlyEnergy.map((m) => +(m.electricity / 1e4).toFixed(1)),
        },
        {
          name: '光伏发电(万kWh)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: monthlyEnergy.map((m) => +(m.pvGeneration / 1e4).toFixed(1)),
        },
      ],
    }),
    [],
  )

  const structureOption = useMemo(() => {
    const pieData = [
      { name: '电力', value: +(latestMonth.electricity / 1e4).toFixed(1) },
      { name: '天然气', value: +(latestMonth.gas / 100).toFixed(1) },
      { name: '蒸汽', value: latestMonth.steam },
      { name: '水', value: +(latestMonth.water / 10).toFixed(1) },
      { name: '柴油', value: latestMonth.diesel },
      { name: '光伏发电', value: +(latestMonth.pvGeneration / 1e4).toFixed(1) },
    ]
    return {
      color: chartColors.series,
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: pieData,
        },
      ],
    }
  }, [latestMonth])

  const alarmItem = kpiSummary.items.find((i) => i.key === 'alarmOpen')
  const alarmCount =
    alarmItem?.value ??
    kpiSummary.items.find((i) => i.label.includes('告警'))?.value ??
    0

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
    {
      title: '企业',
      dataIndex: 'name',
      ellipsis: true,
      render: (name: string, row) => (
        <Link to={`/archive/enterprises?id=${row.enterpriseId}`}>{name}</Link>
      ),
    },
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
    },
    {
      title: '强度',
      dataIndex: 'intensity',
      width: 110,
      render: (v: number) => `${numFormat(v, { digits: 3 })} tce/万元`,
    },
    {
      title: '同比',
      dataIndex: 'yoy',
      width: 90,
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#dc2626' : '#059669' }}>
          {v > 0 ? '+' : ''}
          {v.toFixed(1)}%
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

  return (
    <div>
      <PageHeader
        title="园区总览"
        subtitle={`${parkOverview.name} · ${zoneName} · ${kpiSummary.label}（截至 ${kpiSummary.asOf}）`}
        breadcrumbs={[{ title: '综合驾驶舱' }, { title: '园区总览' }]}
        tags={<Tag color="teal">{zoneName}</Tag>}
        extra={
          <Space wrap>
            <Button icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Link to="/archive/enterprises">
              <Button type="primary">企业档案</Button>
            </Link>
            <Link to="/archive/meters">
              <Button>计量点档案</Button>
            </Link>
            <Link to="/archive/devices">
              <Button>设备档案</Button>
            </Link>
            <Link to="/cockpit/energy-map">
              <Button>能源一张图</Button>
            </Link>
            <Link to="/cockpit/carbon-map">
              <Button>碳排放一张图</Button>
            </Link>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        {kpiSummary.items.map((item) => (
          <Col xs={24} sm={12} md={8} xl={6} key={item.key}>
            <KpiCard
              title={item.label}
              value={item.value}
              unit={item.unit}
              yoy={item.yoy}
              mom={item.mom}
              target={item.target}
              trend={item.trend}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <ChartCard title="近12月能耗趋势" subtitle="综合能耗 / 用电 / 光伏" height={340}>
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={10}>
          <ChartCard
            title="能源结构"
            subtitle={`${latestMonth.month}（示意折算）`}
            height={340}
            extra={
              <Tag color={Number(alarmCount) > 0 ? 'error' : 'success'}>
                未闭环告警 {numFormat(Number(alarmCount), { digits: 0 })} 条
              </Tag>
            }
          >
            <ReactECharts option={structureOption} style={{ height: '100%', width: '100%' }} />
          </ChartCard>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="企业综合能耗排名"
          subtitle={zoneId === 'all' ? '园区 Top 企业' : `${zoneName} 企业`}
          height="auto"
        >
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={ranking}
            pagination={false}
            scroll={{ x: 840 }}
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
