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
  Table,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { parkOverview } from '@/mock/park'
import { buildingsById, buildings } from '@/mock/buildings'
import { chargerSummary, evChargers as seedChargers } from '@/mock/renewable'
import { energyFormat, numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { EvCharger, ZoneId } from '@/mock/types'

type ChargerFormValues = {
  name: string
  code: string
  powerKw: number
  type: EvCharger['type']
  status: EvCharger['status']
  zoneId: ZoneId
  buildingId?: string
  currentSoc?: number
  sessionKwh?: number
}

export default function ChargerPage() {
  const { items, create, update, remove } = useCrudList(seedChargers, 'chg')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EvCharger | null>(null)
  const [form] = Form.useForm<ChargerFormValues>()

  const data = useMemo(() => {
    return items.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false
      if (typeFilter && c.type !== typeFilter) return false
      return true
    })
  }, [items, statusFilter, typeFilter])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      code: '',
      powerKw: 60,
      type: '快充',
      status: 'idle',
      zoneId: 'zone-east',
      buildingId: undefined,
      currentSoc: undefined,
      sessionKwh: undefined,
    })
    setModalOpen(true)
  }

  const openEdit = (row: EvCharger) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, {
        ...values,
        buildingId: values.buildingId || undefined,
      })
      message.success('充电桩已更新')
    } else {
      create({
        ...values,
        buildingId: values.buildingId || undefined,
      })
      message.success('充电桩已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<EvCharger> = [
    { title: '充电桩', dataIndex: 'name', width: 120 },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '类型', dataIndex: 'type', width: 80 },
    {
      title: '功率(kW)',
      dataIndex: 'powerKw',
      width: 90,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '所在建筑',
      dataIndex: 'buildingId',
      width: 140,
      render: (id?: string) => (id ? buildingsById[id]?.name ?? id : '—'),
    },
    {
      title: '当前SOC',
      dataIndex: 'currentSoc',
      width: 90,
      render: (v?: number) => (v !== undefined ? percentFormat(v) : '—'),
    },
    {
      title: '本次电量',
      dataIndex: 'sessionKwh',
      width: 100,
      render: (v?: number) => (v !== undefined ? energyFormat(v) : '—'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => <StatusTag status={s} />,
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
            message.success('已删除充电桩')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="充电桩"
        subtitle={`共 ${items.length} 枪 · 快充 ${chargerSummary.fast} / 慢充 ${chargerSummary.slow}`}
        breadcrumbs={[{ title: '新能源' }, { title: '充电桩' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="总枪数" value={items.length} unit="枪" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="充电中"
            value={items.filter((c) => c.status === 'charging').length}
            unit="枪"
            trend="up"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="空闲" value={items.filter((c) => c.status === 'idle').length} unit="枪" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="故障"
            value={items.filter((c) => c.status === 'fault').length}
            unit="枪"
            trend="flat"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="离线" value={items.filter((c) => c.status === 'offline').length} unit="枪" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="今日充电量"
            value={numFormat(chargerSummary.todayKwh, { digits: 0 })}
            unit="kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="本月充电量" value={energyFormat(chargerSummary.monthKwh)} />
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
              { value: 'idle', label: '空闲' },
              { value: 'charging', label: '充电中' },
              { value: 'reserved', label: '已预约' },
              { value: 'fault', label: '故障' },
              { value: 'offline', label: '离线' },
            ]}
          />
        </Form.Item>
        <Form.Item label="类型">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '快充', label: '快充' },
              { value: '慢充', label: '慢充' },
            ]}
          />
        </Form.Item>
      </Form>

      <ChartCard title="充电桩清单" subtitle={`筛选后 ${data.length} 枪`} height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1140 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑充电桩' : '新建充电桩'}
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
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '快充', label: '快充' },
                    { value: '慢充', label: '慢充' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="powerKw" label="功率(kW)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
                <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="buildingId" label="所在建筑">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={buildings.map((b) => ({ value: b.id, label: b.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'idle', label: '空闲' },
                    { value: 'charging', label: '充电中' },
                    { value: 'reserved', label: '已预约' },
                    { value: 'fault', label: '故障' },
                    { value: 'offline', label: '离线' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentSoc" label="当前SOC(%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sessionKwh" label="本次电量(kWh)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
