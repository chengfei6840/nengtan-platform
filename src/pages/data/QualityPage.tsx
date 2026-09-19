import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { enterprisesById, enterprises } from '@/mock/enterprises'
import { dataAnomalies as seedAnomalies, qualityMetrics, qualityTrend } from '@/mock/quality'
import { chartColors } from '@/theme'
import { numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { AlarmLevel, DataAnomaly } from '@/mock/types'

type AnomalyFormValues = {
  type: DataAnomaly['type']
  severity: AlarmLevel
  meterId: string
  enterpriseId?: string
  detectedAt: string
  value?: number
  expectedRange?: string
  status: DataAnomaly['status']
  description: string
}

export default function QualityPage() {
  const { items, create, update, remove } = useCrudList(seedAnomalies, 'anom')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DataAnomaly | null>(null)
  const [form] = Form.useForm<AnomalyFormValues>()

  const trendOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['完整率(%)', '在线率(%)'] },
      grid: { left: 48, right: 24, top: 40, bottom: 28 },
      xAxis: {
        type: 'category',
        data: qualityTrend.map((t) => t.date.slice(5)),
      },
      yAxis: {
        type: 'value',
        min: 95,
        max: 100,
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '完整率(%)',
          type: 'line',
          smooth: true,
          data: qualityTrend.map((t) => t.completeness),
        },
        {
          name: '在线率(%)',
          type: 'line',
          smooth: true,
          data: qualityTrend.map((t) => t.online),
        },
      ],
    }),
    [],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      type: '突变',
      severity: 'warning',
      meterId: '',
      enterpriseId: undefined,
      detectedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      value: undefined,
      expectedRange: '',
      status: 'open',
      description: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: DataAnomaly) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, {
        ...values,
        enterpriseId: values.enterpriseId || undefined,
      })
      message.success('异常记录已更新')
    } else {
      create({
        ...values,
        enterpriseId: values.enterpriseId || undefined,
      })
      message.success('异常记录已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<DataAnomaly> = [
    { title: '异常类型', dataIndex: 'type', width: 100 },
    {
      title: '严重度',
      dataIndex: 'severity',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
    { title: '表计', dataIndex: 'meterId', width: 110 },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '—'),
    },
    { title: '检出时间', dataIndex: 'detectedAt', width: 160 },
    {
      title: '实测值',
      dataIndex: 'value',
      width: 90,
      render: (v?: number) => (v !== undefined ? numFormat(v) : '—'),
    },
    {
      title: '期望范围',
      dataIndex: 'expectedRange',
      width: 160,
      ellipsis: true,
      render: (v?: string) => v ?? '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: DataAnomaly['status']) => {
        const map: Record<DataAnomaly['status'], { tone: string; label: string }> = {
          open: { tone: 'open', label: '未处理' },
          confirmed: { tone: 'ack', label: '已确认' },
          ignored: { tone: 'idle', label: '已忽略' },
          fixed: { tone: 'done', label: '已修复' },
        }
        return <StatusTag status={map[s].tone} label={map[s].label} />
      },
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          {row.status === 'open' && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                update(row.id, { status: 'confirmed' })
                message.success('已确认异常')
              }}
            >
              确认
            </Button>
          )}
          {row.status !== 'fixed' && row.status !== 'ignored' && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                update(row.id, { status: 'fixed' })
                message.success('已标记修复')
              }}
            >
              修复
            </Button>
          )}
          <CrudActions
            onEdit={() => openEdit(row)}
            onDelete={() => {
              remove(row.id)
              message.success('已删除异常')
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="数据质量"
        subtitle="指标监测与异常闭环 · Demo 数据"
        breadcrumbs={[{ title: '数据中心' }, { title: '数据质量' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建异常
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        {qualityMetrics.map((m) => (
          <Col xs={24} sm={12} md={8} xl={4} key={m.key}>
            <KpiCard
              title={m.label}
              value={m.value}
              unit={m.unit}
              target={m.target}
              extra={<StatusTag status={m.status} />}
            />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="质量趋势" subtitle="近 7 日完整率 / 在线率" height={300}>
          <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="异常清单" subtitle={`共 ${items.length} 条`} height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            expandable={{
              expandedRowRender: (r) => (
                <div style={{ color: '#475569' }}>{r.description}</div>
              ),
            }}
            pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }}
            scroll={{ x: 1300 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑异常' : '新建异常'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={640}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="type" label="异常类型" rules={[{ required: true }]}>
                <Select
                  options={['缺失', '突变', '超限', '零值', '负值', '时序乱序'].map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="severity" label="严重度" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'critical', label: '紧急' },
                    { value: 'major', label: '重要' },
                    { value: 'warning', label: '预警' },
                    { value: 'minor', label: '次要' },
                    { value: 'info', label: '提示' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="meterId" label="表计" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enterpriseId" label="企业">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="detectedAt" label="检出时间" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'open', label: '未处理' },
                    { value: 'confirmed', label: '已确认' },
                    { value: 'ignored', label: '已忽略' },
                    { value: 'fixed', label: '已修复' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="实测值">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedRange" label="期望范围">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
