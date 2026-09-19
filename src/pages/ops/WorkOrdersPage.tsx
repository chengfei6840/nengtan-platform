import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useOps } from '@/context/OpsContext'
import { enterprisesById, enterprises } from '@/mock/enterprises'
import type { ColumnsType } from 'antd/es/table'
import type { WorkOrder, WorkOrderStatus } from '@/mock/types'

const PRIORITY_LABEL: Record<WorkOrder['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const NEXT_STATUS: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  pending: 'assigned',
  assigned: 'processing',
  processing: 'done',
}

const NEXT_LABEL: Partial<Record<WorkOrderStatus, string>> = {
  pending: '派工',
  assigned: '开始处理',
  processing: '完成',
}

type OrderFormValues = {
  title: string
  type: WorkOrder['type']
  priority: WorkOrder['priority']
  assignee: string
  creator: string
  description: string
  dueAt: string
  enterpriseId?: string
  status: WorkOrder['status']
}

export default function WorkOrdersPage() {
  const {
    workOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    updateOrderStatus,
  } = useOps()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<WorkOrder | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<WorkOrder | null>(null)
  const [form] = Form.useForm<OrderFormValues>()

  const data = useMemo(() => {
    return workOrders.filter((w) => {
      if (statusFilter && w.status !== statusFilter) return false
      return true
    })
  }, [workOrders, statusFilter])

  const kpis = useMemo(() => {
    return {
      open: workOrders.filter((w) => w.status !== 'done' && w.status !== 'cancelled').length,
      processing: workOrders.filter((w) => w.status === 'processing').length,
      pending: workOrders.filter((w) => w.status === 'pending').length,
      done: workOrders.filter((w) => w.status === 'done').length,
    }
  }, [workOrders])

  const openCreate = () => {
    setEditing(null)
    const today = new Date().toISOString().slice(0, 10)
    form.setFieldsValue({
      title: '',
      type: '巡检',
      priority: 'medium',
      assignee: '运维值班',
      creator: '系统管理员',
      description: '',
      dueAt: `${today} 18:00:00`,
      enterpriseId: undefined,
      status: 'pending',
    })
    setModalOpen(true)
  }

  const openEdit = (row: WorkOrder) => {
    setEditing(row)
    form.setFieldsValue({
      title: row.title,
      type: row.type,
      priority: row.priority,
      assignee: row.assignee,
      creator: row.creator,
      description: row.description,
      dueAt: row.dueAt,
      enterpriseId: row.enterpriseId,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateWorkOrder(editing.id, {
        title: values.title,
        type: values.type,
        priority: values.priority,
        assignee: values.assignee,
        creator: values.creator,
        description: values.description,
        dueAt: values.dueAt,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
      })
      message.success('工单已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) => (prev ? { ...prev, ...values, enterpriseId: values.enterpriseId || undefined } : prev))
      }
    } else {
      createWorkOrder({
        title: values.title,
        type: values.type,
        priority: values.priority,
        assignee: values.assignee,
        creator: values.creator,
        description: values.description,
        dueAt: values.dueAt,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
      })
      message.success('工单已创建')
    }
    setModalOpen(false)
  }

  const onAdvance = (row: WorkOrder) => {
    const next = NEXT_STATUS[row.status]
    if (!next) return
    updateOrderStatus(row.id, next)
    message.success(`工单状态已更新为：${NEXT_LABEL[row.status]}`)
  }

  const onCancel = (id: string) => {
    updateOrderStatus(id, 'cancelled')
    message.success('工单已取消')
  }

  const columns: ColumnsType<WorkOrder> = [
    {
      title: '工单标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (v, row) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => {
            setSelected(row)
            setOpen(true)
          }}
        >
          {v}
        </Button>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (v?: string) => v ?? '—',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      render: (p: WorkOrder['priority']) => (
        <StatusTag
          status={p === 'high' ? 'critical' : p === 'medium' ? 'warning' : 'info'}
          label={PRIORITY_LABEL[p]}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: WorkOrderStatus) => <StatusTag status={s} />,
    },
    { title: '负责人', dataIndex: 'assignee', width: 100 },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100,
      render: (v?: string) => v ?? '—',
    },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '—'),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 160 },
    { title: '截止时间', dataIndex: 'dueAt', width: 160 },
    {
      title: '操作',
      width: 260,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          {NEXT_STATUS[row.status] && (
            <Button type="link" size="small" onClick={() => onAdvance(row)}>
              {NEXT_LABEL[row.status]}
            </Button>
          )}
          {row.status !== 'done' && row.status !== 'cancelled' && (
            <Button type="link" size="small" danger onClick={() => onCancel(row.id)}>
              取消
            </Button>
          )}
          <CrudActions
            onView={() => {
              setSelected(row)
              setOpen(true)
            }}
            onEdit={() => openEdit(row)}
            onDelete={() => {
              deleteWorkOrder(row.id)
              if (selected?.id === row.id) {
                setOpen(false)
                setSelected(null)
              }
              message.success('已删除工单')
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="运维工单"
        subtitle={`共 ${workOrders.length} 单 · 筛选后 ${data.length} 单`}
        breadcrumbs={[{ title: '运维管理' }, { title: '运维工单' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="未闭环" value={kpis.open} unit="单" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="待派工" value={kpis.pending} unit="单" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="处理中" value={kpis.processing} unit="单" trend="up" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已完成" value={kpis.done} unit="单" />
        </Col>
      </Row>

      <Form layout="inline" style={{ marginTop: 16, marginBottom: 12, rowGap: 12 }}>
        <Form.Item label="状态">
          <Select
            allowClear
            style={{ width: 140 }}
            placeholder="全部状态"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: '待处理' },
              { value: 'assigned', label: '已派工' },
              { value: 'processing', label: '处理中' },
              { value: 'done', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
        </Form.Item>
      </Form>

      <ChartCard title="工单列表" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1400 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑工单' : '新建工单'}
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
              <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '巡检', label: '巡检' },
                    { value: '维修', label: '维修' },
                    { value: '校准', label: '校准' },
                    { value: '改造', label: '改造' },
                    { value: '应急', label: '应急' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'high', label: '高' },
                    { value: 'medium', label: '中' },
                    { value: 'low', label: '低' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'pending', label: '待处理' },
                    { value: 'assigned', label: '已派工' },
                    { value: 'processing', label: '处理中' },
                    { value: 'done', label: '已完成' },
                    { value: 'cancelled', label: '已取消' },
                  ]}
                />
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
              <Form.Item name="assignee" label="负责人" rules={[{ required: true, message: '请输入负责人' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="creator" label="创建人" rules={[{ required: true, message: '请输入创建人' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueAt" label="截止时间" rules={[{ required: true, message: '请输入截止时间' }]}>
                <Input placeholder="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selected?.title ?? '工单详情'}
        open={open}
        onClose={() => setOpen(false)}
        width={480}
        destroyOnHidden
      >
        {selected && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="工单号">{selected.id}</Descriptions.Item>
            <Descriptions.Item label="类型">{selected.type ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="优先级">
              {PRIORITY_LABEL[selected.priority]}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={selected.status} />
            </Descriptions.Item>
            <Descriptions.Item label="负责人">{selected.assignee}</Descriptions.Item>
            <Descriptions.Item label="创建人">{selected.creator ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="关联告警">{selected.alarmId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="企业">
              {selected.enterpriseId
                ? enterprisesById[selected.enterpriseId]?.name ?? selected.enterpriseId
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="设备">{selected.deviceId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="表计">{selected.meterId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selected.createdAt}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{selected.dueAt}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{selected.completedAt ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="描述">{selected.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
