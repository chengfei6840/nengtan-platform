import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Col,
  Drawer,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import { PageHeader } from '@/components/PageHeader'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { ScopeCoverageAlert, ScopeLegend, ScopeTags } from '@/components/ScopeLegend'
import { useCarbon } from '@/context/CarbonContext'
import { scopeBreakdowns } from '@/mock/carbon'
import { chartColors } from '@/theme'
import { emissionFormat, numFormat } from '@/utils/format'
import { SCOPE_META, SCOPE_ORDER, scopeFull } from '@/utils/scopeLabels'
import type { ColumnsType } from 'antd/es/table'
import type { AccountingTask, ScopeType } from '@/mock/types'

const STATUS_LABEL: Record<AccountingTask['status'], string> = {
  draft: '草稿',
  collecting: '采集中',
  calculating: '核算中',
  reviewing: '审核中',
  locked: '已锁定',
  published: '已发布',
}

export default function AccountingPage() {
  const { tasks, createTask, updateTask, deleteTask, runCalc, approve } = useCarbon()
  const [open, setOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AccountingTask | null>(null)
  const [form] = Form.useForm()

  const current = useMemo(
    () => (currentId ? tasks.find((t) => t.id === currentId) ?? null : null),
    [tasks, currentId],
  )

  useEffect(() => {
    if (currentId && !tasks.some((t) => t.id === currentId)) {
      setCurrentId(null)
      setOpen(false)
    }
  }, [tasks, currentId])

  const openDetail = (task: AccountingTask) => {
    setCurrentId(task.id)
    setOpen(true)
  }

  const scopeAgg = useMemo(() => {
    const s1 = scopeBreakdowns.reduce((s, r) => s + r.scope1, 0)
    const s2 = scopeBreakdowns.reduce((s, r) => s + r.scope2, 0)
    const s3 = scopeBreakdowns.reduce((s, r) => s + r.scope3, 0)
    return { s1, s2, s3, total: s1 + s2 + s3 }
  }, [])

  const scopeOption = useMemo(() => {
    if (!current) return {}
    const data = current.scopeCoverage.map((sc) => ({
      name: scopeFull(sc),
      value: sc === 'scope1' ? scopeAgg.s1 : sc === 'scope2' ? scopeAgg.s2 : scopeAgg.s3,
    }))
    return {
      color: chartColors.series,
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) => {
          const key = SCOPE_ORDER.find((k) => scopeFull(k) === p.name)
          const hint = key ? SCOPE_META[key].hint : ''
          return `${p.name}<br/>${p.value} tCO₂e（${p.percent}%）<br/><span style="opacity:.85">${hint}</span>`
        },
      },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '64%'],
          center: ['50%', '42%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data,
        },
      ],
    }
  }, [current, scopeAgg])

  const columns: ColumnsType<AccountingTask> = [
    { title: '任务名称', dataIndex: 'name', ellipsis: true },
    { title: '年度', dataIndex: 'year', width: 72 },
    { title: '周期', dataIndex: 'period', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: AccountingTask['status']) => (
        <StatusTag status={s} label={STATUS_LABEL[s]} />
      ),
    },
    { title: '企业数', dataIndex: 'enterpriseCount', width: 70 },
    {
      title: '核算范围',
      dataIndex: 'scopeCoverage',
      width: 280,
      render: (scopes: ScopeType[]) => <ScopeTags scopes={scopes} />,
    },
    {
      title: '排放总量',
      dataIndex: 'totalEmission',
      width: 120,
      render: (v: number) => emissionFormat(v),
    },
    { title: '负责人', dataIndex: 'owner', width: 110 },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, row) => (
        <span onClick={(e) => e.stopPropagation()}>
          <CrudActions
            onView={() => openDetail(row)}
            viewLabel="详情"
            onEdit={() => openEdit(row)}
            onDelete={() => {
              deleteTask(row.id)
              message.success('已删除核算任务')
            }}
          />
        </span>
      ),
    },
  ]

  const onCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: `${new Date().getFullYear()}年专项碳核算`,
      year: new Date().getFullYear(),
      period: `${new Date().getFullYear()}Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      enterpriseCount: 24,
      scopeCoverage: ['scope1', 'scope2'],
      owner: '园区碳核算专员',
    })
    setModalOpen(true)
  }

  const openEdit = (row: AccountingTask) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      year: row.year,
      period: row.period,
      enterpriseCount: row.enterpriseCount,
      scopeCoverage: row.scopeCoverage,
      owner: row.owner,
    })
    setModalOpen(true)
  }

  const onModalOk = async () => {
    const values = await form.validateFields()
    if (editing) {
      updateTask(editing.id, {
        name: values.name,
        year: values.year,
        period: values.period,
        enterpriseCount: values.enterpriseCount,
        scopeCoverage: values.scopeCoverage,
        owner: values.owner,
      })
      setModalOpen(false)
      message.success(`已更新核算任务：${values.name}`)
      return
    }
    const task = createTask({
      name: values.name,
      year: values.year,
      period: values.period,
      enterpriseCount: values.enterpriseCount,
      scopeCoverage: values.scopeCoverage,
      owner: values.owner,
    })
    setModalOpen(false)
    setCurrentId(task.id)
    setOpen(true)
    message.success(`已创建核算任务：${task.name}`)
  }

  const onCalc = () => {
    if (!current) {
      message.warning('请先打开任务详情，再执行核算')
      return
    }
    if (!['draft', 'collecting', 'calculating'].includes(current.status)) {
      message.warning(`当前状态「${STATUS_LABEL[current.status]}」不可执行核算`)
      return
    }
    const updated = runCalc(current.id)
    if (!updated) return
    if (updated.status === 'calculating') {
      message.success(`已启动核算：${updated.name}（核算中）`)
    } else if (updated.status === 'reviewing') {
      message.success(
        `核算完成：${updated.name}，排放 ${emissionFormat(updated.totalEmission)}，已进入审核`,
      )
    }
  }

  const onApprove = () => {
    if (!current) {
      message.warning('请先打开任务详情，再审核')
      return
    }
    if (current.status !== 'reviewing' && current.status !== 'locked') {
      message.warning(`当前状态「${STATUS_LABEL[current.status]}」不可审核通过`)
      return
    }
    const updated = approve(current.id)
    if (updated?.status === 'published') {
      message.success(`已审核发布：${updated.name}`)
    }
  }

  const coveredAgg = useMemo(() => {
    if (!current) return []
    return current.scopeCoverage.map((sc) => ({
      key: sc,
      ...SCOPE_META[sc],
      value: sc === 'scope1' ? scopeAgg.s1 : sc === 'scope2' ? scopeAgg.s2 : scopeAgg.s3,
    }))
  }, [current, scopeAgg])

  return (
    <div>
      <PageHeader
        title="组织碳核算"
        subtitle="按组织边界盘查温室气体排放；范围一/二/三分别对应直接排放、外购能源间接排放、价值链其他间接排放"
        breadcrumbs={[{ title: '碳排放管理' }, { title: '组织碳核算' }]}
        extra={
          <Space>
            <Button onClick={onCreate}>新建任务</Button>
            <Button type="primary" onClick={onCalc}>
              执行核算
            </Button>
            <Button onClick={onApprove}>审核通过</Button>
          </Space>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <ScopeLegend />
      </div>

      <ChartCard
        title="核算任务列表"
        subtitle="鼠标悬停「核算范围」标签可查看该范围含义；点击行打开详情"
        height="auto"
      >
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          pagination={false}
          scroll={{ x: 1200 }}
          onRow={(row) => ({
            onClick: () => openDetail(row),
            style: { cursor: 'pointer' },
          })}
        />
      </ChartCard>

      <Drawer
        title={current?.name ?? '任务详情'}
        width={600}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button size="small" onClick={onCalc}>
              核算
            </Button>
            <Button size="small" type="primary" onClick={onApprove}>
              审批
            </Button>
          </Space>
        }
      >
        {current && (
          <>
            <ScopeCoverageAlert scopes={current.scopeCoverage} />

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="任务编号">{current.id}</Descriptions.Item>
              <Descriptions.Item label="年度 / 周期">
                {current.year} · {current.period}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={current.status} label={STATUS_LABEL[current.status]} />
              </Descriptions.Item>
              <Descriptions.Item label="企业数量">{current.enterpriseCount} 家</Descriptions.Item>
              <Descriptions.Item label="核算范围">
                <ScopeTags scopes={current.scopeCoverage} />
              </Descriptions.Item>
              <Descriptions.Item label="排放总量">
                {emissionFormat(current.totalEmission)}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">{current.owner}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{current.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{current.updatedAt}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <ChartCard
                title="本任务纳入范围的排放构成"
                subtitle={`示意：园区企业样本汇总 ${numFormat(scopeAgg.total, { digits: 0 })} tCO₂e，仅展示本任务已勾选的范围`}
                height={280}
              >
                <ReactECharts option={scopeOption} style={{ height: '100%', width: '100%' }} />
              </ChartCard>
            </div>

            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
              {coveredAgg.map((item) => (
                <Col span={8} key={item.key}>
                  <Tooltip title={`${item.hint}（举例：${item.examples}）`}>
                    <div
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        borderLeft: `3px solid ${
                          item.key === 'scope1'
                            ? '#ea580c'
                            : item.key === 'scope2'
                              ? '#2563eb'
                              : '#7c3aed'
                        }`,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#64748b' }}>{item.full}</div>
                      <div style={{ fontWeight: 600, marginTop: 4 }}>
                        {emissionFormat(item.value)}
                      </div>
                    </div>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Drawer>

      <Modal
        title={editing ? '编辑核算任务' : '新建核算任务'}
        open={modalOpen}
        onOk={onModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
        okText={editing ? '保存' : '创建'}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：2026年二季度碳核算" />
          </Form.Item>
          <Form.Item name="year" label="年度" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={2020} max={2035} />
          </Form.Item>
          <Form.Item name="period" label="周期" rules={[{ required: true }]}>
            <Input placeholder="如：2026Q2" />
          </Form.Item>
          <Form.Item name="enterpriseCount" label="企业数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={100} />
          </Form.Item>
          <Form.Item name="owner" label="负责人">
            <Input />
          </Form.Item>
          <Form.Item
            name="scopeCoverage"
            label="核算范围（可多选）"
            rules={[{ required: true, message: '请至少选择一个范围' }]}
            extra="范围一=厂内直接排；范围二=外购电/热/汽；范围三=供应链等间接排"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {SCOPE_ORDER.map((key) => {
                  const m = SCOPE_META[key]
                  return (
                    <Checkbox key={key} value={key} style={{ alignItems: 'flex-start' }}>
                      <div>
                        <strong>{m.full}</strong>
                        <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'normal' }}>
                          {m.hint}
                        </div>
                      </div>
                    </Checkbox>
                  )
                })}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
