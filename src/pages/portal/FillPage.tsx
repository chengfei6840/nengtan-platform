import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Table,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { usePortal, validateFillForm } from '@/context/PortalContext'
import { enterprises } from '@/mock/enterprises'
import { enterprisesById } from '@/mock/enterprises'
import { percentFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { FillDataLine, FillFormData, FillTask, FillTaskStatus } from '@/mock/types'

const STATUS_LABEL: Record<FillTaskStatus, string> = {
  pending: '待填报',
  draft: '草稿',
  submitted: '已提交',
  rejected: '已驳回',
  approved: '已通过',
}

const STATUS_TONE: Record<FillTaskStatus, string> = {
  pending: 'pending',
  draft: 'idle',
  submitted: 'processing',
  rejected: 'fault',
  approved: 'done',
}

const EDITABLE: FillTaskStatus[] = ['pending', 'draft', 'rejected']

const DATA_TYPES = ['能耗与产量', '供应链排放', '用电快报', '过程排放']

const LINE_CATEGORIES = ['电', '天然气', '蒸汽', '水', '柴油', '其他']
const LINE_SOURCES = ['表计', '账单', '估算', '台账', '其他']

const CATEGORY_UNIT: Record<string, string> = {
  电: 'kWh',
  天然气: 'Nm³',
  蒸汽: 't',
  水: 't',
  柴油: 'kg',
  其他: '',
}

function FillFormFields({ dataType }: { dataType: string }) {
  if (dataType === '能耗与产量') {
    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="electricityKwh" label="用电量合计 (kWh)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="可由明细自动汇总" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="naturalGasNm3" label="天然气合计 (Nm³)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="steamTon" label="蒸汽合计 (t)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="waterTon" label="用水量合计 (t)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dieselKg" label="柴油合计 (kg)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="outputValueWan" label="产值 (万元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="productOutput" label="产量 (件/吨)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    )
  }
  if (dataType === '供应链排放') {
    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="purchasedGoodsTco2e"
            label="外购商品排放 (tCO₂e)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="upstreamTransportTco2e" label="上游运输 (tCO₂e)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="employeeCommuteTco2e" label="员工通勤 (tCO₂e)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="wasteDisposalTco2e" label="废弃物处理 (tCO₂e)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    )
  }
  if (dataType === '用电快报') {
    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="electricityKwh" label="本周用电 (kWh)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="peakLoadKw" label="峰值负荷 (kW)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    )
  }
  if (dataType === '过程排放') {
    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="sf6Kg" label="SF₆ (kg)">
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nf3Kg" label="NF₃ (kg)">
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="otherProcessTco2e" label="其他过程排放 (tCO₂e)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    )
  }
  return (
    <Form.Item name="note" label="填报内容" rules={[{ required: true }]}>
      <Input.TextArea rows={4} />
    </Form.Item>
  )
}

