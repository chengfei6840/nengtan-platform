import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { parkOverview } from '@/mock/park'
import { storageSystems as seedStorage, storageTodayStats } from '@/mock/renewable'
import { energyFormat, numFormat, percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { StorageSystem, ZoneId } from '@/mock/types'

const MODE_LABEL: Record<string, string> = {
  charge: '充电',
  discharge: '放电',
  idle: '空闲',
  standby: '待机',
}

type StorageFormValues = {
  name: string
  zoneId: ZoneId
  capacityMwh: number
  powerMw: number
  soc: number
  powerKw: number
  mode: StorageSystem['mode']
  cycles: number
  status: StorageSystem['status']
}

export default function StoragePage() {
  const { items, create, update, remove } = useCrudList(seedStorage, 'ess')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StorageSystem | null>(null)
  const [form] = Form.useForm<StorageFormValues>()

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      zoneId: 'zone-east',
      capacityMwh: 1,
      powerMw: 0.5,
      soc: 50,
      powerKw: 0,
      mode: 'idle',
      cycles: 0,
      status: 'normal',
    })
    setModalOpen(true)
  }

  const openEdit = (row: StorageSystem) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      message.success('储能系统已更新')
    } else {
      create(values)
      message.success('储能系统已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<StorageSystem> = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '容量(MWh)',
      dataIndex: 'capacityMwh',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 1 }),
    },
    {
      title: '功率(MW)',
      dataIndex: 'powerMw',
      width: 100,
      render: (v: number) => numFormat(v, { digits: 1 }),
    },
    {
      title: 'SOC',
      dataIndex: 'soc',
      width: 80,
      render: (v: number) => percentFormat(v),
    },
    {
      title: '实时功率(kW)',
      dataIndex: 'powerKw',
      width: 120,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '模式',
      dataIndex: 'mode',
      width: 90,
      render: (m: string) => MODE_LABEL[m] ?? m,
    },
    { title: '循环次数', dataIndex: 'cycles', width: 100 },
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
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            message.success('已删除储能系统')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="储能系统"
        subtitle="园区集中式储能运行监测 · Demo 数据"
        breadcrumbs={[{ title: '新能源' }, { title: '储能' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="今日充电"
            value={numFormat(storageTodayStats.chargeKwh, { digits: 0 })}
            unit="kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="今日放电"
            value={numFormat(storageTodayStats.dischargeKwh, { digits: 0 })}
            unit="kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="充放效率" value={storageTodayStats.efficiency} unit="%" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="削峰收益"
            value={storageTodayStats.peakShavingBenefit}
            unit={storageTodayStats.benefitUnit}
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="等效循环" value={storageTodayStats.arbiCycles} unit="次" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {items.map((ess) => {
          const zoneName =
            parkOverview.zones.find((z) => z.id === (ess.zoneId as ZoneId))?.name ?? ess.zoneId
          const powerAbs = Math.abs(ess.powerKw)
          return (
            <Col xs={24} lg={12} key={ess.id}>
              <ChartCard
                title={ess.name}
                subtitle={`${zoneName} · 额定 ${ess.capacityMwh} MWh / ${ess.powerMw} MW`}
                height="auto"
                extra={
                  <Space>
                    <StatusTag status={ess.status} />
                    <Button type="link" size="small" onClick={() => openEdit(ess)}>
                      编辑
                    </Button>
                  </Space>
                }
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={10}>
                    <Card size="small" styles={{ body: { textAlign: 'center', padding: 20 } }}>
                      <div style={{ marginBottom: 8, color: '#64748b' }}>SOC</div>
                      <Progress
                        type="dashboard"
                        percent={ess.soc}
                        strokeColor={{ '0%': '#0d9488', '100%': '#059669' }}
                        format={(p) => (
                          <span style={{ fontSize: 22, fontWeight: 600, color: '#0f766e' }}>
                            {percentFormat(p ?? 0)}
                          </span>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={14}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Statistic
                          title="实时功率"
                          value={powerAbs}
                          suffix="kW"
                          valueStyle={{
                            color: ess.powerKw < 0 ? '#dc2626' : '#059669',
                            fontSize: 20,
                          }}
                        />
                        <Tag color={ess.powerKw < 0 ? 'error' : ess.powerKw > 0 ? 'success' : 'default'}>
                          {MODE_LABEL[ess.mode] ?? ess.mode}
                          {ess.powerKw < 0 ? '（放电）' : ess.powerKw > 0 ? '（充电）' : ''}
                        </Tag>
                      </Col>
                      <Col span={12}>
                        <Statistic title="累计循环" value={ess.cycles} suffix="次" />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="可放电量估算"
                          value={energyFormat((ess.soc / 100) * ess.capacityMwh * 1000)}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic title="分区" value={zoneName} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </ChartCard>
            </Col>
          )
        })}
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="储能清单" subtitle={`共 ${items.length} 套`} height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 1100 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑储能系统' : '新建储能系统'}
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
              <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
                <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacityMwh" label="容量(MWh)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="powerMw" label="额定功率(MW)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soc" label="SOC(%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="powerKw" label="实时功率(kW)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mode" label="模式" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'charge', label: '充电' },
                    { value: 'discharge', label: '放电' },
                    { value: 'idle', label: '空闲' },
                    { value: 'standby', label: '待机' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cycles" label="循环次数" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'normal', label: '正常' },
                    { value: 'fault', label: '故障' },
                    { value: 'maintenance', label: '维保' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
