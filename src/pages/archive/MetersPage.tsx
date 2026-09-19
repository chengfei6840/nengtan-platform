import {
  Breadcrumb,
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
  Switch,
  Table,
  Tag,
  message,
  Space,
} from 'antd'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useDemo } from '@/context/DemoContext'
import { useArchive } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { numFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { Meter, MeterStatus, MeterType, ZoneId } from '@/mock/types'

const meterTypes: MeterType[] = ['电', '水', '气', '蒸汽']

const unitByType: Record<MeterType, string> = {
  电: 'kWh',
  水: 'm³',
  气: 'm³',
  蒸汽: 't',
}

type MeterFormValues = {
  name: string
  code: string
  type: MeterType
  unit: string
  zoneId: ZoneId
  enterpriseId?: string
  status: MeterStatus
  lastValue: number
  level: number
  isGateway: boolean
  manufacturer: string
  model: string
  installDate: string
  multiplier: number
  lastDataTime: string
}

function buildHierarchyChain(meter: Meter, metersById: Record<string, Meter>): Meter[] {
  const chain: Meter[] = [meter]
  let current: Meter | undefined = meter
  const guard = new Set<string>([meter.id])
  while (current?.parentMeterId) {
    const parent: Meter | undefined = metersById[current.parentMeterId]
    if (!parent || guard.has(parent.id)) break
    chain.unshift(parent)
    guard.add(parent.id)
    current = parent
  }
  return chain
}

export default function MetersPage() {
  const { zoneId: globalZone } = useDemo()
  const { meters, enterprises, buildings, createMeter, updateMeter, deleteMeter } = useArchive()
  const [zoneFilter, setZoneFilter] = useState<string | 'all'>(globalZone)
  const [typeFilter, setTypeFilter] = useState<MeterType | undefined>()
  const [statusFilter, setStatusFilter] = useState<MeterStatus | undefined>()
  const [selected, setSelected] = useState<Meter | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Meter | null>(null)
  const [form] = Form.useForm<MeterFormValues>()

  const enterprisesById = useMemo(
    () => Object.fromEntries(enterprises.map((e) => [e.id, e])) as Record<string, (typeof enterprises)[0]>,
    [enterprises],
  )

  const buildingsById = useMemo(
    () => Object.fromEntries(buildings.map((b) => [b.id, b])) as Record<string, (typeof buildings)[0]>,
    [buildings],
  )

  const metersById = useMemo(
    () => Object.fromEntries(meters.map((m) => [m.id, m])) as Record<string, Meter>,
    [meters],
  )

  const metersOnlineRate = useMemo(() => {
    if (meters.length === 0) return 0
    return Math.round((meters.filter((m) => m.status === 'online').length / meters.length) * 1000) / 10
  }, [meters])

  const data = useMemo(() => {
    return meters.filter((m) => {
      if (zoneFilter !== 'all' && m.zoneId !== zoneFilter) return false
      if (typeFilter && m.type !== typeFilter) return false
      if (statusFilter && m.status !== statusFilter) return false
      return true
    })
  }, [meters, zoneFilter, typeFilter, statusFilter])

  const filteredOnlineRate = useMemo(() => {
    if (data.length === 0) return 0
    return Math.round((data.filter((m) => m.status === 'online').length / data.length) * 1000) / 10
  }, [data])

  const hierarchy = useMemo(
    () => (selected ? buildHierarchyChain(selected, metersById) : []),
    [selected, metersById],
  )

  const openCreate = () => {
    setEditing(null)
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const lastDataTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`
    form.setFieldsValue({
      name: '',
      code: '',
      type: '电',
      unit: 'kWh',
      zoneId: (globalZone === 'all' ? 'zone-east' : globalZone) as ZoneId,
      enterpriseId: undefined,
      status: 'online',
      lastValue: 0,
      level: 3,
      isGateway: false,
      manufacturer: '',
      model: '',
      installDate: now.toISOString().slice(0, 10),
      multiplier: 1,
      lastDataTime,
    })
    setModalOpen(true)
  }

  const openEdit = (row: Meter) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      code: row.code,
      type: row.type,
      unit: row.unit,
      zoneId: row.zoneId,
      enterpriseId: row.enterpriseId,
      status: row.status,
      lastValue: row.lastValue,
      level: row.level,
      isGateway: row.isGateway,
      manufacturer: row.manufacturer,
      model: row.model,
      installDate: row.installDate,
      multiplier: row.multiplier,
      lastDataTime: row.lastDataTime,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateMeter(editing.id, {
        name: values.name,
        code: values.code,
        type: values.type,
        unit: values.unit,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
        lastValue: values.lastValue,
        level: values.level,
        isGateway: values.isGateway,
        manufacturer: values.manufacturer,
        model: values.model,
        installDate: values.installDate,
        multiplier: values.multiplier,
        lastDataTime: values.lastDataTime,
      })
      message.success('计量点已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) =>
          prev ? { ...prev, ...values, enterpriseId: values.enterpriseId || undefined } : prev,
        )
      }
    } else {
      createMeter({
        id: `mtr-${Date.now()}`,
        name: values.name,
        code: values.code,
        type: values.type,
        unit: values.unit,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        status: values.status,
        lastValue: values.lastValue,
        level: values.level,
        isGateway: values.isGateway,
        manufacturer: values.manufacturer,
        model: values.model,
        installDate: values.installDate,
        multiplier: values.multiplier,
        lastDataTime: values.lastDataTime,
      })
      message.success('计量点已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<Meter> = [
    {
      title: '表计名称',
      dataIndex: 'name',
      width: 180,
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
    { title: '编码', dataIndex: 'code', width: 110 },
    { title: '类型', dataIndex: 'type', width: 70 },
    { title: '单位', dataIndex: 'unit', width: 70 },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '所属企业',
      dataIndex: 'enterpriseId',
      width: 130,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '园区'),
    },
    { title: '层级', dataIndex: 'level', width: 70 },
    {
      title: '最新示数',
      dataIndex: 'lastValue',
      width: 110,
      render: (v: number, row) => `${numFormat(v)} ${row.unit}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: '关口',
      dataIndex: 'isGateway',
      width: 70,
      render: (v: boolean) => (v ? <Tag color="teal">是</Tag> : '—'),
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
            deleteMeter(row.id)
            if (selected?.id === row.id) {
              setOpen(false)
              setSelected(null)
            }
            message.success('已删除计量点')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="计量点档案"
        subtitle={`共 ${data.length} 个计量点（筛选后）`}
        breadcrumbs={[{ title: '基础档案' }, { title: '计量点档案' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                downloadCsv(
                  '计量点档案.csv',
                  ['名称', '编码', '类型', '分区', '企业', '状态', '最近读数', '单位', '关口表'],
                  data.map((m) => [
                    m.name,
                    m.code,
                    m.type,
                    parkOverview.zones.find((z) => z.id === m.zoneId)?.name ?? m.zoneId,
                    m.enterpriseId ? enterprisesById[m.enterpriseId]?.shortName ?? m.enterpriseId : '',
                    m.status,
                    m.lastValue,
                    m.unit,
                    m.isGateway ? '是' : '否',
                  ]),
                )
                message.success(`已导出计量点档案（${data.length} 条）`)
              }}
            >
              导出
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <KpiCard title="表计总数" value={data.length} unit="只" />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title="当前筛选在线率"
            value={filteredOnlineRate}
            unit="%"
            target={98}
            trend={filteredOnlineRate >= 98 ? 'up' : 'flat'}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="全园在线率" value={metersOnlineRate} unit="%" target={98} />
        </Col>
      </Row>

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
            style={{ width: 120 }}
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={meterTypes.map((t) => ({ value: t, label: t }))}
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
              { value: 'online', label: '在线' },
              { value: 'offline', label: '离线' },
              { value: 'fault', label: '故障' },
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
        title={editing ? '编辑计量点' : '新建计量点'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={720}
        okText="保存"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 8 }}
          onValuesChange={(changed) => {
            if (changed.type && unitByType[changed.type as MeterType]) {
              form.setFieldValue('unit', unitByType[changed.type as MeterType])
            }
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" label="表计名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select options={meterTypes.map((t) => ({ value: t, label: t }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                  placeholder="园区公共可留空"
                  options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'online', label: '在线' },
                    { value: 'offline', label: '离线' },
                    { value: 'fault', label: '故障' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lastValue" label="最新示数" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="level" label="层级" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="multiplier" label="倍率" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isGateway" label="关口表" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="manufacturer" label="制造商" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="model" label="型号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="installDate" label="安装日期" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastDataTime" label="最近数据时间" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selected?.name ?? '计量点详情'}
        open={open}
        onClose={() => setOpen(false)}
        width={520}
        destroyOnHidden
      >
        {selected && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#134e4a' }}>表计层级</div>
              <Breadcrumb
                items={hierarchy.map((m) => ({
                  title: (
                    <span>
                      {m.name}
                      <Tag style={{ marginLeft: 6 }}>{`L${m.level}`}</Tag>
                    </span>
                  ),
                }))}
              />
              {hierarchy.length <= 1 && (
                <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
                  当前为顶层表计，无上级
                </div>
              )}
            </div>

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
                  : '园区公共'}
              </Descriptions.Item>
              <Descriptions.Item label="所在建筑">
                {selected.buildingId
                  ? buildingsById[selected.buildingId]?.name ?? selected.buildingId
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="上级表计">
                {selected.parentMeterId
                  ? metersById[selected.parentMeterId]?.name ?? selected.parentMeterId
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="层级">L{selected.level}</Descriptions.Item>
              <Descriptions.Item label="最新示数">
                {numFormat(selected.lastValue)} {selected.unit}
              </Descriptions.Item>
              <Descriptions.Item label="最新数据时间">{selected.lastDataTime}</Descriptions.Item>
              <Descriptions.Item label="倍率">{selected.multiplier}</Descriptions.Item>
              <Descriptions.Item label="关口表">{selected.isGateway ? '是' : '否'}</Descriptions.Item>
              <Descriptions.Item label="安装日期">{selected.installDate}</Descriptions.Item>
              <Descriptions.Item label="制造商">{selected.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="型号">{selected.model}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  )
}