function FormDataSummary({ data, dataType }: { data?: FillFormData; dataType: string }) {
  if (!data) return <div style={{ color: '#94a3b8' }}>尚未填写表单数据</div>
  const rows: Array<[string, string]> = []
  if (data.electricityKwh != null) rows.push(['用电量', `${data.electricityKwh} kWh`])
  if (data.naturalGasNm3 != null) rows.push(['天然气', `${data.naturalGasNm3} Nm³`])
  if (data.steamTon != null) rows.push(['蒸汽', `${data.steamTon} t`])
  if (data.waterTon != null) rows.push(['用水', `${data.waterTon} t`])
  if (data.dieselKg != null) rows.push(['柴油', `${data.dieselKg} kg`])
  if (data.outputValueWan != null) rows.push(['产值', `${data.outputValueWan} 万元`])
  if (data.productOutput != null) rows.push(['产量', String(data.productOutput)])
  if (dataType === '供应链排放') {
    if (data.purchasedGoodsTco2e != null) rows.push(['外购商品', `${data.purchasedGoodsTco2e} tCO₂e`])
    if (data.upstreamTransportTco2e != null)
      rows.push(['上游运输', `${data.upstreamTransportTco2e} tCO₂e`])
  }
  if (data.peakLoadKw != null) rows.push(['峰值负荷', `${data.peakLoadKw} kW`])
  if (data.sf6Kg != null) rows.push(['SF₆', `${data.sf6Kg} kg`])
  if (data.nf3Kg != null) rows.push(['NF₃', `${data.nf3Kg} kg`])
  if (data.otherProcessTco2e != null) rows.push(['其他过程', `${data.otherProcessTco2e} tCO₂e`])
  if (data.note) rows.push(['说明', data.note])
  if (data.fillerName) rows.push(['填报人', data.fillerName])
  if (data.updatedAt) rows.push(['更新时间', data.updatedAt])

  return (
    <>
      {rows.length ? (
        <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
          {rows.map(([k, v]) => (
            <Descriptions.Item key={k} label={k}>
              {v}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <div style={{ color: '#94a3b8', marginBottom: 12 }}>无汇总字段</div>
      )}
      {(data.lines?.length ?? 0) > 0 && (
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={data.lines}
          columns={[
            { title: '类别', dataIndex: 'category', width: 80 },
            { title: '分项', dataIndex: 'itemName' },
            { title: '数量', dataIndex: 'quantity', width: 100 },
            { title: '单位', dataIndex: 'unit', width: 70 },
            { title: '来源', dataIndex: 'source', width: 80 },
          ]}
        />
      )}
    </>
  )
}

export default function FillPage() {
  const {
    fillTasks,
    createFillTask,
    updateFillTask,
    deleteFillTask,
    saveFillDraft,
    submitFill,
    approveFill,
    rejectFill,
    upsertFillLine,
    deleteFillLine,
  } = usePortal()

  const [open, setOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [metaOpen, setMetaOpen] = useState(false)
  const [lineOpen, setLineOpen] = useState(false)
  const [editingLine, setEditingLine] = useState<FillDataLine | null>(null)

  const [form] = Form.useForm<FillFormData>()
  const [createForm] = Form.useForm()
  const [metaForm] = Form.useForm()
  const [lineForm] = Form.useForm<FillDataLine>()

  const current = useMemo(
    () => (currentId ? fillTasks.find((t) => t.id === currentId) ?? null : null),
    [fillTasks, currentId],
  )

  const editable = current ? EDITABLE.includes(current.status) : false
  const reviewable = current?.status === 'submitted'
  const lines = current?.formData?.lines ?? []

  useEffect(() => {
    if (!current) return
    form.setFieldsValue(current.formData ?? {})
  }, [current, form])

  const summary = useMemo(() => {
    const approved = fillTasks.filter((t) => t.status === 'approved').length
    const pending = fillTasks.filter(
      (t) => t.status === 'pending' || t.status === 'draft' || t.status === 'rejected',
    ).length
    const submitted = fillTasks.filter((t) => t.status === 'submitted').length
    const progress = fillTasks.length ? (approved / fillTasks.length) * 100 : 0
    return { approved, pending, submitted, progress }
  }, [fillTasks])

  const openTask = (row: FillTask) => {
    setCurrentId(row.id)
    setOpen(true)
  }

  const onSaveDraft = async () => {
    if (!current) return
    const values = form.getFieldsValue(true) as FillFormData
    saveFillDraft(current.id, { ...values, lines: current.formData?.lines ?? [] })
    message.success('已保存草稿')
  }

  const onSubmit = async () => {
    if (!current) return
    const values = (await form.validateFields()) as FillFormData
    const merged = { ...values, lines: current.formData?.lines ?? [] }
    const err = validateFillForm(current.dataType, merged)
    if (err) {
      message.warning(err)
      return
    }
    const ok = submitFill(current.id, merged)
    if (ok) message.success(`已提交填报：${current.title}`)
    else message.warning('提交失败，请检查必填项')
  }

  const onCreateOk = async () => {
    const values = await createForm.validateFields()
    const task = createFillTask({
      enterpriseId: values.enterpriseId,
      title: values.title,
      period: values.period,
      dataType: values.dataType,
      deadline: values.deadline.format('YYYY-MM-DD'),
    })
    setCreateOpen(false)
    createForm.resetFields()
    message.success('已新建填报任务')
    openTask(task)
  }

  const onMetaOk = async () => {
    if (!current) return
    const values = await metaForm.validateFields()
    updateFillTask(current.id, {
      title: values.title,
      period: values.period,
      dataType: values.dataType,
      deadline: values.deadline.format('YYYY-MM-DD'),
    })
    setMetaOpen(false)
    message.success('已更新任务信息')
  }

  const openLineEditor = (line?: FillDataLine) => {
    setEditingLine(line ?? null)
    lineForm.setFieldsValue(
      line ?? {
        category: '电',
        itemName: '',
        quantity: undefined,
        unit: 'kWh',
        source: '表计',
        remark: '',
      },
    )
    setLineOpen(true)
  }

  const onLineOk = async () => {
    if (!current) return
    const values = await lineForm.validateFields()
    const line: FillDataLine = {
      id: editingLine?.id ?? `fl-${Date.now()}`,
      category: values.category,
      itemName: values.itemName,
      quantity: values.quantity,
      unit: values.unit || CATEGORY_UNIT[values.category] || '',
      source: values.source,
      remark: values.remark,
    }
    upsertFillLine(current.id, line)
    setLineOpen(false)
    message.success(editingLine ? '已更新明细' : '已新增明细')
  }

  const columns: ColumnsType<FillTask> = [
    { title: '任务标题', dataIndex: 'title', ellipsis: true },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id: string) => enterprisesById[id]?.shortName ?? id,
    },
    { title: '周期', dataIndex: 'period', width: 90 },
    { title: '数据类型', dataIndex: 'dataType', width: 110 },
    {
      title: '明细行',
      width: 70,
      render: (_, row) => row.formData?.lines?.length ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: FillTaskStatus) => (
        <StatusTag status={STATUS_TONE[s]} label={STATUS_LABEL[s]} />
      ),
    },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      render: (_, row) => (
        <Space size={0} wrap>
          <Button type="link" size="small" onClick={() => openTask(row)}>
            {EDITABLE.includes(row.status)
              ? '填写'
              : row.status === 'submitted'
                ? '审核'
                : '查看'}
          </Button>
          {EDITABLE.includes(row.status) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setCurrentId(row.id)
                metaForm.setFieldsValue({
                  title: row.title,
                  period: row.period,
                  dataType: row.dataType,
                  deadline: dayjs(row.deadline),
                })
                setMetaOpen(true)
              }}
            >
              编辑
            </Button>
          )}
          {row.status !== 'approved' && (
            <Popconfirm
              title="确认删除该填报任务？"
              onConfirm={() => {
                deleteFillTask(row.id)
                if (currentId === row.id) setOpen(false)
                message.success('已删除')
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const lineColumns: ColumnsType<FillDataLine> = [
    { title: '类别', dataIndex: 'category', width: 70 },
    { title: '分项名称', dataIndex: 'itemName', ellipsis: true },
    { title: '数量', dataIndex: 'quantity', width: 90 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '来源', dataIndex: 'source', width: 70 },
    ...(editable
      ? [
          {
            title: '操作',
            width: 120,
            render: (_: unknown, row: FillDataLine) => (
              <Space size={0}>
                <Button type="link" size="small" onClick={() => openLineEditor(row)}>
                  改
                </Button>
                <Popconfirm
                  title="删除该明细行？"
                  onConfirm={() => {
                    if (!current) return
                    deleteFillLine(current.id, row.id)
                    message.success('已删除明细')
                  }}
                >
                  <Button type="link" size="small" danger>
                    删
                  </Button>
                </Popconfirm>
              </Space>
            ),
          } as ColumnsType<FillDataLine>[number],
        ]
      : []),
  ]

  const entName = current
    ? enterprisesById[current.enterpriseId]?.shortName ?? current.enterpriseId
    : ''

  return (
    <div>
      <PageHeader
        title="数据填报"
        subtitle={`共 ${fillTasks.length} 项任务 · 通过率 ${percentFormat(summary.progress)}`}
        breadcrumbs={[{ title: '企业门户' }, { title: '数据填报' }]}
        extra={
          <Button
            type="primary"
            onClick={() => {
              createForm.setFieldsValue({
                dataType: '能耗与产量',
                period: dayjs().format('YYYY-MM'),
                deadline: dayjs().add(7, 'day'),
              })
              setCreateOpen(true)
            }}
          >
            新建填报
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="任务总数" value={fillTasks.length} unit="项" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="待处理" value={summary.pending} unit="项" trend="flat" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="待审核" value={summary.submitted} unit="项" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="已通过" value={summary.approved} unit="项" />
        </Col>
      </Row>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <ChartCard title="整体填报进度" height="auto">
          <Progress
            percent={+summary.progress.toFixed(1)}
            status={summary.progress >= 100 ? 'success' : 'active'}
            strokeColor="#0d9488"
          />
        </ChartCard>
      </div>

      <ChartCard title="填报任务清单" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={fillTasks}
          expandable={{
            expandedRowRender: (r) =>
              r.remark ? (
                <div style={{ color: '#b45309' }}>备注：{r.remark}</div>
              ) : (
                <div style={{ color: '#94a3b8' }}>无备注</div>
              ),
          }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1100 }}
        />
      </ChartCard>

      <Drawer
        title={current ? `${current.title} · ${entName}` : '填报表单'}
        width={640}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
        extra={
          editable ? (
            <Space>
              <Button onClick={onSaveDraft}>存草稿</Button>
              <Button type="primary" onClick={onSubmit}>
                提交
              </Button>
            </Space>
          ) : reviewable ? (
            <Space>
              <Button
                danger
                onClick={() => {
                  if (!current) return
                  rejectFill(current.id)
                  message.warning(`已驳回：${current.title}`)
                }}
              >
                驳回
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (!current) return
                  approveFill(current.id)
                  message.success(`已通过：${current.title}`)
                }}
              >
                通过
              </Button>
            </Space>
          ) : null
        }
      >
        {current && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="企业">{entName}</Descriptions.Item>
              <Descriptions.Item label="周期">{current.period}</Descriptions.Item>
              <Descriptions.Item label="数据类型">{current.dataType}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{current.deadline}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag
                  status={STATUS_TONE[current.status]}
                  label={STATUS_LABEL[current.status]}
                />
              </Descriptions.Item>
              {current.remark && (
                <Descriptions.Item label="审核备注">
                  <span style={{ color: '#b45309' }}>{current.remark}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {editable ? (
              <>
                <Form form={form} layout="vertical">
                  <FillFormFields dataType={current.dataType} />
                  <Form.Item name="fillerName" label="填报人" rules={[{ required: true }]}>
                    <Input placeholder="姓名" />
                  </Form.Item>
                  <Form.Item name="note" label="补充说明">
                    <Input.TextArea rows={2} placeholder="分项口径、估算方法、异常说明等" />
                  </Form.Item>
                </Form>

                {(current.dataType === '能耗与产量' || current.dataType === '用电快报') && (
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <strong>活动数据明细</strong>
                      <Button size="small" type="dashed" onClick={() => openLineEditor()}>
                        新增明细
                      </Button>
                    </div>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={lines}
                      columns={lineColumns}
                      locale={{ emptyText: '暂无明细，可点击新增' }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ margin: '4px 0 8px', fontWeight: 600, color: '#334155' }}>
                  已填报数据
                </div>
                <FormDataSummary data={current.formData} dataType={current.dataType} />
              </>
            )}
          </>
        )}
      </Drawer>

      <Modal
        title="新建填报任务"
        open={createOpen}
        onOk={onCreateOk}
        onCancel={() => setCreateOpen(false)}
        destroyOnHidden
        okText="创建"
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={enterprises.map((e) => ({ value: e.id, label: e.shortName }))}
            />
          </Form.Item>
          <Form.Item name="title" label="任务标题" rules={[{ required: true }]}>
            <Input placeholder="如：2026年3月活动数据填报" />
          </Form.Item>
          <Form.Item name="period" label="周期" rules={[{ required: true }]}>
            <Input placeholder="如：2026-03" />
          </Form.Item>
          <Form.Item name="dataType" label="数据类型" rules={[{ required: true }]}>
            <Select options={DATA_TYPES.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑任务信息"
        open={metaOpen}
        onOk={onMetaOk}
        onCancel={() => setMetaOpen(false)}
        destroyOnHidden
      >
        <Form form={metaForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="title" label="任务标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="period" label="周期" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dataType" label="数据类型" rules={[{ required: true }]}>
            <Select options={DATA_TYPES.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingLine ? '编辑明细' : '新增明细'}
        open={lineOpen}
        onOk={onLineOk}
        onCancel={() => setLineOpen(false)}
        destroyOnHidden
      >
        <Form form={lineForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="category" label="能源/活动类别" rules={[{ required: true }]}>
            <Select
              options={LINE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(v) => lineForm.setFieldValue('unit', CATEGORY_UNIT[v] ?? '')}
            />
          </Form.Item>
          <Form.Item name="itemName" label="分项名称" rules={[{ required: true }]}>
            <Input placeholder="如：生产总表 / 锅炉用气" />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="source" label="数据来源">
            <Select options={LINE_SOURCES.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
