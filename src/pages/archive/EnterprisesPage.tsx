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
  Switch,
  Table,
  Tag,
  message,
} from 'antd'
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useDemo } from '@/context/DemoContext'
import { useArchive } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { energyFormat, emissionFormat, numFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { Enterprise, ZoneId } from '@/mock/types'

type EnterpriseFormValues = {
  shortName: string
  name: string
  creditCode: string
  industry: string
  zoneId: ZoneId
  address: string
  yearlyEnergy: number
  yearlyEmission: number
  isKeyEnergy: boolean
  status: Enterprise['status']
  contactName: string
  contactPhone: string
}

function buildDefaultEnterprise(values: EnterpriseFormValues): Enterprise {
  const id = `ent-${Date.now()}`
  return {
    id,
    name: values.name,
    shortName: values.shortName,
    creditCode: values.creditCode,
    industry: values.industry,
    zoneId: values.zoneId,
    address: values.address,
    contact: {
      name: values.contactName,
      phone: values.contactPhone,
      email: '',
      title: '联系人',
    },
    area: 1000,
    employees: 50,
    outputValue: 0.5,
    isKeyEnergy: values.isKeyEnergy,
    isKeyEmission: false,
    energyTypes: ['电', '水'],
    processDesc: '待补充工艺说明',
    carbonBoundary: '组织边界待确认',
    meterCount: 0,
    deviceCount: 0,
    yearlyEnergy: values.yearlyEnergy ?? 0,
    yearlyEmission: values.yearlyEmission ?? 0,
    energyRank: 99,
    emissionRank: 99,
    intensityRank: 99,
    status: values.status,
  }
}

export default function EnterprisesPage() {
  const { zoneId: globalZone } = useDemo()
  const {
    enterprises,
    buildings,
    devices,
    meters,
    createEnterprise,
    updateEnterprise,
    deleteEnterprise,
  } = useArchive()
  const [searchParams, setSearchParams] = useSearchParams()
  const [zoneFilter, setZoneFilter] = useState<string | 'all'>(globalZone)
  const [industry, setIndustry] = useState<string | undefined>()
  const [keyEnergy, setKeyEnergy] = useState<string | undefined>()
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState<Enterprise | null>(null)
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Enterprise | null>(null)
  const [form] = Form.useForm<EnterpriseFormValues>()

  const industries = useMemo(
    () => Array.from(new Set(enterprises.map((e) => e.industry))).sort(),
    [enterprises],
  )

  useEffect(() => {
    const id = searchParams.get('id')
    if (!id) return
    const ent = enterprises.find((e) => e.id === id)
    if (ent) {
      setSelected(ent)
      setOpen(true)
      setZoneFilter('all')
    }
  }, [searchParams, enterprises])

  const closeDrawer = () => {
    setOpen(false)
    if (searchParams.has('id')) {
      const next = new URLSearchParams(searchParams)
      next.delete('id')
      setSearchParams(next, { replace: true })
    }
  }

  const data = useMemo(() => {
    return enterprises.filter((e) => {
      if (zoneFilter !== 'all' && e.zoneId !== zoneFilter) return false
      if (industry && e.industry !== industry) return false
      if (keyEnergy === 'yes' && !e.isKeyEnergy) return false
      if (keyEnergy === 'no' && e.isKeyEnergy) return false
      if (keyword) {
        const q = keyword.trim().toLowerCase()
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.shortName.toLowerCase().includes(q) &&
          !e.creditCode.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [enterprises, zoneFilter, industry, keyEnergy, keyword])

  const detailCounts = useMemo(() => {
    if (!selected) return null
    return {
      meters: meters.filter((m) => m.enterpriseId === selected.id).length,
      buildings: buildings.filter((b) => b.enterpriseId === selected.id).length,
      devices: devices.filter((d) => d.enterpriseId === selected.id).length,
    }
  }, [selected, meters, buildings, devices])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      shortName: '',
      name: '',
      creditCode: '',
      industry: industries[0] ?? '其他',
      zoneId: (globalZone === 'all' ? 'zone-east' : globalZone) as ZoneId,
      address: '',
      yearlyEnergy: 0,
      yearlyEmission: 0,
      isKeyEnergy: false,
      status: 'active',
      contactName: '',
      contactPhone: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: Enterprise) => {
    setEditing(row)
    form.setFieldsValue({
      shortName: row.shortName,
      name: row.name,
      creditCode: row.creditCode,
      industry: row.industry,
      zoneId: row.zoneId,
      address: row.address,
      yearlyEnergy: row.yearlyEnergy,
      yearlyEmission: row.yearlyEmission,
      isKeyEnergy: row.isKeyEnergy,
      status: row.status,
      contactName: row.contact.name,
      contactPhone: row.contact.phone,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateEnterprise(editing.id, {
        shortName: values.shortName,
        name: values.name,
        creditCode: values.creditCode,
        industry: values.industry,
        zoneId: values.zoneId,
        address: values.address,
        yearlyEnergy: values.yearlyEnergy ?? 0,
        yearlyEmission: values.yearlyEmission ?? 0,
        isKeyEnergy: values.isKeyEnergy,
        status: values.status,
        contact: {
          ...editing.contact,
          name: values.contactName,
          phone: values.contactPhone,
        },
      })
      message.success('企业已更新')
      if (selected?.id === editing.id) {
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                shortName: values.shortName,
                name: values.name,
                creditCode: values.creditCode,
                industry: values.industry,
                zoneId: values.zoneId,
                address: values.address,
                yearlyEnergy: values.yearlyEnergy ?? 0,
                yearlyEmission: values.yearlyEmission ?? 0,
                isKeyEnergy: values.isKeyEnergy,
                status: values.status,
                contact: {
                  ...prev.contact,
                  name: values.contactName,
                  phone: values.contactPhone,
                },
              }
            : prev,
        )
      }
    } else {
      createEnterprise(buildDefaultEnterprise(values))
      message.success('企业已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<Enterprise> = [
    {
      title: '企业简称',
      dataIndex: 'shortName',
      width: 140,
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
    { title: '全称', dataIndex: 'name', ellipsis: true, width: 220 },
    { title: '行业', dataIndex: 'industry', width: 110 },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '重点用能',
      dataIndex: 'isKeyEnergy',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '重点排放',
      dataIndex: 'isKeyEmission',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="red">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '年综合能耗',
      dataIndex: 'yearlyEnergy',
      width: 120,
      render: (v: number) => energyFormat(v, { unit: 'tce' }),
      sorter: (a, b) => a.yearlyEnergy - b.yearlyEnergy,
    },
    {
      title: '年碳排放',
      dataIndex: 'yearlyEmission',
      width: 120,
      render: (v: number) => emissionFormat(v),
      sorter: (a, b) => a.yearlyEmission - b.yearlyEmission,
    },
    {
      title: '表计/设备',
      width: 100,
      render: (_, row) => `${row.meterCount} / ${row.deviceCount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
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
            deleteEnterprise(row.id)
            if (selected?.id === row.id) {
              setOpen(false)
              setSelected(null)
            }
            message.success('已删除企业')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="企业档案"
        subtitle={`共 ${data.length} 家企业（筛选后）`}
        breadcrumbs={[{ title: '基础档案' }, { title: '企业档案' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                downloadCsv(
                  '企业档案.csv',
                  [
                    '简称',
                    '全称',
                    '信用代码',
                    '行业',
                    '分区',
                    '年综合能耗(tce)',
                    '年碳排放(tCO2e)',
                    '表计',
                    '设备',
                    '状态',
                  ],
                  data.map((e) => [
                    e.shortName,
                    e.name,
                    e.creditCode,
                    e.industry,
                    parkOverview.zones.find((z) => z.id === e.zoneId)?.name ?? e.zoneId,
                    e.yearlyEnergy,
                    e.yearlyEmission,
                    e.meterCount,
                    e.deviceCount,
                    e.status,
                  ]),
                )
                message.success(`已导出企业档案（${data.length} 条）`)
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
        <Form.Item label="行业">
          <Select
            allowClear
            style={{ width: 140 }}
            placeholder="全部行业"
            value={industry}
            onChange={setIndustry}
            options={industries.map((i) => ({ value: i, label: i }))}
          />
        </Form.Item>
        <Form.Item label="重点用能">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部"
            value={keyEnergy}
            onChange={setKeyEnergy}
            options={[
              { value: 'yes', label: '是' },
              { value: 'no', label: '否' },
            ]}
          />
        </Form.Item>
        <Form.Item label="关键词">
          <Input
            allowClear
            style={{ width: 200 }}
            placeholder="名称 / 信用代码"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Form.Item>
      </Form>

      <Table
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1360 }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
      />

      <Modal
        title={editing ? '编辑企业' : '新建企业'}
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
              <Form.Item name="shortName" label="企业简称" rules={[{ required: true, message: '请输入简称' }]}>
                <Input placeholder="如：华芯精密电子" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="企业全称" rules={[{ required: true, message: '请输入全称' }]}>
                <Input placeholder="工商注册全称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="creditCode"
                label="统一社会信用代码"
                rules={[{ required: true, message: '请输入信用代码' }]}
              >
                <Input placeholder="18 位信用代码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industry" label="行业" rules={[{ required: true, message: '请输入行业' }]}>
                <Input placeholder="如：电子" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区" rules={[{ required: true, message: '请选择分区' }]}>
                <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'active', label: '在用' },
                    { value: 'inactive', label: '停用' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
                <Input placeholder="园区内地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="yearlyEnergy" label="年综合能耗 (tce)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="yearlyEmission" label="年碳排放 (tCO₂e)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isKeyEnergy" label="重点用能" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactName"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入电话' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selected?.shortName ?? '企业详情'}
        open={open}
        onClose={closeDrawer}
        width={520}
        destroyOnHidden
        extra={
          <Button
            type="primary"
            onClick={() => {
              if (!selected) return
              downloadCsv(
                `企业档案-${selected.shortName}.csv`,
                ['字段', '值'],
                [
                  ['企业全称', selected.name],
                  ['信用代码', selected.creditCode],
                  ['行业', selected.industry],
                  ['年综合能耗(tce)', selected.yearlyEnergy],
                  ['年碳排放(tCO2e)', selected.yearlyEmission],
                  ['联系人', selected.contact.name],
                  ['电话', selected.contact.phone],
                ],
              )
              message.success(`已导出「${selected.shortName}」档案`)
            }}
          >
            导出详情
          </Button>
        }
      >
        {selected && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Row gutter={12}>
              <Col span={8}>
                <Tag color="teal" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
                  表计 {detailCounts?.meters ?? selected.meterCount}
                </Tag>
              </Col>
              <Col span={8}>
                <Tag color="cyan" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
                  建筑 {detailCounts?.buildings ?? 0}
                </Tag>
              </Col>
              <Col span={8}>
                <Tag color="green" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
                  设备 {detailCounts?.devices ?? selected.deviceCount}
                </Tag>
              </Col>
            </Row>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="企业全称">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">{selected.creditCode}</Descriptions.Item>
              <Descriptions.Item label="行业">{selected.industry}</Descriptions.Item>
              <Descriptions.Item label="分区">
                {parkOverview.zones.find((z) => z.id === selected.zoneId)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="地址">{selected.address}</Descriptions.Item>
              <Descriptions.Item label="建筑面积">{numFormat(selected.area)} m²</Descriptions.Item>
              <Descriptions.Item label="员工数">{selected.employees}</Descriptions.Item>
              <Descriptions.Item label="产值">{selected.outputValue} 亿元</Descriptions.Item>
              <Descriptions.Item label="用能品种">
                <Space wrap>
                  {selected.energyTypes.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="年综合能耗">
                {energyFormat(selected.yearlyEnergy, { unit: 'tce' })}
              </Descriptions.Item>
              <Descriptions.Item label="年碳排放">
                {emissionFormat(selected.yearlyEmission)}
              </Descriptions.Item>
              <Descriptions.Item label="能耗/排放/强度排名">
                {selected.energyRank} / {selected.emissionRank} / {selected.intensityRank}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">
                {selected.contact.name} · {selected.contact.title} · {selected.contact.phone}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">{selected.contact.email}</Descriptions.Item>
              <Descriptions.Item label="工艺简述">{selected.processDesc}</Descriptions.Item>
              <Descriptions.Item label="碳核算边界">{selected.carbonBoundary}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={selected.status} />
              </Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Drawer>
    </div>
  )
}
