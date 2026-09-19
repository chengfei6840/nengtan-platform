import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { parkOverview } from '@/mock/park'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import { retrofitProjects } from '@/mock/projects'
import { emissionFormat, energyFormat, moneyFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { ProjectStatus, RetrofitProject, ZoneId } from '@/mock/types'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: '策划中',
  approving: '审批中',
  implementing: '实施中',
  verifying: '核证中',
  completed: '已完成',
  cancelled: '已取消',
}

const STATUS_TONE: Record<ProjectStatus, string> = {
  planning: 'pending',
  approving: 'warning',
  implementing: 'processing',
  verifying: 'ack',
  completed: 'done',
  cancelled: 'cancelled',
}

type ProjectFormValues = {
  name: string
  category: string
  enterpriseId?: string
  zoneId?: ZoneId
  investWan: number
  expectedSavingTce: number
  expectedEmissionCut: number
  paybackYears: number
  progress: number
  status: ProjectStatus
  startDate: string
  endDate?: string
  description: string
}

export default function ProjectsPage() {
  const { items, create, update, remove } = useCrudList(retrofitProjects, 'prj')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RetrofitProject | null>(null)
  const [form] = Form.useForm<ProjectFormValues>()

  const implementing = items.filter((p) => p.status === 'implementing').length
  const completed = items.filter((p) => p.status === 'completed').length
  const invest = items.reduce((s, p) => s + p.investWan, 0)
  const saving = items.reduce((s, p) => s + p.expectedSavingTce, 0)

  const categories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category))),
    [items],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      category: categories[0] ?? '空压优化',
      enterpriseId: undefined,
      zoneId: undefined,
      investWan: 0,
      expectedSavingTce: 0,
      expectedEmissionCut: 0,
      paybackYears: 0,
      progress: 0,
      status: 'planning',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: undefined,
      description: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: RetrofitProject) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      category: row.category,
      enterpriseId: row.enterpriseId,
      zoneId: row.zoneId,
      investWan: row.investWan,
      expectedSavingTce: row.expectedSavingTce,
      expectedEmissionCut: row.expectedEmissionCut,
      paybackYears: row.paybackYears,
      progress: row.progress,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      description: row.description,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      enterpriseId: values.enterpriseId || undefined,
      zoneId: values.zoneId || undefined,
      endDate: values.endDate || undefined,
    }
    if (editing) {
      update(editing.id, payload)
      message.success('项目已更新')
    } else {
      create(payload)
      message.success('项目已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<RetrofitProject> = useMemo(
    () => [
      { title: '项目名称', dataIndex: 'name', ellipsis: true },
      { title: '类别', dataIndex: 'category', width: 110 },
      {
        title: '企业',
        dataIndex: 'enterpriseId',
        width: 120,
        render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '园区公共'),
      },
      {
        title: '分区',
        dataIndex: 'zoneId',
        width: 90,
        render: (z?: ZoneId) =>
          z ? parkOverview.zones.find((x) => x.id === z)?.name ?? z : '—',
      },
      {
        title: '投资(万元)',
        dataIndex: 'investWan',
        width: 110,
        render: (v: number) => numFormat(v, { digits: 0 }),
      },
      {
        title: '预期节能量',
        dataIndex: 'expectedSavingTce',
        width: 110,
        render: (v: number) => energyFormat(v, { unit: 'tce' }),
      },
      {
        title: '预期减排',
        dataIndex: 'expectedEmissionCut',
        width: 110,
        render: (v: number) => emissionFormat(v),
      },
      {
        title: '回收期(年)',
        dataIndex: 'paybackYears',
        width: 100,
        render: (v: number) => numFormat(v, { digits: 1 }),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        width: 140,
        render: (v: number) => (
          <Progress percent={v} size="small" status={v >= 100 ? 'success' : 'active'} />
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (s: ProjectStatus) => (
          <StatusTag status={STATUS_TONE[s]} label={STATUS_LABEL[s]} />
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
              message.success('已删除项目')
            }}
          />
        ),
      },
    ],
    [remove],
  )

  return (
    <div>
      <PageHeader
        title="改造项目"
        subtitle={`共 ${items.length} 个项目 · 总投资 ${moneyFormat(invest, { unit: '万元' })}`}
        breadcrumbs={[{ title: '节能服务' }, { title: '改造项目' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="项目总数" value={items.length} unit="个" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="实施中" value={implementing} unit="个" trend="up" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已完成" value={completed} unit="个" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="预期节能量" value={numFormat(saving, { digits: 0 })} unit="tce" />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="项目清单" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            expandable={{
              expandedRowRender: (r) => (
                <div style={{ color: '#475569' }}>
                  {r.description}
                  <span style={{ marginLeft: 16, color: '#94a3b8' }}>
                    {r.startDate}
                    {r.endDate ? ` ~ ${r.endDate}` : ' 起'}
                  </span>
                </div>
              ),
            }}
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑改造项目' : '新建改造项目'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="category"
              label="类别"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <Select
                showSearch
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </Form.Item>
            <Form.Item name="enterpriseId" label="企业" style={{ marginBottom: 0, minWidth: 180 }}>
              <Select
                allowClear
                placeholder="留空=园区公共"
                options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item name="zoneId" label="分区" style={{ marginBottom: 0, minWidth: 140 }}>
              <Select
                allowClear
                placeholder="可选"
                options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <Select
                options={(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => ({
                  value: s,
                  label: STATUS_LABEL[s],
                }))}
              />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="investWan"
              label="投资(万元)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="expectedSavingTce"
              label="预期节能量(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 150 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="expectedEmissionCut"
              label="预期减排"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="paybackYears"
              label="回收期(年)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
            <Form.Item
              name="progress"
              label="进度(%)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={100} />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="endDate" label="结束日期" style={{ marginBottom: 0, minWidth: 160 }}>
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="说明" style={{ marginTop: 16 }}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
