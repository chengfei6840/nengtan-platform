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
  Space,
  Table,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { carbonAssets } from '@/mock/carbon'
import { moneyFormat, numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { CarbonAsset } from '@/mock/types'

const TYPE_LABEL: Record<CarbonAsset['type'], string> = {
  quota: '碳配额',
  ccer: 'CCER',
  green_cert: '绿证',
  gec: 'GEC',
}

const STATUS_LABEL: Record<CarbonAsset['status'], string> = {
  holding: '持有中',
  trading: '交易中',
  retired: '已注销',
  pending: '待确认',
}

type AssetFormValues = {
  name: string
  type: CarbonAsset['type']
  quantity: number
  unit: string
  vintage: number
  status: CarbonAsset['status']
  price: number
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

export default function AssetsPage() {
  const { items, create, update, remove } = useCrudList(carbonAssets, 'asset')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CarbonAsset | null>(null)
  const [form] = Form.useForm<AssetFormValues>()

  const summary = useMemo(() => {
    const byType = {
      quota: items.filter((a) => a.type === 'quota'),
      ccer: items.filter((a) => a.type === 'ccer'),
      green_cert: items.filter((a) => a.type === 'green_cert'),
      gec: items.filter((a) => a.type === 'gec'),
    }
    const holding = items.filter((a) => a.status === 'holding')
    const marketValue = items
      .filter((a) => a.status === 'holding' || a.status === 'trading')
      .reduce((s, a) => s + a.quantity * a.price, 0)
    return {
      total: items.length,
      quotaQty: byType.quota.reduce((s, a) => s + a.quantity, 0),
      ccerQty: byType.ccer.reduce((s, a) => s + a.quantity, 0),
      greenQty:
        byType.green_cert.reduce((s, a) => s + a.quantity, 0) +
        byType.gec.reduce((s, a) => s + a.quantity, 0),
      holdingCount: holding.length,
      marketValue,
    }
  }, [items])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      type: 'quota',
      quantity: 0,
      unit: 'tCO₂',
      vintage: new Date().getFullYear(),
      status: 'holding',
      price: 0,
    })
    setModalOpen(true)
  }

  const openEdit = (row: CarbonAsset) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      type: row.type,
      quantity: row.quantity,
      unit: row.unit,
      vintage: row.vintage,
      status: row.status,
      price: row.price,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, { ...values, updatedAt: todayStamp() })
      message.success('碳资产已更新')
    } else {
      create({
        ...values,
        source: '演示录入',
        updatedAt: todayStamp(),
      })
      message.success('碳资产已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<CarbonAsset> = [
    { title: '资产名称', dataIndex: 'name', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (t: CarbonAsset['type']) => TYPE_LABEL[t],
      filters: (Object.keys(TYPE_LABEL) as CarbonAsset['type'][]).map((t) => ({
        text: TYPE_LABEL[t],
        value: t,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 110,
      render: (v: number, row) => `${numFormat(v, { digits: 0 })} ${row.unit}`,
    },
    { title: '年份', dataIndex: 'vintage', width: 72 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: CarbonAsset['status']) => (
        <StatusTag status={s} label={STATUS_LABEL[s]} />
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 100,
      render: (v: number) => `${numFormat(v, { digits: 1 })} 元`,
    },
    {
      title: '估值',
      width: 120,
      render: (_, row) => moneyFormat(row.quantity * row.price, { unit: '元', digits: 0 }),
    },
    { title: '来源', dataIndex: 'source', ellipsis: true },
    { title: '更新', dataIndex: 'updatedAt', width: 110 },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            message.success('已删除碳资产')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="碳资产"
        subtitle="配额 / CCER / 绿证 / GEC 持仓与估值（演示）"
        breadcrumbs={[{ title: '碳排放管理' }, { title: '碳资产' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="资产条目" value={summary.total} unit="笔" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="配额总量"
            value={numFormat(summary.quotaQty, { digits: 0 })}
            unit="tCO₂"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="CCER 总量"
            value={numFormat(summary.ccerQty, { digits: 0 })}
            unit="tCO₂e"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="绿证/GEC"
            value={numFormat(summary.greenQty, { digits: 0 })}
            unit="张/MWh"
          />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard title="持有中" value={summary.holdingCount} unit="笔" />
        </Col>
        <Col xs={24} sm={12} md={8} xl={4}>
          <KpiCard
            title="持仓估值"
            value={numFormat(summary.marketValue / 10000, { digits: 1 })}
            unit="万元"
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="资产明细" height="auto">
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
        title={editing ? '编辑碳资产' : '新建碳资产'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="资产名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <Select
                options={(Object.keys(TYPE_LABEL) as CarbonAsset['type'][]).map((t) => ({
                  value: t,
                  label: TYPE_LABEL[t],
                }))}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <Select
                options={(Object.keys(STATUS_LABEL) as CarbonAsset['status'][]).map((s) => ({
                  value: s,
                  label: STATUS_LABEL[s],
                }))}
              />
            </Form.Item>
          </Space>
          <Space wrap style={{ width: '100%', marginTop: 16 }} size="middle">
            <Form.Item
              name="quantity"
              label="数量"
              rules={[{ required: true, message: '请输入数量' }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="unit"
              label="单位"
              rules={[{ required: true, message: '请输入单位' }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="vintage"
              label="年份"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
            </Form.Item>
            <Form.Item
              name="price"
              label="单价(元)"
              rules={[{ required: true }]}
              style={{ marginBottom: 0, minWidth: 140 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
