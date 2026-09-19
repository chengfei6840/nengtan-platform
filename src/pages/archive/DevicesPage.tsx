import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useDemo } from '@/context/DemoContext'
import { useArchive } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { numFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { Device, DeviceType, ZoneId } from '@/mock/types'

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
  status: Device['status']
  ratedPower: number
}

export default function DevicesPage() {
  const { zoneId: globalZone } = useDemo()
  const { devices, enterprises, buildings, createDevice, updateDevice, deleteDevice } = useArchive()
  const [zoneFilter, setZoneFilter] = useState<string | 'all'>(globalZone)
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<Device | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Device | null>(null)
  const [form] = Form.useForm<DeviceFormValues>()

  const enterprisesById = useMemo(
    () => Object.fromEntries(enterprises.map((e) => [e.id, e])) as Record<string, (typeof enterprises)[0]>,
    [enterprises],
  )

  const buildingsById = useMemo(
    () => Object.fromEntries(buildings.map((b) => [b.id, b])) as Record<string, (typeof buildings)[0]>,
    [buildings],
  )

  const deviceTypes = useMemo(
    () => Array.from(new Set([...DEVICE_TYPES, ...devices.map((d) => d.type)])) as DeviceType[],
    [devices],
  )

  const data = useMemo(() => {
    return devices.filter((d) => {
      if (zoneFilter !== 'all' && d.zoneId !== zoneFilter) return false
      if (typeFilter && d.type !== typeFilter) return false
      if (statusFilter && d.status !== statusFilter) return false
      return true
    })
  }, [devices, zoneFilter, typeFilter, statusFilter])

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
      updateDevice(editing.id, {
        name: values.name,
        code: values.code,
        type: values.type,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
        ratedPower: values.ratedPower,
      })
      message.success('设备已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) =>
          prev ? { ...prev, ...values, enterpriseId: values.enterpriseId || undefined } : prev,
        )
      }
    } else {
      const today = new Date().toISOString().slice(0, 10)
      createDevice({
        id: `dev-${Date.now()}`,
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
      title: '额定功率 (kW)',
      dataIndex: 'ratedPower',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
      sorter: (a, b) => a.ratedPower - b.ratedPower,
    },
    {
      title: '运行时长 (h)',
      dataIndex: 'runHours',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
      sorter: (a, b) => a.runHours - b.runHours,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: '操作',
      key: 'actions',
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
        title="设备档案"
        subtitle={`共 ${data.length} 台设备（筛选后）`}
        breadcrumbs={[{ title: '基础档案' }, { title: '设备档案' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                downloadCsv(
                  '设备档案.csv',
                  ['名称', '编码', '类型', '分区', '企业', '状态', '额定功率'],
                  data.map((d) => [
                    d.name,
                    d.code,
                    d.type,
                    parkOverview.zones.find((z) => z.id === d.zoneId)?.name ?? d.zoneId,
                    d.enterpriseId ? enterprisesById[d.enterpriseId]?.shortName ?? d.enterpriseId : '',
                    d.status,
                    d.ratedPower ?? '',
                  ]),
                )
                message.success(`已导出设备档案（${data.length} 条）`)
              }}
            >
              导出
            </Button>
          </Space>
        }
      />

      <Form layout="inline" style={{ marginBottom: 16, rowGap: 12 }}>
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
        <Form.Item label="类型">
          <Select
            allowClear
            style={{ width: 140 }}
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={deviceTypes.map((t) => ({ value: t, label: t }))}
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

      <Table
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1260 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
      />

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
              <Form.Item name="enterpriseId" label="所属企业">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="可留空"
                  options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                />
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
        width={480}
        destroyOnHidden
      >
        {selected && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="名称">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="编码">{selected.code}</Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag>{selected.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={selected.status} />
            </Descriptions.Item>
            <Descriptions.Item label="分区">
              {parkOverview.zones.find((z) => z.id === selected.zoneId)?.name}
            </Descriptions.Item>
            <Descriptions.Item label="所属企业">
              {selected.enterpriseId
                ? enterprisesById[selected.enterpriseId]?.name ?? selected.enterpriseId
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="所在建筑">
              {selected.buildingId
                ? buildingsById[selected.buildingId]?.name ?? selected.buildingId
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="额定功率">{numFormat(selected.ratedPower)} kW</Descriptions.Item>
            <Descriptions.Item label="累计运行时长">
              {numFormat(selected.runHours, { digits: 0 })} 小时
            </Descriptions.Item>
            <Descriptions.Item label="安装日期">{selected.installDate}</Descriptions.Item>
            <Descriptions.Item label="最近维保">{selected.lastMaintainDate}</Descriptions.Item>
            <Descriptions.Item label="制造商">{selected.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="型号">{selected.model}</Descriptions.Item>
            <Descriptions.Item label="关联表计">
              <Space wrap>
                {selected.relatedMeterIds.length > 0
                  ? selected.relatedMeterIds.map((id) => <Tag key={id}>{id}</Tag>)
                  : '—'}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
