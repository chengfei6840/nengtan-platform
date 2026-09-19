import { useState } from 'react'
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
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { interfaces as seedInterfaces } from '@/mock/system'
import { numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { InterfaceItem } from '@/mock/types'

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

type InterfaceFormValues = {
  name: string
  protocol: string
  endpoint: string
  status: InterfaceItem['status']
  lastSyncAt: string
  latencyMs: number
  successRate: number
  description: string
}

export default function SystemInterfacesPage() {
  const { items, create, update, remove, setItems } = useCrudList(seedInterfaces, 'iface')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InterfaceItem | null>(null)
  const [form] = Form.useForm<InterfaceFormValues>()

  const healthy = items.filter((i) => i.status === 'healthy').length
  const degraded = items.filter((i) => i.status === 'degraded').length
  const down = items.filter((i) => i.status === 'down').length

  const syncOne = (id: string) => {
    setItems((list) =>
      list.map((row) => {
        if (row.id !== id) return row
        const latency = Math.max(20, Math.round((row.latencyMs || 80) * (0.7 + Math.random() * 0.5)))
        return {
          ...row,
          status: 'healthy',
          lastSyncAt: nowStamp(),
          latencyMs: latency,
          successRate: Math.min(100, +(row.successRate + (100 - row.successRate) * 0.3).toFixed(1)),
        }
      }),
    )
  }

  const refreshAll = () => {
    setItems((list) =>
      list.map((row) => ({
        ...row,
        status: row.status === 'down' ? 'degraded' : 'healthy',
        lastSyncAt: nowStamp(),
        latencyMs: Math.max(15, Math.round((row.latencyMs || 60) * (0.8 + Math.random() * 0.4))),
        successRate: Math.min(100, Math.max(row.successRate, 96 + Math.random() * 3)),
      })),
    )
    message.success('已刷新全部接口状态')
  }

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      protocol: 'HTTPS',
      endpoint: '',
      status: 'healthy',
      lastSyncAt: nowStamp(),
      latencyMs: 50,
      successRate: 99,
      description: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: InterfaceItem) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('接口已更新')
    } else {
      create(values)
      message.success('接口已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<InterfaceItem> = [
    { title: '接口名称', dataIndex: 'name', ellipsis: true },
    { title: '协议', dataIndex: 'protocol', width: 120 },
    { title: '端点', dataIndex: 'endpoint', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
    { title: '最近同步', dataIndex: 'lastSyncAt', width: 160 },
    {
      title: '延迟(ms)',
      dataIndex: 'latencyMs',
      width: 100,
      render: (v: number) => (v > 0 ? numFormat(v, { digits: 0 }) : '—'),
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      width: 90,
      render: (v: number) => percentFormat(v),
    },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          <Button
            type="link"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => {
              syncOne(row.id)
              message.success(`已触发同步：${row.name}`)
            }}
          >
            同步
          </Button>
          <CrudActions
            onEdit={() => openEdit(row)}
            onDelete={() => {
              remove(row.id)
              message.success('已删除接口')
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="接口管理"
        subtitle="外部系统接入配置与健康检查 · Demo"
        breadcrumbs={[{ title: '系统管理' }, { title: '接口管理' }]}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button type="primary" onClick={refreshAll}>
              刷新状态
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="接口总数" value={items.length} unit="个" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="正常" value={healthy} unit="个" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="降级" value={degraded} unit="个" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="中断" value={down} unit="个" />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="接口配置" height="auto">
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
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑接口' : '新建接口'}
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
              <Form.Item name="name" label="接口名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="protocol" label="协议" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="endpoint" label="端点" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'healthy', label: '正常' },
                    { value: 'degraded', label: '降级' },
                    { value: 'down', label: '中断' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastSyncAt" label="最近同步" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="latencyMs" label="延迟(ms)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="successRate" label="成功率(%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="说明" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
