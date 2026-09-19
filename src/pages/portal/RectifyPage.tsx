import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { usePortal } from '@/context/PortalContext'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import type { ColumnsType } from 'antd/es/table'
import type { Rectification } from '@/mock/types'

const STATUS_LABEL: Record<Rectification['status'], string> = {
  open: '待整改',
  rectifying: '整改中',
  pending_review: '待复核',
  closed: '已关闭',
}

const STATUS_TONE: Record<Rectification['status'], string> = {
  open: 'open',
  rectifying: 'processing',
  pending_review: 'ack',
  closed: 'closed',
}

type RectifyForm = {
  response?: string
  evidenceNote?: string
}

export default function RectifyPage() {
  const {
    rectifications,
    createRectify,
    updateRectify,
    deleteRectify,
    saveRectifyDraft,
    advanceRectify,
  } = usePortal()

  const [open, setOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [metaOpen, setMetaOpen] = useState(false)
  const [form] = Form.useForm<RectifyForm>()
  const [createForm] = Form.useForm()
  const [metaForm] = Form.useForm()

  const current = useMemo(
    () => (currentId ? rectifications.find((r) => r.id === currentId) ?? null : null),
    [rectifications, currentId],
  )

  const canEdit = current?.status === 'open' || current?.status === 'rectifying'

  useEffect(() => {
    if (!current) return
    form.setFieldsValue({
      response: current.response,
      evidenceNote: current.evidenceNote,
    })
  }, [current, form])

  const openCount = useMemo(
    () => rectifications.filter((r) => r.status === 'open' || r.status === 'rectifying').length,
    [rectifications],
  )
  const closed = useMemo(
    () => rectifications.filter((r) => r.status === 'closed').length,
    [rectifications],
  )
  const pendingReview = useMemo(
    () => rectifications.filter((r) => r.status === 'pending_review').length,
    [rectifications],
  )

  const openDrawer = (row: Rectification) => {
    setCurrentId(row.id)
    setOpen(true)
  }

  const onSave = async () => {
    if (!current) return
    const values = await form.validateFields()
    saveRectifyDraft(current.id, values)
    message.success('已保存整改说明')
  }

  const onAdvance = async () => {
    if (!current) return
    if (current.status === 'open') {
      const values = form.getFieldsValue()
      const ok = advanceRectify(current.id, values)
      if (ok) message.success('已开始整改')
      return
    }
    if (current.status === 'rectifying') {
      const values = await form.validateFields()
      if (!values.response?.trim()) {
        message.warning('请填写整改措施说明后再提交复核')
        return
      }
      const ok = advanceRectify(current.id, values)
      if (ok) message.success('已提交复核')
      else message.warning('提交失败，请完善整改说明')
      return
    }
    if (current.status === 'pending_review') {
      const ok = advanceRectify(current.id)
      if (ok) message.success('整改已关闭')
    }
  }

  const onCreateOk = async () => {
    const values = await createForm.validateFields()
    const item = createRectify({
      enterpriseId: values.enterpriseId,
      title: values.title,
      source: values.source,
      description: values.description,
      assignee: values.assignee,
      deadline: values.deadline.format('YYYY-MM-DD'),
    })
    setCreateOpen(false)
    createForm.resetFields()
    message.success('已新建整改任务')
    openDrawer(item)
  }

  const onMetaOk = async () => {
    if (!current) return
    const values = await metaForm.validateFields()
    updateRectify(current.id, {
      title: values.title,
      source: values.source,
      description: values.description,
      assignee: values.assignee,
      deadline: values.deadline.format('YYYY-MM-DD'),
    })
    setMetaOpen(false)
    message.success('已更新整改任务')
  }

  const columns: ColumnsType<Rectification> = [
    { title: '整改标题', dataIndex: 'title', ellipsis: true },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id: string) => enterprisesById[id]?.shortName ?? id,
    },
    { title: '来源', dataIndex: 'source', width: 120 },
    { title: '负责人', dataIndex: 'assignee', width: 90 },
    { title: '截止日期', dataIndex: 'deadline', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: Rectification['status']) => (
        <StatusTag status={STATUS_TONE[s]} label={STATUS_LABEL[s]} />
      ),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          <Button type="link" size="small" onClick={() => openDrawer(row)}>
            {row.status === 'closed' || row.status === 'pending_review' ? '查看' : '填写'}
          </Button>
          {row.status !== 'closed' && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setCurrentId(row.id)
                metaForm.setFieldsValue({
                  title: row.title,
                  source: row.source,
                  description: row.description,
                  assignee: row.assignee,
                  deadline: dayjs(row.deadline),
                })
                setMetaOpen(true)
              }}
            >
              编辑
            </Button>
          )}
          {row.status !== 'closed' && (
            <Popconfirm
              title="确认删除该整改任务？"
              onConfirm={() => {
                deleteRectify(row.id)
                if (currentId === row.id) setOpen(false)
                message.success('已删除')
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const actionLabel =
    current?.status === 'open'
      ? '开始整改'
      : current?.status === 'rectifying'
        ? '提交复核'
        : current?.status === 'pending_review'
          ? '关闭任务'
          : null

  return (
    <div>
      <PageHeader
        title="整改任务"
        subtitle={`共 ${rectifications.length} 项`}
        breadcrumbs={[{ title: '企业门户' }, { title: '整改任务' }]}
        extra={
          <Button
            type="primary"
            onClick={() => {
              createForm.setFieldsValue({
                source: '数据质量稽核',
                deadline: dayjs().add(7, 'day'),
              })
              setCreateOpen(true)
            }}
          >
            新建整改
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="整改总数" value={rectifications.length} unit="项" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="进行中" value={openCount} unit="项" trend="flat" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="待复核" value={pendingReview} unit="项" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已关闭" value={closed} unit="项" />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="整改清单" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={rectifications}
            expandable={{
              expandedRowRender: (r) => (
                <div style={{ color: '#475569' }}>{r.description}</div>
              ),
            }}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </ChartCard>
      </div>

      <Drawer
        title={current?.title ?? '整改详情'}
        width={520}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
        extra={
          current && current.status !== 'closed' ? (
            <Space>
              {canEdit && <Button onClick={onSave}>存草稿</Button>}
              {actionLabel && (
                <Button type="primary" onClick={onAdvance}>
                  {actionLabel}
                </Button>
              )}
            </Space>
          ) : null
        }
      >
        {current && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="企业">
                {enterprisesById[current.enterpriseId]?.shortName ?? current.enterpriseId}
              </Descriptions.Item>
              <Descriptions.Item label="来源">{current.source}</Descriptions.Item>
              <Descriptions.Item label="负责人">{current.assignee}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{current.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag
                  status={STATUS_TONE[current.status]}
                  label={STATUS_LABEL[current.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="问题描述">{current.description}</Descriptions.Item>
              {current.completedAt && (
                <Descriptions.Item label="完成时间">{current.completedAt}</Descriptions.Item>
              )}
            </Descriptions>

            {canEdit ? (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="response"
                  label="整改措施说明"
                  rules={
                    current.status === 'rectifying'
                      ? [{ required: true, message: '请填写整改措施' }]
                      : undefined
                  }
                >
                  <Input.TextArea rows={5} placeholder="说明原因、处理措施、完成情况" />
                </Form.Item>
                <Form.Item name="evidenceNote" label="佐证材料说明">
                  <Input.TextArea rows={3} placeholder="如：监测月报、工单号、照片说明等" />
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="整改措施">
                  {current.response || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="佐证材料">
                  {current.evidenceNote || '—'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </>
        )}
      </Drawer>

      <Modal
        title="新建整改任务"
        open={createOpen}
        onOk={onCreateOk}
        onCancel={() => setCreateOpen(false)}
        destroyOnHidden
        okText="创建"
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true }]}>
            <Input placeholder="如：填报审核驳回" />
          </Form.Item>
          <Form.Item name="description" label="问题描述" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="assignee" label="负责人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑整改任务"
        open={metaOpen}
        onOk={onMetaOk}
        onCancel={() => setMetaOpen(false)}
        destroyOnHidden
      >
        <Form form={metaForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="问题描述" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="assignee" label="负责人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
