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
  Space,
  Table,
} from 'antd'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { parkOverview } from '@/mock/park'
import { monthlyEnergy } from '@/mock/energy'
import { pvInverters, pvStations as seedStations, pvSummary } from '@/mock/renewable'
import { chartColors } from '@/theme'
import { emissionFormat, energyFormat, numFormat, percentFormat } from '@/utils/format'
import { downloadCsv } from '@/utils/downloadCsv'
import type { ColumnsType } from 'antd/es/table'
import type { PvInverter, PvStation, ZoneId } from '@/mock/types'

type StationFormValues = {
  name: string
  zoneId: ZoneId
  capacityMw: number
  inverterCount: number
  todayGeneration: number
  monthGeneration: number
  yearGeneration: number
  irradiance: number
  pr: number
  status: PvStation['status']
}

export default function PvPage() {
  const { items: stations, create, update, remove } = useCrudList(seedStations, 'pv')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PvStation | null>(null)
  const [form] = Form.useForm<StationFormValues>()

  const genOption = useMemo(
    () => ({
      color: chartColors.series,
      tooltip: { trigger: 'axis' },
      legend: { data: ['光伏发电(万kWh)', '装机利用率示意(%)'] },
      grid: { left: 48, right: 48, top: 40, bottom: 32 },
      xAxis: {
        type: 'category',
        data: monthlyEnergy.map((m) => m.month),
        axisLabel: { rotate: 30, fontSize: 11 },
      },
      yAxis: [
        { type: 'value', name: '万kWh', splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '%', min: 0, max: 100, splitLine: { show: false } },
      ],
      series: [
        {
          name: '光伏发电(万kWh)',
          type: 'bar',
          barMaxWidth: 18,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: monthlyEnergy.map((m) => +(m.pvGeneration / 1e4).toFixed(2)),
        },
        {
          name: '装机利用率示意(%)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: monthlyEnergy.map((m) =>
            +((m.pvGeneration / (pvSummary.totalCapacityMw * 1000 * 30 * 4)) * 100).toFixed(1),
          ),
        },
      ],
    }),
    [],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      zoneId: 'zone-east',
      capacityMw: 1,
      inverterCount: 1,
      todayGeneration: 0,
      monthGeneration: 0,
      yearGeneration: 0,
      irradiance: 800,
      pr: 80,
      status: 'normal',
    })
    setModalOpen(true)
  }

  const openEdit = (row: PvStation) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      zoneId: row.zoneId,
      capacityMw: row.capacityMw,
      inverterCount: row.inverterCount,
      todayGeneration: row.todayGeneration,
      monthGeneration: row.monthGeneration,
      yearGeneration: row.yearGeneration,
      irradiance: row.irradiance,
      pr: row.pr,
      status: row.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, { ...values, buildingIds: editing.buildingIds })
      message.success('电站已更新')
    } else {
      create({
        ...values,
        buildingIds: [],
      })
      message.success('电站已创建')
    }
    setModalOpen(false)
  }

  const stationColumns: ColumnsType<PvStation> = [
    { title: '电站名称', dataIndex: 'name', ellipsis: true },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 100,
      render: (z: ZoneId) => parkOverview.zones.find((x) => x.id === z)?.name ?? z,
    },
    {
      title: '装机(MW)',
      dataIndex: 'capacityMw',
      width: 100,
      render: (v: number) => numFormat(v, { digits: 1 }),
    },
    { title: '逆变器(台)', dataIndex: 'inverterCount', width: 100 },
    {
      title: '今日发电',
      dataIndex: 'todayGeneration',
      width: 120,
      render: (v: number) => energyFormat(v),
      sorter: (a, b) => a.todayGeneration - b.todayGeneration,
    },
    {
      title: '本月发电',
      dataIndex: 'monthGeneration',
      width: 120,
      render: (v: number) => energyFormat(v),
    },
    {
      title: '年累计',
      dataIndex: 'yearGeneration',
      width: 120,
      render: (v: number) => energyFormat(v),
    },
    {
      title: '辐照(W/m²)',
      dataIndex: 'irradiance',
      width: 110,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: 'PR',
      dataIndex: 'pr',
      width: 80,
      render: (v: number) => percentFormat(v),
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
            message.success('已删除电站')
          }}
        />
      ),
    },
  ]

  const inverterColumns: ColumnsType<PvInverter> = [
    { title: '逆变器', dataIndex: 'name', width: 140 },
    {
      title: '所属电站',
      dataIndex: 'stationId',
      width: 160,
      render: (id: string) => stations.find((s) => s.id === id)?.name ?? id,
    },
    {
      title: '容量(kW)',
      dataIndex: 'capacityKw',
      width: 100,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '功率(kW)',
      dataIndex: 'powerKw',
      width: 100,
      render: (v: number) => numFormat(v, { digits: 0 }),
    },
    {
      title: '今日电量',
      dataIndex: 'todayKwh',
      width: 110,
      render: (v: number) => energyFormat(v),
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      width: 90,
      render: (v: number) => (v > 0 ? percentFormat(v) : '—'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="光伏电站"
        subtitle="园区分布式光伏运行监测 · Demo 数据"
        breadcrumbs={[{ title: '新能源' }, { title: '光伏' }]}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建电站
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                downloadCsv(
                  '光伏运行报表.csv',
                  ['电站', '分区', '装机(MW)', '今日发电(kWh)', '本月发电(kWh)', '状态'],
                  stations.map((s) => [
                    s.name,
                    parkOverview.zones.find((z) => z.id === s.zoneId)?.name ?? s.zoneId,
                    s.capacityMw,
                    s.todayGeneration,
                    s.monthGeneration,
                    s.status,
                  ]),
                )
                message.success(`已导出光伏运行报表（${stations.length} 座）`)
              }}
            >
              导出
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="总装机" value={pvSummary.totalCapacityMw} unit="MW" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="今日发电"
            value={numFormat(pvSummary.todayGeneration, { digits: 0 })}
            unit="kWh"
            trend="up"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="本月发电" value={energyFormat(pvSummary.monthGeneration)} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="年累计发电" value={energyFormat(pvSummary.yearGeneration)} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="自发自用率" value={pvSummary.selfUseRate} unit="%" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard
            title="今日上网"
            value={numFormat(pvSummary.gridExportToday, { digits: 0 })}
            unit="kWh"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="今日减排" value={emissionFormat(pvSummary.co2AvoidedToday)} />
        </Col>
        <Col xs={24} sm={12} md={8} xl={6}>
          <KpiCard title="年累计减排" value={emissionFormat(pvSummary.co2AvoidedYear)} />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="近12月光伏发电量" subtitle="园区汇总" height={320}>
          <ReactECharts option={genOption} style={{ height: '100%', width: '100%' }} />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="光伏电站列表" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={stationColumns}
            dataSource={stations}
            pagination={false}
            scroll={{ x: 1240 }}
          />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="逆变器运行状态" subtitle={`共 ${pvInverters.length} 台`} height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={inverterColumns}
            dataSource={pvInverters}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
            scroll={{ x: 900 }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editing ? '编辑电站' : '新建电站'}
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
              <Form.Item name="name" label="电站名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区" rules={[{ required: true }]}>
                <Select options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacityMw" label="装机(MW)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="inverterCount" label="逆变器台数" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="todayGeneration" label="今日发电(kWh)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthGeneration" label="本月发电(kWh)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="yearGeneration" label="年累计(kWh)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="irradiance" label="辐照(W/m²)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pr" label="PR(%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'normal', label: '正常' },
                    { value: 'partial', label: '部分异常' },
                    { value: 'fault', label: '故障' },
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
