import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useOps } from '@/context/OpsContext'
import { parkOverview } from '@/mock/park'
import { enterprisesById, enterprises } from '@/mock/enterprises'
import type { ColumnsType } from 'antd/es/table'
import type { Alarm, AlarmLevel, AlarmStatus, ZoneId } from '@/mock/types'

type AlarmFormValues = {
  title: string
  message: string
  level: AlarmLevel
  source: string
  sourceType: Alarm['sourceType']
  zoneId?: ZoneId
  enterpriseId?: string
  assignee?: string
}

export default function AlarmsPage() {
  const navigate = useNavigate()
  const {
    alarms,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    ackAlarm,
    closeAlarm,
    convertAlarmToOrder,
  } = useOps()
  const [levelFilter, setLevelFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Alarm | null>(null)
  const [form] = Form.useForm<AlarmFormValues>()

  const data = useMemo(() => {
    return alarms.filter((a) => {
      if (levelFilter && a.level !== levelFilter) return false
      if (statusFilter && a.status !== statusFilter) return false
      return true
    })
  }, [alarms, levelFilter, statusFilter])

  const kpis = useMemo(() => {
    return {
      open: alarms.filter((a) => a.status === 'open').length,
      ack: alarms.filter((a) => a.status === 'ack').length,
      closed: alarms.filter((a) => a.status === 'closed').length,
      critical: alarms.filter((a) => a.level === 'critical' && a.status !== 'closed').length,
    }
  }, [alarms])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      title: '',
      message: '',
      level: 'major',
      source: '',
      sourceType: 'energy',
      zoneId: undefined,
      enterpriseId: undefined,
      assignee: undefined,
    })
    setModalOpen(true)
  }

  const openEdit = (row: Alarm) => {
    setEditing(row)
    form.setFieldsValue({
      title: row.title,
      message: row.message,
      level: row.level,
      source: row.source,
      sourceType: row.sourceType,
      zoneId: row.zoneId,
      enterpriseId: row.enterpriseId,
      assignee: row.assignee,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateAlarm(editing.id, {
        title: values.title,
        message: values.message,
        level: values.level,
        source: values.source,
        sourceType: values.sourceType,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        assignee: values.assignee,
      })
      message.success('告警已更新')
    } else {
      createAlarm({
        title: values.title,
        message: values.message,
        level: values.level,
        source: values.source,
        sourceType: values.sourceType,
        zoneId: values.zoneId,
        enterpriseId: values.enterpriseId || undefined,
        assignee: values.assignee,
      })
      message.success('告警已创建')
    }
    setModalOpen(false)
  }

  const onAck = (id: string) => {
    ackAlarm(id)
    message.success('告警已确认')
  }

  const onClose = (id: string) => {
    closeAlarm(id)
    message.success('告警已关闭')
  }

  const onConvert = (id: string) => {
    const order = convertAlarmToOrder(id)
    if (!order) {
      message.error('转工单失败')
      return
    }
    message.success(`已转工单：${order.id}`)
    navigate('/ops/workorders')
  }

  const columns: ColumnsType<Alarm> = [
    {
      title: '级别',
      dataIndex: 'level',
      width: 90,
      render: (l: AlarmLevel) => <StatusTag status={l} />,
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '来源', dataIndex: 'source', width: 140, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'sourceType',
      width: 90,
    },
    {
      title: '分区',
      dataIndex: 'zoneId',
      width: 90,
      render: (z?: ZoneId) =>
        z ? parkOverview.zones.find((x) => x.id === z)?.name ?? z : '—',
    },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '—'),
    },
    { title: '触发时间', dataIndex: 'triggeredAt', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: AlarmStatus) => <StatusTag status={s} />,
    },
    { title: '负责人', dataIndex: 'assignee', width: 110, render: (v?: string) => v ?? '—' },
    {
      title: '操作',
      width: 280,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          {row.status === 'open' && (
            <Button type="link" size="small" onClick={() => onAck(row.id)}>
              确认
            </Button>
          )}
          {row.status !== 'closed' && (
            <Button type="link" size="small" onClick={() => onClose(row.id)}>
              关闭
            </Button>
          )}
          {row.status !== 'closed' && (
            <Button type="link" size="small" onClick={() => onConvert(row.id)}>
              转工单
            </Button>
          )}
          <CrudActions
            onEdit={() => openEdit(row)}
            onDelete={() => {
              deleteAlarm(row.id)
              message.success('已删除告警')
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="告警中心"
        subtitle={`共 ${alarms.length} 条 · 筛选后 ${data.length} 条`}
        breadcrumbs={[{ title: '运维管理' }, { title: '告警中心' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="未关闭" value={kpis.open} unit="条" trend="flat" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已确认" value={kpis.ack} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已关闭" value={kpis.closed} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="紧急未闭环" value={kpis.critical} unit="条" trend="up" />
        </Col>
      </Row>

      <Form layout="inline" style={{ marginTop: 16, marginBottom: 12, rowGap: 12 }}>
        <Form.Item label="级别">
          <Select
            allowClear
            style={{ width: 120 }}
            placeholder="全部级别"
            value={levelFilter}
            onChange={setLevelFilter}
            options={[
              { value: 'critical', label: '紧急' },
              { value: 'major', label: '重要' },
              { value: 'warning', label: '预警' },
              { value: 'minor', label: '次要' },
              { value: 'info', label: '提示' },
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
              { value: 'open', label: '未关闭' },
              { value: 'ack', label: '已确认' },
              { value: 'closed', label: '已关闭' },
            ]}
          />
        </Form.Item>
      </Form>

      <ChartCard title="告警列表" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={data}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ color: '#475569', padding: '4px 8px' }}>{record.message}</div>
            ),
          }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1400 }}
        />
      </ChartCard>

      <Modal
        title={editing ? '编辑告警' : '新建告警'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={640}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label="级别" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'critical', label: '紧急' },
                    { value: 'major', label: '重要' },
                    { value: 'warning', label: '预警' },
                    { value: 'minor', label: '次要' },
                    { value: 'info', label: '提示' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sourceType" label="来源类型" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'meter', label: '表计' },
                    { value: 'device', label: '设备' },
                    { value: 'system', label: '系统' },
                    { value: 'energy', label: '能源' },
                    { value: 'carbon', label: '碳排放' },
                    { value: 'renewable', label: '新能源' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="来源" rules={[{ required: true, message: '请输入来源' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignee" label="负责人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区">
                <Select
                  allowClear
                  options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enterpriseId" label="企业">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="message" label="详情" rules={[{ required: true, message: '请输入详情' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
