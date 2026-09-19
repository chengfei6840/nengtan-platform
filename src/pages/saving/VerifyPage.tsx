import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
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
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { retrofitProjects, verificationRecords } from '@/mock/projects'
import { emissionFormat, energyFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { VerificationRecord } from '@/mock/types'

type VerifyFormValues = {
  projectId: string
  period: string
  baselineTce: number
  actualTce: number
  savedTce: number
  savedEmission: number
  method: string
  verifiedBy: string
  verifiedAt: string
  conclusion: string
}

export default function VerifyPage() {
  const { items, create, update, remove } = useCrudList(verificationRecords, 'ver')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<VerificationRecord | null>(null)
  const [form] = Form.useForm<VerifyFormValues>()

  const totalSaved = items.reduce((s, v) => s + v.savedTce, 0)
  const totalEmission = items.reduce((s, v) => s + v.savedEmission, 0)

  const projectName = (id: string) => retrofitProjects.find((p) => p.id === id)?.name ?? id

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      projectId: retrofitProjects[0]?.id,
      period: '',
      baselineTce: 0,
      actualTce: 0,
      savedTce: 0,
      savedEmission: 0,
      method: '',
      verifiedBy: '',
      verifiedAt: new Date().toISOString().slice(0, 10),
      conclusion: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: VerificationRecord) => {
    setEditing(row)
    form.setFieldsValue({
      projectId: row.projectId,
      period: row.period,
      baselineTce: row.baselineTce,
      actualTce: row.actualTce,
      savedTce: row.savedTce,
      savedEmission: row.savedEmission,
      method: row.method,
      verifiedBy: row.verifiedBy,
      verifiedAt: row.verifiedAt,
      conclusion: row.conclusion,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('核证记录已更新')
    } else {
      create(values)
      message.success('核证记录已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<VerificationRecord> = useMemo(
    () => [
      {
        title: '项目',
        dataIndex: 'projectId',
        ellipsis: true,
        render: (id: string) => projectName(id),
      },
      { title: '核证周期', dataIndex: 'period', width: 150 },
      {
        title: '基线(tce)',
        dataIndex: 'baselineTce',
        width: 100,
        render: (v: number) => numFormat(v, { digits: 1 }),
      },
      {
        title: '实际(tce)',
        dataIndex: 'actualTce',
        width: 100,
        render: (v: number) => numFormat(v, { digits: 1 }),
      },
      {
        title: '节能量',
        dataIndex: 'savedTce',
        width: 100,
        render: (v: number) => energyFormat(v, { unit: 'tce' }),
      },
      {
        title: '减排量',
        dataIndex: 'savedEmission',
        width: 110,
        render: (v: number) => emissionFormat(v),
      },
      { title: '方法', dataIndex: 'method', width: 200, ellipsis: true },
      { title: '核证人', dataIndex: 'verifiedBy', width: 140, ellipsis: true },
      { title: '核证日期', dataIndex: 'verifiedAt', width: 120 },
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
              message.success('已删除核证记录')
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
        title="成效评价"
        subtitle={`共 ${items.length} 条核证记录`}
        breadcrumbs={[{ title: '节能服务' }, { title: '成效评价' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="核证记录" value={items.length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="累计核证节能量" value={numFormat(totalSaved, { digits: 1 })} unit="tce" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="累计核证减排" value={emissionFormat(totalEmission)} />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="核证记录" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            expandable={{
              expandedRowRender: (r) => (
                <div style={{ color: '#475569' }}>结论：{r.conclusion}</div>
              ),
            }}
            pagination={false}
            scroll={{ x: 1300 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑核证记录' : '新建核证记录'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="projectId" label="项目" rules={[{ required: true }]}>
            <Select
              options={retrofitProjects.map((p) => ({ value: p.id, label: p.name }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="period"
              label="核证周期"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 200 }}
            >
              <Input placeholder="如 2026-01~2026-02" />
            </Form.Item>
            <Form.Item
              name="verifiedAt"
              label="核证日期"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="baselineTce"
              label="基线(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="actualTce"
              label="实际(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="savedTce"
              label="节能量(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="savedEmission"
              label="减排量"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item
            name="method"
            label="方法"
            rules={[{ required: true }]}
            style={{ marginTop: 16 }}
          >
            <Input />
          </Form.Item>
          <Form.Item name="verifiedBy" label="核证人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="conclusion" label="结论" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
