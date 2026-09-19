import { useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Steps,
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
import { workflows as seedWorkflows } from '@/mock/system'
import type { ColumnsType } from 'antd/es/table'
import type { WorkflowDef } from '@/mock/types'

type WorkflowFormValues = {
  name: string
  code: string
  category: string
  stepsText: string
  status: WorkflowDef['status']
}

export default function WorkflowsPage() {
  const { items, create, update, remove } = useCrudList(seedWorkflows, 'wf')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<WorkflowDef | null>(null)
  const [form] = Form.useForm<WorkflowFormValues>()

  const enabled = items.filter((w) => w.status === 'enabled').length

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      code: '',
      category: '审批',
      stepsText: '发起,审核,归档',
      status: 'enabled',
    })
    setModalOpen(true)
  }

  const openEdit = (row: WorkflowDef) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      code: row.code,
      category: row.category,
      stepsText: row.steps.join(','),
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const steps = values.stepsText
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (editing) {
      update(editing.id, {
        name: values.name,
        code: values.code,
        category: values.category,
        steps,
        status: values.status,
      })
      message.success('流程已更新')
    } else {
      create({
        name: values.name,
        code: values.code,
        category: values.category,
        steps,
        status: values.status,
      })
      message.success('流程已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<WorkflowDef> = [
    { title: '流程名称', dataIndex: 'name', width: 180 },
    { title: '编码', dataIndex: 'code', width: 140 },
    {
      title: '分类',
      dataIndex: 'category',
      width: 110,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: '步骤数',
      dataIndex: 'steps',
      width: 80,
      render: (s: string[]) => s.length,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: WorkflowDef['status']) => (
        <StatusTag
          status={s === 'enabled' ? 'active' : 'disabled'}
          label={s === 'enabled' ? '启用' : '停用'}
        />
      ),
    },
    {
      title: '操作',
      width: 140,
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            message.success('已删除流程')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="流程配置"
        subtitle={`共 ${items.length} 条流程 · 启用 ${enabled} 条`}
        breadcrumbs={[{ title: '系统管理' }, { title: '流程配置' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="流程总数" value={items.length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="已启用" value={enabled} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="已停用" value={items.length - enabled} unit="条" />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="流程清单" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            pagination={false}
            expandable={{
              expandedRowRender: (r) => (
                <Steps
                  size="small"
                  current={r.steps.length}
                  items={r.steps.map((s) => ({ title: s }))}
                  style={{ padding: '8px 16px' }}
                />
              ),
            }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑流程' : '新建流程'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={560}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'enabled', label: '启用' },
                { value: 'disabled', label: '停用' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="stepsText"
            label="步骤（逗号分隔）"
            rules={[{ required: true, message: '请输入步骤' }]}
          >
            <Input.TextArea rows={2} placeholder="如 发起,审核,归档" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
