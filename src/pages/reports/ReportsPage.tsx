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
  Tag,
} from 'antd'
import { DownloadOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { reportCategories, reports as seedReports } from '@/mock/reports'
import { numFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { ReportItem } from '@/mock/types'

const STATUS_LABEL: Record<ReportItem['status'], string> = {
  ready: '可下载',
  generating: '生成中',
  failed: '失败',
}

const STATUS_TONE: Record<ReportItem['status'], string> = {
  ready: 'done',
  generating: 'processing',
  failed: 'fault',
}

type ReportFormValues = {
  name: string
  category: string
  period: string
  format: ReportItem['format']
  status: ReportItem['status']
  sizeKb: number
  description: string
  createdAt: string
}

export default function ReportsPage() {
  const { items, create, update, remove } = useCrudList(seedReports, 'rpt')
  const [category, setCategory] = useState<string | undefined>()
  const [preview, setPreview] = useState<ReportItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ReportItem | null>(null)
  const [form] = Form.useForm<ReportFormValues>()

  const data = useMemo(() => {
    if (!category) return items
    return items.filter((r) => r.category === category)
  }, [category, items])

  const ready = items.filter((r) => r.status === 'ready').length

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      category: reportCategories[0] ?? '综合',
      period: new Date().toISOString().slice(0, 7),
      format: 'PDF',
      status: 'ready',
      sizeKb: 100,
      description: '',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    setModalOpen(true)
  }

  const openEdit = (row: ReportItem) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('报告已更新')
    } else {
      create(values)
      message.success('报告已创建')
    }
    setModalOpen(false)
  }

  const exportReport = (row: ReportItem) => {
    downloadCsv(
      `${row.name}.csv`,
      ['字段', '内容'],
      [
        ['报告名称', row.name],
        ['分类', row.category],
        ['周期', row.period],
        ['格式', row.format],
        ['摘要', row.description],
        ['生成时间', row.createdAt],
        ['大小(KB)', row.sizeKb],
      ],
    )
    message.success(`已导出：${row.name}`)
  }

  const columns: ColumnsType<ReportItem> = [
    { title: '报告名称', dataIndex: 'name', ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      width: 110,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    { title: '周期', dataIndex: 'period', width: 110 },
    { title: '格式', dataIndex: 'format', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: ReportItem['status']) => (
        <StatusTag status={STATUS_TONE[s]} label={STATUS_LABEL[s]} />
      ),
    },
    {
      title: '大小',
      dataIndex: 'sizeKb',
      width: 90,
      render: (v: number) => (v > 0 ? `${numFormat(v / 1024, { digits: 1 })} MB` : '—'),
    },
    { title: '生成时间', dataIndex: 'createdAt', width: 160 },
    {
      title: '操作',
      width: 240,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setPreview(row)}>
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            disabled={row.status !== 'ready'}
            onClick={() => exportReport(row)}
          >
            导出
          </Button>
          <CrudActions onEdit={() => openEdit(row)} onDelete={() => {
            remove(row.id)
            if (preview?.id === row.id) setPreview(null)
            message.success('已删除报告')
          }} />
        </Space>
      ),
    },
  ]

  const previewRows = [
    { key: '1', item: '园区名称', value: '绿港智造产业园' },
    { key: '2', item: '报告周期', value: preview?.period ?? '—' },
    { key: '3', item: '报告分类', value: preview?.category ?? '—' },
    { key: '4', item: '摘要', value: preview?.description ?? '—' },
    { key: '5', item: '格式', value: preview?.format ?? '—' },
  ]

  return (
    <div>
      <PageHeader
        title="报表中心"
        subtitle={`共 ${items.length} 份报告 · 可下载 ${ready} 份`}
        breadcrumbs={[{ title: '报告中心' }, { title: '报表列表' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="报告总数" value={items.length} unit="份" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="可下载" value={ready} unit="份" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="生成中"
            value={items.filter((r) => r.status === 'generating').length}
            unit="份"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="失败"
            value={items.filter((r) => r.status === 'failed').length}
            unit="份"
          />
        </Col>
      </Row>

      <Form layout="inline" style={{ marginTop: 16, marginBottom: 12 }}>
        <Form.Item label="分类">
          <Select
            allowClear
            style={{ width: 160 }}
            placeholder="全部分类"
            value={category}
            onChange={setCategory}
            options={reportCategories.map((c) => ({ value: c, label: c }))}
          />
        </Form.Item>
      </Form>

      <ChartCard title="报告目录" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1200 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑报告' : '新建报告'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={640}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name="name" label="报告名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select options={reportCategories.map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="period" label="周期" rules={[{ required: true }]}>
                <Input placeholder="如 2026-03" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="format" label="格式" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'PDF', label: 'PDF' },
                    { value: 'Excel', label: 'Excel' },
                    { value: 'Word', label: 'Word' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'ready', label: '可下载' },
                    { value: 'generating', label: '生成中' },
                    { value: 'failed', label: '失败' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sizeKb" label="大小(KB)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="createdAt" label="生成时间" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="摘要" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={preview?.name ?? '报告预览'}
        open={!!preview}
        onCancel={() => setPreview(null)}
        footer={[
          <Button key="close" onClick={() => setPreview(null)}>
            关闭
          </Button>,
          <Button
            key="export"
            type="primary"
            disabled={preview?.status !== 'ready'}
            onClick={() => {
              if (preview) exportReport(preview)
              setPreview(null)
            }}
          >
            导出
          </Button>,
        ]}
        width={640}
      >
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          columns={[
            { title: '字段', dataIndex: 'item', width: 140 },
            { title: '内容', dataIndex: 'value' },
          ]}
          dataSource={previewRows}
        />
      </Modal>
    </div>
  )
}
