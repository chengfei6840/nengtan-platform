import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { auditLogs as seedLogs } from '@/mock/system'
import type { ColumnsType } from 'antd/es/table'
import type { AuditLog } from '@/mock/types'

type AuditFormValues = {
  userName: string
  userId: string
  action: string
  module: string
  target: string
  ip: string
  at: string
  result: AuditLog['result']
  detail?: string
}

export default function AuditPage() {
  const { items, create, update, remove } = useCrudList(seedLogs, 'audit')
  const [moduleFilter, setModuleFilter] = useState<string | undefined>()
  const [resultFilter, setResultFilter] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AuditLog | null>(null)
  const [form] = Form.useForm<AuditFormValues>()

  const modules = useMemo(() => Array.from(new Set(items.map((l) => l.module))), [items])

  const data = useMemo(() => {
    return items.filter((l) => {
      if (moduleFilter && l.module !== moduleFilter) return false
      if (resultFilter && l.result !== resultFilter) return false
      return true
    })
  }, [items, moduleFilter, resultFilter])

  const failCount = items.filter((l) => l.result === 'fail').length

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      userName: '',
      userId: 'u-demo',
      action: '',
      module: '系统',
      target: '',
      ip: '127.0.0.1',
      at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      result: 'success',
      detail: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: AuditLog) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('审计记录已更新')
    } else {
      create(values)
      message.success('审计记录已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<AuditLog> = [
    { title: '时间', dataIndex: 'at', width: 160 },
    { title: '用户', dataIndex: 'userName', width: 100 },
    { title: '操作', dataIndex: 'action', width: 140 },
    {
      title: '模块',
      dataIndex: 'module',
      width: 110,
      render: (m: string) => <Tag>{m}</Tag>,
    },
    { title: '对象', dataIndex: 'target', width: 140, ellipsis: true },
    { title: 'IP', dataIndex: 'ip', width: 120 },
    {
      title: '结果',
      dataIndex: 'result',
      width: 90,
      render: (r: AuditLog['result']) => (
        <StatusTag
          status={r === 'success' ? 'done' : 'fault'}
          label={r === 'success' ? '成功' : '失败'}
        />
      ),
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            message.success('已删除审计记录')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="日志审计"
        subtitle={`共 ${items.length} 条审计记录`}
        breadcrumbs={[{ title: '系统管理' }, { title: '日志审计' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="审计条数" value={items.length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="成功" value={items.length - failCount} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="失败" value={failCount} unit="条" />
        </Col>
      </Row>

      <Form layout="inline" style={{ marginTop: 16, marginBottom: 12, rowGap: 12 }}>
        <Form.Item label="模块">
          <Select
            allowClear
            style={{ width: 140 }}
            placeholder="全部模块"
            value={moduleFilter}
            onChange={setModuleFilter}
            options={modules.map((m) => ({ value: m, label: m }))}
          />
        </Form.Item>
        <Form.Item label="结果">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部"
            value={resultFilter}
            onChange={setResultFilter}
            options={[
              { value: 'success', label: '成功' },
              { value: 'fail', label: '失败' },
            ]}
          />
        </Form.Item>
      </Form>

      <ChartCard title="审计日志" subtitle={`筛选后 ${data.length} 条`} height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          expandable={{
            expandedRowRender: (r) =>
              r.detail ? (
                <div style={{ color: '#475569' }}>详情：{r.detail}</div>
              ) : (
                <div style={{ color: '#94a3b8' }}>无额外详情</div>
              ),
          }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1140 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑审计记录' : '新建审计记录'}
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
              <Form.Item name="userName" label="用户" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userId" label="用户ID" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="action" label="操作" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="module" label="模块" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target" label="对象" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ip" label="IP" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="at" label="时间" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="result" label="结果" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'success', label: '成功' },
                    { value: 'fail', label: '失败' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="detail" label="详情">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
