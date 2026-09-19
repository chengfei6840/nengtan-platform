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
  Table,
  Tabs,
  message,
} from 'antd'
import { PageHeader } from '@/components/PageHeader'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { useArchive } from '@/context/ArchiveContext'
import { parkOverview } from '@/mock/park'
import { monthlyEnergy as seedMonthly } from '@/mock/energy'
import { energyFormat, moneyFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { Meter, MeterStatus, MeterType, MonthlyEnergyItem, ZoneId } from '@/mock/types'

type MonthRow = MonthlyEnergyItem & { id: string }

const MONTH_SEED: MonthRow[] = seedMonthly.map((m) => ({ ...m, id: m.month }))

export default function QueryPage() {
  const {
    meters,
    enterprises,
    createMeter,
    updateMeter,
    deleteMeter,
  } = useArchive()
  const energyCrud = useCrudList(MONTH_SEED, 'month')

  const [zoneFilter, setZoneFilter] = useState<string | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [enterpriseId, setEnterpriseId] = useState<string | undefined>()

  const [meterModal, setMeterModal] = useState(false)
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null)
  const [meterForm] = Form.useForm()

  const [energyModal, setEnergyModal] = useState(false)
  const [editingEnergy, setEditingEnergy] = useState<MonthRow | null>(null)
  const [energyForm] = Form.useForm()

  const meterRows = useMemo(() => {
    return meters.filter((m) => {
      if (zoneFilter !== 'all' && m.zoneId !== zoneFilter) return false
      if (typeFilter && m.type !== typeFilter) return false
      if (enterpriseId && m.enterpriseId !== enterpriseId) return false
      return true
    })
  }, [meters, zoneFilter, typeFilter, enterpriseId])

  const openMeterCreate = () => {
    setEditingMeter(null)
    meterForm.setFieldsValue({
      name: '',
      code: `M-${Date.now().toString().slice(-6)}`,
      type: '电',
      unit: 'kWh',
      zoneId: 'zone-east',
      status: 'online',
      lastValue: 0,
      level: 2,
      isGateway: false,
      manufacturer: 'Demo',
      model: 'DM-1',
      installDate: '2024-01-01',
      multiplier: 1,
      lastDataTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    setMeterModal(true)
  }

  const openMeterEdit = (row: Meter) => {
    setEditingMeter(row)
    meterForm.setFieldsValue(row)
    setMeterModal(true)
  }

  const onMeterOk = async () => {
    const values = await meterForm.validateFields()
    if (editingMeter) {
      updateMeter(editingMeter.id, values)
      message.success('已更新表计')
    } else {
      createMeter({
        id: `mtr-demo-${Date.now()}`,
        ...values,
      })
      message.success('已新建表计')
    }
    setMeterModal(false)
  }

  const openEnergyCreate = () => {
    setEditingEnergy(null)
    energyForm.setFieldsValue({
      month: '',
      electricity: 0,
      water: 0,
      gas: 0,
      steam: 0,
      diesel: 0,
      pvGeneration: 0,
      totalTce: 0,
      cost: 0,
    })
    setEnergyModal(true)
  }

  const openEnergyEdit = (row: MonthRow) => {
    setEditingEnergy(row)
    energyForm.setFieldsValue(row)
    setEnergyModal(true)
  }

  const onEnergyOk = async () => {
    const values = await energyForm.validateFields()
    const row: MonthRow = { ...values, id: values.month }
    if (editingEnergy) {
      energyCrud.update(editingEnergy.id, row)
      message.success('已更新月度能耗')
    } else {
      energyCrud.create(row)
      message.success('已新建月度能耗')
    }
    setEnergyModal(false)
  }

  const meterColumns: ColumnsType<Meter> = [
    { title: '表计名称', dataIndex: 'name', ellipsis: true },
    { title: '编码', dataIndex: 'code', width: 110 },
    { title: '类型', dataIndex: 'type', width: 70 },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 90,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '最近读数',
      dataIndex: 'lastValue',
      width: 110,
      render: (v: number, row) => `${numFormat(v)} ${row.unit}`,
    },
    { title: '最近数据时间', dataIndex: 'lastDataTime', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openMeterEdit(row)}
          onDelete={() => {
            deleteMeter(row.id)
            message.success('已删除表计')
          }}
        />
      ),
    },
  ]

  const energyColumns: ColumnsType<MonthRow> = [
    { title: '月份', dataIndex: 'month', width: 100 },
    {
      title: '电(kWh)',
      dataIndex: 'electricity',
      render: (v: number) => energyFormat(v),
    },
    {
      title: '水(m³)',
      dataIndex: 'water',
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '天然气(m³)',
      dataIndex: 'gas',
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '蒸汽(t)',
      dataIndex: 'steam',
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '光伏发电',
      dataIndex: 'pvGeneration',
      render: (v: number) => energyFormat(v),
    },
    {
      title: '综合能耗(tce)',
      dataIndex: 'totalTce',
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '成本(万元)',
      dataIndex: 'cost',
      render: (v: number) => moneyFormat(v, { unit: '万元' }),
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEnergyEdit(row)}
          onDelete={() => {
            energyCrud.remove(row.id)
            message.success('已删除')
          }}
        />
      ),
    },
  ]

  const meterTypes = Array.from(new Set(meters.map((m) => m.type))) as MeterType[]

  return (
    <div>
      <PageHeader
        title="数据查询"
        subtitle="表计读数与园区月度能耗（均可增删改）"
        breadcrumbs={[{ title: '数据中心' }, { title: '数据查询' }]}
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
        <Form.Item label="表计类型">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部"
            value={typeFilter}
            onChange={setTypeFilter}
            options={meterTypes.map((t) => ({ value: t, label: t }))}
          />
        </Form.Item>
        <Form.Item label="企业">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 200 }}
            placeholder="全部企业"
            value={enterpriseId}
            onChange={setEnterpriseId}
            options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
          />
        </Form.Item>
      </Form>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs
            items={[
              {
                key: 'meters',
                label: `表计数据（${meterRows.length}）`,
                children: (
                  <ChartCard
                    title="表计最近读数"
                    height="auto"
                    extra={
                      <Button type="primary" size="small" onClick={openMeterCreate}>
                        新建表计
                      </Button>
                    }
                  >
                    <Table
                      size="small"
                      rowKey="id"
                      columns={meterColumns}
                      dataSource={meterRows}
                      pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                      scroll={{ x: 1000 }}
                    />
                  </ChartCard>
                ),
              },
              {
                key: 'energy',
                label: '月度能耗',
                children: (
                  <ChartCard
                    title="园区月度能耗"
                    height="auto"
                    extra={
                      <Button type="primary" size="small" onClick={openEnergyCreate}>
                        新建月份
                      </Button>
                    }
                  >
                    <Table
                      size="small"
                      rowKey="id"
                      columns={energyColumns}
                      dataSource={energyCrud.items}
                      pagination={false}
                      scroll={{ x: 1100 }}
                    />
                  </ChartCard>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      <Modal
        title={editingMeter ? '编辑表计' : '新建表计'}
        open={meterModal}
        onOk={onMeterOk}
        onCancel={() => setMeterModal(false)}
        destroyOnHidden
        width={560}
      >
        <Form form={meterForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={['电', '水', '气', '蒸汽'].map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
            <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
          </Form.Item>
          <Form.Item name="enterpriseId" label="企业">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={(
                [
                  ['online', '在线'],
                  ['offline', '离线'],
                  ['fault', '故障'],
                ] as [MeterStatus, string][]
              ).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Form.Item>
          <Form.Item name="lastValue" label="最近读数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lastDataTime" label="最近数据时间" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="level" label="层级" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={5} />
          </Form.Item>
          <Form.Item name="multiplier" label="倍率" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="manufacturer" label="厂商" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label="型号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="installDate" label="安装日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="isGateway" label="关口表" rules={[{ required: true }]}>
            <Select
              options={[
                { value: true, label: '是' },
                { value: false, label: '否' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingEnergy ? '编辑月度能耗' : '新建月度能耗'}
        open={energyModal}
        onOk={onEnergyOk}
        onCancel={() => setEnergyModal(false)}
        destroyOnHidden
      >
        <Form form={energyForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="month" label="月份" rules={[{ required: true }]}>
            <Input disabled={!!editingEnergy} placeholder="如 2026-03" />
          </Form.Item>
          <Form.Item name="electricity" label="电 (kWh)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="water" label="水 (m³)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="gas" label="天然气 (m³)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="steam" label="蒸汽 (t)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="diesel" label="柴油 (t)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="pvGeneration" label="光伏发电 (kWh)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="totalTce" label="综合能耗 (tce)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="cost" label="成本 (万元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
