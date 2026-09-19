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
import type { Building, ZoneId } from '@/mock/types'

const BUILDING_TYPES: Building['type'][] = ['厂房', '办公楼', '仓库', '宿舍', '配套', '能源站', '门卫']

const buildingStatusLabel: Record<Building['status'], string> = {
  in_use: '在用',
  idle: '闲置',
  renovating: '装修中',
}

const buildingStatusTone: Record<Building['status'], string> = {
  in_use: 'success',
  idle: 'default',
  renovating: 'warning',
}

type BuildingFormValues = {
  name: string
  code: string
  type: Building['type']
  zoneId: ZoneId
  enterpriseId?: string
  floors: number
  area: number
  builtYear: number
  status: Building['status']
}

export default function BuildingsPage() {
  const { zoneId: globalZone } = useDemo()
  const { buildings, enterprises, createBuilding, updateBuilding, deleteBuilding } = useArchive()
  const [zoneFilter, setZoneFilter] = useState<string | 'all'>(globalZone)
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selected, setSelected] = useState<Building | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Building | null>(null)
  const [form] = Form.useForm<BuildingFormValues>()

  const enterprisesById = useMemo(
    () => Object.fromEntries(enterprises.map((e) => [e.id, e])) as Record<string, (typeof enterprises)[0]>,
    [enterprises],
  )

  const buildingTypes = useMemo(
    () => Array.from(new Set([...BUILDING_TYPES, ...buildings.map((b) => b.type)])),
    [buildings],
  )

  const data = useMemo(() => {
    return buildings.filter((b) => {
      if (zoneFilter !== 'all' && b.zoneId !== zoneFilter) return false
      if (typeFilter && b.type !== typeFilter) return false
      if (statusFilter && b.status !== statusFilter) return false
      return true
    })
  }, [buildings, zoneFilter, typeFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      code: '',
      type: '厂房',
      zoneId: (globalZone === 'all' ? 'zone-east' : globalZone) as ZoneId,
      enterpriseId: undefined,
      floors: 1,
      area: 1000,
      builtYear: new Date().getFullYear(),
      status: 'in_use',
    })
    setModalOpen(true)
  }

  const openEdit = (row: Building) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      code: row.code,
      type: row.type,
      zoneId: row.zoneId,
      enterpriseId: row.enterpriseId,
      floors: row.floors,
      area: row.area,
      builtYear: row.builtYear,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateBuilding(editing.id, {
        name: values.name,
        code: values.code,
        type: values.type,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        floors: values.floors,
        area: values.area,
        builtYear: values.builtYear,
        status: values.status,
      })
      message.success('建筑已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) => (prev ? { ...prev, ...values, enterpriseId: values.enterpriseId || undefined } : prev))
      }
    } else {
      const id = `bld-${Date.now()}`
      createBuilding({
        id,
        name: values.name,
        code: values.code,
        type: values.type,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        floors: values.floors,
        area: values.area,
        builtYear: values.builtYear,
        status: values.status,
        address: parkOverview.zones.find((z) => z.id === values.zoneId)?.name ?? '',
        lng: parkOverview.mapCenter.lng,
        lat: parkOverview.mapCenter.lat,
        meterCount: 0,
      })
      message.success('建筑已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<Building> = [
    {
      title: '建筑名称',
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
    { title: '编码', dataIndex: 'code', width: 90 },
    { title: '类型', dataIndex: 'type', width: 90 },
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
    { title: '层数', dataIndex: 'floors', width: 70 },
    {
      title: '面积 (m²)',
      dataIndex: 'area',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 0 }),
      sorter: (a, b) => a.area - b.area,
    },
    { title: '建成年份', dataIndex: 'builtYear', width: 90 },
    { title: '表计数', dataIndex: 'meterCount', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: Building['status']) => (
        <StatusTag status={buildingStatusTone[s]} label={buildingStatusLabel[s]} />
      ),
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
            deleteBuilding(row.id)
            if (selected?.id === row.id) {
              setOpen(false)
              setSelected(null)
            }
            message.success('已删除建筑')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="建筑档案"
        subtitle={`共 ${data.length} 栋建筑（筛选后）`}
        breadcrumbs={[{ title: '基础档案' }, { title: '建筑档案' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                downloadCsv(
                  '建筑档案.csv',
                  ['名称', '编码', '类型', '分区', '企业', '层数', '面积', '建成年份', '表计', '状态'],
                  data.map((b) => [
                    b.name,
                    b.code,
                    b.type,
                    parkOverview.zones.find((z) => z.id === b.zoneId)?.name ?? b.zoneId,
                    b.enterpriseId ? enterprisesById[b.enterpriseId]?.shortName ?? b.enterpriseId : '',
                    b.floors,
                    b.area,
                    b.builtYear,
                    b.meterCount,
                    buildingStatusLabel[b.status],
                  ]),
                )
                message.success(`已导出建筑档案（${data.length} 条）`)
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
            style={{ width: 120 }}
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={buildingTypes.map((t) => ({ value: t, label: t }))}
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
              { value: 'in_use', label: '在用' },
              { value: 'idle', label: '闲置' },
              { value: 'renovating', label: '装修中' },
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
        title={editing ? '编辑建筑' : '新建建筑'}
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
              <Form.Item name="name" label="建筑名称" rules={[{ required: true, message: '请输入名称' }]}>
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
                <Select options={BUILDING_TYPES.map((t) => ({ value: t, label: t }))} />
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
                  placeholder="园区公共可留空"
                  options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'in_use', label: '在用' },
                    { value: 'idle', label: '闲置' },
                    { value: 'renovating', label: '装修中' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="floors" label="层数" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="area" label="面积 (m²)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="builtYear" label="建成年份" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1900} max={2100} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selected?.name ?? '建筑详情'}
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
            <Descriptions.Item label="分区">
              {parkOverview.zones.find((z) => z.id === selected.zoneId)?.name}
            </Descriptions.Item>
            <Descriptions.Item label="所属企业">
              {selected.enterpriseId
                ? enterprisesById[selected.enterpriseId]?.name ?? selected.enterpriseId
                : '园区公共'}
            </Descriptions.Item>
            <Descriptions.Item label="层数">{selected.floors}</Descriptions.Item>
            <Descriptions.Item label="建筑面积">{numFormat(selected.area)} m²</Descriptions.Item>
            <Descriptions.Item label="建成年份">{selected.builtYear}</Descriptions.Item>
            <Descriptions.Item label="地址">{selected.address}</Descriptions.Item>
            <Descriptions.Item label="坐标">
              {selected.lng}, {selected.lat}
            </Descriptions.Item>
            <Descriptions.Item label="表计数量">{selected.meterCount}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag
                status={buildingStatusTone[selected.status]}
                label={buildingStatusLabel[selected.status]}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
