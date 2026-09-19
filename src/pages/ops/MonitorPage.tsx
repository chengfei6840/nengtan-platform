import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tag,
} from 'antd'
import { Link } from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useDemo } from '@/context/DemoContext'
import { useArchive } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { enterprisesById } from '@/mock/enterprises'
import { numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { Device, DeviceStatus, DeviceType, ZoneId } from '@/mock/types'

const DEVICE_TYPES: DeviceType[] = [
  '变压器',
  '空压机',
  '锅炉',
  '冷机',
  '水泵',
  '风机',
  '配电柜',
  '热交换器',
  '冷却塔',
  '充电桩',
]

type DeviceFormValues = {
  name: string
  code: string
  type: DeviceType
  zoneId: ZoneId
  enterpriseId?: string
  status: DeviceStatus
  ratedPower: number
}

export default function MonitorPage() {
  const { zoneId: globalZone } = useDemo()
  const { devices, createDevice, updateDevice, deleteDevice } = useArchive()
  const [zoneFilter, setZoneFilter] = useState<string | 'all'>(globalZone)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<Device | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Device | null>(null)
  const [form] = Form.useForm<DeviceFormValues>()

  const data = useMemo(() => {
    return devices.filter((d) => {
      if (zoneFilter !== 'all' && d.zoneId !== zoneFilter) return false
      if (statusFilter && d.status !== statusFilter) return false
      return true
    })
  }, [devices, zoneFilter, statusFilter])

  const kpis = useMemo(() => {
    const running = data.filter((d) => d.status === 'running').length
    const idle = data.filter((d) => d.status === 'idle').length
    const fault = data.filter((d) => d.status === 'fault').length
    const maintenance = data.filter((d) => d.status === 'maintenance').length
    return {
      total: data.length,
      running,
      idle,
      fault,
      maintenance,
      runRate: data.length ? (running / data.length) * 100 : 0,
    }
  }, [data])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      code: '',
      type: '变压器',
      zoneId: (globalZone === 'all' ? 'zone-east' : globalZone) as ZoneId,
      enterpriseId: undefined,
      status: 'running',
      ratedPower: 100,
    })
    setModalOpen(true)
  }

  const openEdit = (row: Device) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      code: row.code,
      type: row.type,
      zoneId: row.zoneId,
      enterpriseId: row.enterpriseId,
      status: row.status,
      ratedPower: row.ratedPower,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateDevice(editing.id, values)
      message.success('设备已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) => (prev ? { ...prev, ...values } : prev))
      }
    } else {
      const today = new Date().toISOString().slice(0, 10)
      createDevice({
        id: `dev-mon-${Date.now()}`,
        name: values.name,
        code: values.code,
        type: values.type,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
        ratedPower: values.ratedPower,
        relatedMeterIds: [],
        installDate: today,
        manufacturer: '待填写',
        model: '待填写',
        runHours: 0,
        lastMaintainDate: today,
      })
      message.success('设备已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<Device> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      width: 160,
      fixed: 'left',
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
    { title: '编码', dataIndex: 'code', width: 90 },
    { title: '类型', dataIndex: 'type', width: 100 },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '所属企业',
      dataIndex: 'enterpriseId',
      width: 140,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '—'),
    },
    {
      title: '额定功率(kW)',
      dataIndex: 'ratedPower',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '运行时长(h)',
      dataIndex: 'runHours',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: DeviceStatus) => <StatusTag status={s} />,
    },
    {
      title: '告警',
      width: 90,
      render: (_, row) =>
        row.status === 'fault' ? (
          <Link to="/ops/alarms">
            <Tag color="error">查看告警</Tag>
          </Link>
        ) : (
          '—'
        ),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onView={() => {
            setSelected(row)
            setOpen(true)
          }}
          onEdit={() => openEdit(row)}
          onDelete={() => {
            deleteDevice(row.id)
            if (selected?.id === row.id) {
              setOpen(false)
              setSelected(null)
            }
            message.success('已删除设备')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="设备监控"
        subtitle={`筛选后 ${data.length} 台 · 运行率 ${percentFormat(kpis.runRate)}`}
        breadcrumbs={[{ title: '运维管理' }, { title: '设备监控' }]}
        extra={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginRight: 8 }}>
              新建
            </Button>
            <Link to="/ops/alarms">
              <Button>告警中心</Button>
            </Link>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="设备总数" value={kpis.total} unit="台" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="运行" value={kpis.running} unit="台" trend="up" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="待机" value={kpis.idle} unit="台" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="故障" value={kpis.fault} unit="台" trend="flat" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="维保" value={kpis.maintenance} unit="台" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="运行率" value={+kpis.runRate.toFixed(1)} unit="%" />
        </Col>
      </Row>

      <Form layout="inline" style={{ marginTop: 16, marginBottom: 12, rowGap: 12 }}>
        <Form.Item label="分区">
          <Select
            style={{ width: 140 }}
            value={zoneFilter}
            onChange={setZoneFilter}
            options={[
              { value: 'all', label: '全部' },
              ...parkOverview.zones.map((z) => ({ value: z.id, label: z.name })),
            ]}
          />
        </Form.Item>
        <Form.Item label="状态">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部状态"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'running', label: '运行' },
              { value: 'idle', label: '待机' },
              { value: 'fault', label: '故障' },
              { value: 'maintenance', label: '维保' },
            ]}
          />
        </Form.Item>
      </Form>

      <ChartCard title="设备运行清单" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1260 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑设备' : '新建设备'}
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
              <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入名称' }]}>
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
                <Select options={DEVICE_TYPES.map((t) => ({ value: t, label: t }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
                <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'running', label: '运行' },
                    { value: 'idle', label: '待机' },
                    { value: 'fault', label: '故障' },
                    { value: 'maintenance', label: '维保' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ratedPower" label="额定功率 (kW)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selected?.name ?? '设备详情'}
        open={open}
        onClose={() => setOpen(false)}
        width={440}
        destroyOnHidden
      >
        {selected && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="编码">{selected.code}</Descriptions.Item>
            <Descriptions.Item label="类型">{selected.type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={selected.status} />
            </Descriptions.Item>
            <Descriptions.Item label="分区">
              {parkOverview.zones.find((z) => z.id === selected.zoneId)?.name}
            </Descriptions.Item>
            <Descriptions.Item label="企业">
              {selected.enterpriseId
                ? enterprisesById[selected.enterpriseId]?.name ?? selected.enterpriseId
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="额定功率">
              {numFormat(selected.ratedPower)} kW
            </Descriptions.Item>
            <Descriptions.Item label="运行时长">
              {numFormat(selected.runHours, { digits: 0 })} h
            </Descriptions.Item>
            <Descriptions.Item label="最近维保">{selected.lastMaintainDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
