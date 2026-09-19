import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import { diagnoses } from '@/mock/projects'
import { emissionFormat, energyFormat, moneyFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { Diagnosis } from '@/mock/types'

const STATUS_LABEL: Record<Diagnosis['status'], string> = {
  draft: '草稿',
  confirmed: '已确认',
  converted: '已转项目',
}

type DiagnosisFormValues = {
  name: string
  enterpriseId: string
  date: string
  potentialSavingTce: number
  potentialSavingCost: number
  potentialEmissionCut: number
  status: Diagnosis['status']
  findingsText: string
}

export default function DiagnosisPage() {
  const { items, create, update, remove } = useCrudList(diagnoses, 'diag')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Diagnosis | null>(null)
  const [form] = Form.useForm<DiagnosisFormValues>()

  const totalSaving = items.reduce((s, d) => s + d.potentialSavingTce, 0)
  const totalCost = items.reduce((s, d) => s + d.potentialSavingCost, 0)
  const totalCut = items.reduce((s, d) => s + d.potentialEmissionCut, 0)
  const converted = items.filter((d) => d.status === 'converted').length

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      enterpriseId: enterprises[0]?.id,
      date: new Date().toISOString().slice(0, 10),
      potentialSavingTce: 0,
      potentialSavingCost: 0,
      potentialEmissionCut: 0,
      status: 'draft',
      findingsText: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: Diagnosis) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      enterpriseId: row.enterpriseId,
      date: row.date,
      potentialSavingTce: row.potentialSavingTce,
      potentialSavingCost: row.potentialSavingCost,
      potentialEmissionCut: row.potentialEmissionCut,
      status: row.status,
      findingsText: row.findings.join('\n'),
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const findings = values.findingsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const payload = {
      name: values.name,
      enterpriseId: values.enterpriseId,
      date: values.date,
      potentialSavingTce: values.potentialSavingTce,
      potentialSavingCost: values.potentialSavingCost,
      potentialEmissionCut: values.potentialEmissionCut,
      status: values.status,
      findings,
    }
    if (editing) {
      update(editing.id, payload)
      message.success('诊断已更新')
    } else {
      create(payload)
      message.success('诊断已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<Diagnosis> = useMemo(
    () => [
      { title: '诊断名称', dataIndex: 'name', ellipsis: true },
      {
        title: '企业',
        dataIndex: 'enterpriseId',
        width: 140,
        render: (id: string) => enterprisesById[id]?.shortName ?? id,
      },
      { title: '诊断日期', dataIndex: 'date', width: 120 },
      {
        title: '潜力节能量',
        dataIndex: 'potentialSavingTce',
        width: 120,
        render: (v: number) => energyFormat(v, { unit: 'tce' }),
      },
      {
        title: '潜力节约成本',
        dataIndex: 'potentialSavingCost',
        width: 130,
        render: (v: number) => moneyFormat(v, { unit: '万元' }),
      },
      {
        title: '潜力减排',
        dataIndex: 'potentialEmissionCut',
        width: 120,
        render: (v: number) => emissionFormat(v),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (s: Diagnosis['status']) => (
          <StatusTag
            status={s === 'converted' ? 'done' : s === 'confirmed' ? 'ack' : 'pending'}
            label={STATUS_LABEL[s]}
          />
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
              message.success('已删除诊断')
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
        title="节能诊断"
        subtitle={`共 ${items.length} 份诊断报告`}
        breadcrumbs={[{ title: '节能服务' }, { title: '节能诊断' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="诊断数量" value={items.length} unit="份" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已转项目" value={converted} unit="份" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="潜力节能量" value={numFormat(totalSaving, { digits: 0 })} unit="tce" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="潜力减排" value={emissionFormat(totalCut)} />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="诊断清单"
          subtitle={`潜力节约成本合计 ${moneyFormat(totalCost, { unit: '万元' })}`}
          height="auto"
        >
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            expandable={{
              expandedRowRender: (record) => (
                <List
                  size="small"
                  header={<Tag color="teal">主要发现</Tag>}
                  dataSource={record.findings}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              ),
            }}
            pagination={false}
            scroll={{ x: 1100 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑节能诊断' : '新建节能诊断'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="诊断名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="enterpriseId"
              label="企业"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 200 }}
            >
              <Select
                options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              name="date"
              label="诊断日期"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <Select
                options={(Object.keys(STATUS_LABEL) as Diagnosis['status'][]).map((s) => ({
                  value: s,
                  label: STATUS_LABEL[s],
                }))}
              />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="potentialSavingTce"
              label="潜力节能量(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="potentialSavingCost"
              label="潜力节约成本(万元)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="potentialEmissionCut"
              label="潜力减排"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item
            name="findingsText"
            label="主要发现（每行一条）"
            style={{ marginTop: 16 }}
          >
            <Input.TextArea rows={4} placeholder="每行一条发现" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
