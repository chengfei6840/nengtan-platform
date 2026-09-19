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
import { energyBenchmarks } from '@/mock/energy'
import { chartColors } from '@/theme'
import { numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { BenchmarkItem } from '@/mock/types'

type BenchmarkRow = BenchmarkItem & { id: string }

type Level = '先进' | '优于均值' | '接近均值' | '落后'

type BenchmarkFormValues = {
  industry: string
  parkAvgIntensity: number
  industryAvgIntensity: number
  bestPractice: number
  unit: string
}

const SEED: BenchmarkRow[] = energyBenchmarks.map((b) => ({
  ...b,
  id: `bm-${b.industry}`,
}))

function calcGap(item: BenchmarkItem) {
  return +(item.parkAvgIntensity - item.industryAvgIntensity).toFixed(3)
}

function calcLevel(item: BenchmarkItem): Level {
  const { parkAvgIntensity: p, industryAvgIntensity: i, bestPractice: b } = item
  if (p <= b * 1.05) return '先进'
  if (p < i) return '优于均值'
  if (p <= i * 1.08) return '接近均值'
  return '落后'
}

const LEVEL_COLOR: Record<Level, string> = {
  先进: 'success',
  优于均值: 'processing',
  接近均值: 'warning',
  落后: 'error',
}

export default function BenchmarkPage() {
  const { items, create, update, remove } = useCrudList(SEED, 'bm')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BenchmarkRow | null>(null)
  const [form] = Form.useForm<BenchmarkFormValues>()

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        gap: calcGap(item),
        level: calcLevel(item),
        gapToBest: +(item.parkAvgIntensity - item.bestPractice).toFixed(3),
      })),
    [items],
  )

  const advancedCount = rows.filter((r) => r.level === '先进' || r.level === '优于均值').length
  const avgGap = rows.reduce((s, r) => s + r.gap, 0) / (rows.length || 1)

  const chartOption = useMemo(
    () => ({
      color: [chartColors.primary, chartColors.muted, chartColors.accent],
      tooltip: { trigger: 'axis' },
      legend: { data: ['园区均值', '行业均值', '先进值'] },
      grid: { left: 48, right: 24, top: 40, bottom: 48 },
      xAxis: {
        type: 'category',
        data: items.map((b) => b.industry),
        axisLabel: { rotate: 30, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'tce/万元产值',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '园区均值',
          type: 'bar',
          barMaxWidth: 18,
          data: items.map((b) => b.parkAvgIntensity),
        },
        {
          name: '行业均值',
          type: 'bar',
          barMaxWidth: 18,
          data: items.map((b) => b.industryAvgIntensity),
        },
        {
          name: '先进值',
          type: 'line',
          smooth: true,
          data: items.map((b) => b.bestPractice),
        },
      ],
    }),
    [items],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      industry: '',
      parkAvgIntensity: 0,
      industryAvgIntensity: 0,
      bestPractice: 0,
      unit: 'tce/万元产值',
    })
    setModalOpen(true)
  }

  const openEdit = (row: BenchmarkRow) => {
    setEditing(row)
    form.setFieldsValue({
      industry: row.industry,
      parkAvgIntensity: row.parkAvgIntensity,
      industryAvgIntensity: row.industryAvgIntensity,
      bestPractice: row.bestPractice,
      unit: row.unit,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('对标项已更新')
    } else {
      create(values)
      message.success('对标项已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<(typeof rows)[number]> = [
    { title: '行业', dataIndex: 'industry', width: 120 },
    {
      title: '园区均值',
      dataIndex: 'parkAvgIntensity',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 2 }),
    },
    {
      title: '行业均值',
      dataIndex: 'industryAvgIntensity',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 2 }),
    },
    {
      title: '先进值',
      dataIndex: 'bestPractice',
      width: 100,
      render: (v: number) => numFormat(v, { digits: 2 }),
    },
    {
      title: '相对行业差距',
      dataIndex: 'gap',
      width: 130,
      render: (v: number) => (
        <span style={{ color: v < 0 ? '#059669' : '#dc2626' }}>
          {v > 0 ? '+' : ''}
          {numFormat(v, { digits: 3 })}
        </span>
      ),
      sorter: (a, b) => a.gap - b.gap,
    },
    {
      title: '距先进差距',
      dataIndex: 'gapToBest',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 3 }),
    },
    {
      title: '对标等级',
      dataIndex: 'level',
      width: 110,
      render: (level: Level) => <Tag color={LEVEL_COLOR[level]}>{level}</Tag>,
      filters: (['先进', '优于均值', '接近均值', '落后'] as Level[]).map((l) => ({
        text: l,
        value: l,
      })),
      onFilter: (value, record) => record.level === value,
    },
    { title: '单位', dataIndex: 'unit', ellipsis: true },
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
            message.success('已删除对标项')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="能效对标"
        subtitle="园区分行业能耗强度 vs 行业均值 / 先进值"
        breadcrumbs={[{ title: '能源管理' }, { title: '能效对标' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <KpiCard title="对标行业数" value={rows.length} unit="个" />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title="优于行业占比"
            value={percentFormat((advancedCount / (rows.length || 1)) * 100)}
            trend="down"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title="平均差距（园区-行业）"
            value={numFormat(avgGap, { digits: 3 })}
            unit="tce/万元"
            trend={avgGap < 0 ? 'down' : 'up'}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="园区均值 vs 行业均值 vs 先进值"
          subtitle="单位：tce/万元产值"
          height={360}
        >
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="分行业对标明细" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑对标项' : '新建对标项'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="industry" label="行业" rules={[{ required: true, message: '请输入行业' }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="parkAvgIntensity"
              label="园区均值"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item
              name="industryAvgIntensity"
              label="行业均值"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item
              name="bestPractice"
              label="先进值"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
          </Space>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true }]}
            style={{ marginTop: 16 }}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
