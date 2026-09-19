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
import { energyPlans } from '@/mock/energy'
import { enterprises, enterprisesById } from '@/mock/enterprises'
import { emissionFormat, energyFormat, numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { EnergyPlan } from '@/mock/types'

type PlanFormValues = {
  name: string
  year: number
  enterpriseId?: string
  targetTce: number
  actualTce: number
  targetEmission: number
  actualEmission: number
  progress: number
  status: EnergyPlan['status']
}

const STATUS_OPTIONS: { value: EnergyPlan['status']; label: string }[] = [
  { value: 'on_track', label: '正常' },
  { value: 'at_risk', label: '风险' },
  { value: 'over', label: '超标' },
]

export default function PlanPage() {
  const { items, create, update, remove } = useCrudList(energyPlans, 'plan')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EnergyPlan | null>(null)
  const [form] = Form.useForm<PlanFormValues>()

  const parkPlan = items.find((p) => !p.enterpriseId)
  const entPlans = items.filter((p) => p.enterpriseId)

  const avgProgress = items.reduce((s, p) => s + p.progress, 0) / (items.length || 1)
  const atRiskCount = items.filter((p) => p.status !== 'on_track').length
  const completionRate = parkPlan
    ? (parkPlan.actualTce / parkPlan.targetTce) * 100
    : avgProgress

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      year: new Date().getFullYear(),
      enterpriseId: undefined,
      targetTce: 0,
      actualTce: 0,
      targetEmission: 0,
      actualEmission: 0,
      progress: 0,
      status: 'on_track',
    })
    setModalOpen(true)
  }

  const openEdit = (row: EnergyPlan) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      year: row.year,
      enterpriseId: row.enterpriseId,
      targetTce: row.targetTce,
      actualTce: row.actualTce,
      targetEmission: row.targetEmission,
      actualEmission: row.actualEmission,
      progress: row.progress,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      enterpriseId: values.enterpriseId || undefined,
    }
    if (editing) {
      update(editing.id, payload)
      message.success('计划已更新')
    } else {
      create(payload)
      message.success('计划已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<EnergyPlan> = useMemo(
    () => [
      { title: '计划名称', dataIndex: 'name', ellipsis: true },
      { title: '年度', dataIndex: 'year', width: 72 },
      {
        title: '对象',
        width: 140,
        render: (_, row) =>
          row.enterpriseId
            ? enterprisesById[row.enterpriseId]?.shortName ?? row.enterpriseId
            : '园区整体',
      },
      {
        title: '能耗目标',
        dataIndex: 'targetTce',
        width: 110,
        render: (v: number) => energyFormat(v, { unit: 'tce' }),
      },
      {
        title: '实际能耗',
        dataIndex: 'actualTce',
        width: 110,
        render: (v: number) => energyFormat(v, { unit: 'tce' }),
      },
      {
        title: '排放目标',
        dataIndex: 'targetEmission',
        width: 120,
        render: (v: number) => emissionFormat(v),
      },
      {
        title: '实际排放',
        dataIndex: 'actualEmission',
        width: 120,
        render: (v: number) => emissionFormat(v),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        width: 180,
        render: (v: number, row) => (
          <Progress
            percent={v}
            size="small"
            status={
              row.status === 'over' ? 'exception' : row.status === 'at_risk' ? 'active' : 'normal'
            }
            format={(p) => percentFormat(p ?? 0)}
          />
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: (s: EnergyPlan['status']) => <StatusTag status={s} />,
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
              message.success('已删除计划')
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
        title="计划与指标"
        subtitle="2026 年度双控目标进度跟踪"
        breadcrumbs={[{ title: '能源管理' }, { title: '计划与指标' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="园区能耗完成率"
            value={numFormat(completionRate, { digits: 1 })}
            unit="%"
            target={25}
            trend="up"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="园区能耗目标"
            value={numFormat(parkPlan?.targetTce ?? 0, { digits: 0 })}
            unit="tce"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="累计实际能耗"
            value={numFormat(parkPlan?.actualTce ?? 0, { digits: 1 })}
            unit="tce"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="风险计划数"
            value={atRiskCount}
            unit="项"
            trend={atRiskCount > 0 ? 'up' : 'flat'}
          />
        </Col>
      </Row>

      {parkPlan && (
        <div style={{ marginTop: 16 }}>
          <ChartCard title="园区双控进度" subtitle={parkPlan.name} height="auto">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>能耗进度</div>
                <Progress
                  percent={parkPlan.progress}
                  strokeColor="#0d9488"
                  format={(p) =>
                    `${percentFormat(p ?? 0)}（${numFormat(parkPlan.actualTce, { digits: 1 })} / ${numFormat(parkPlan.targetTce, { digits: 0 })} tce）`
                  }
                />
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 8 }}>碳排放进度</div>
                <Progress
                  percent={+((parkPlan.actualEmission / parkPlan.targetEmission) * 100).toFixed(1)}
                  strokeColor="#0891b2"
                  format={(p) =>
                    `${percentFormat(p ?? 0)}（${emissionFormat(parkPlan.actualEmission)} / ${emissionFormat(parkPlan.targetEmission)}）`
                  }
                />
              </Col>
            </Row>
          </ChartCard>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <ChartCard
          title="计划清单"
          subtitle={`共 ${items.length} 项 · 企业计划 ${entPlans.length} 项 · 平均进度 ${percentFormat(avgProgress)}`}
          height="auto"
        >
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑能源计划' : '新建能源计划'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="计划名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="year"
              label="年度"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <InputNumber style={{ width: '100%' }} min={2020} max={2100} />
            </Form.Item>
            <Form.Item name="enterpriseId" label="对象企业" style={{ marginBottom: 0, minWidth: 200 }}>
              <Select
                allowClear
                placeholder="留空=园区整体"
                options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="targetTce"
              label="能耗目标(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="actualTce"
              label="实际能耗(tce)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="targetEmission"
              label="排放目标"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="actualEmission"
              label="实际排放"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
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
        </Form>
      </Modal>
    </div>
  )
}
