import { useMemo, useState } from 'react'
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { ChartCard } from '@/components/ChartCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { emissionFactors } from '@/mock/carbon'
import { numFormat } from '@/utils/format'
import type { ColumnsType } from 'antd/es/table'
import type { EmissionFactor } from '@/mock/types'

type FactorFormValues = {
  name: string
  category: string
  fuelOrActivity: string
  value: number
  unit: string
  year: number
  region: string
  source: string
}

export default function FactorsPage() {
  const { items, create, update, remove } = useCrudList(emissionFactors, 'factor')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<EmissionFactor | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EmissionFactor | null>(null)
  const [form] = Form.useForm<FactorFormValues>()

  const categories = useMemo(
    () => Array.from(new Set(items.map((f) => f.category))),
    [items],
  )

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return items.filter((f) => {
      if (category && f.category !== category) return false
      if (!kw) return true
      return (
        f.name.toLowerCase().includes(kw) ||
        f.fuelOrActivity.toLowerCase().includes(kw) ||
        f.source.toLowerCase().includes(kw) ||
        f.region.toLowerCase().includes(kw)
      )
    })
  }, [items, keyword, category])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      name: '',
      category: categories[0] ?? '燃料燃烧',
      fuelOrActivity: '',
      value: 0,
      unit: 'tCO₂/t',
      year: new Date().getFullYear(),
      region: '全国',
      source: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row: EmissionFactor) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      category: row.category,
      fuelOrActivity: row.fuelOrActivity,
      value: row.value,
      unit: row.unit,
      year: row.year,
      region: row.region,
      source: row.source,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, values)
      if (current?.id === editing.id) setCurrent({ ...editing, ...values })
      message.success('因子已更新')
    } else {
      create(values)
      message.success('因子已创建')
    }
    setModalOpen(false)
  }

  const columns: ColumnsType<EmissionFactor> = [
    { title: '因子名称', dataIndex: 'name', ellipsis: true },
    { title: '类别', dataIndex: 'category', width: 100 },
    { title: '燃料/活动', dataIndex: 'fuelOrActivity', width: 120, ellipsis: true },
    {
      title: '数值',
      dataIndex: 'value',
      width: 110,
      render: (v: number) => numFormat(v, { digits: Math.abs(v) >= 10 ? 2 : 4 }),
    },
    { title: '单位', dataIndex: 'unit', width: 130, ellipsis: true },
    { title: '年份', dataIndex: 'year', width: 72 },
    { title: '地区', dataIndex: 'region', width: 80 },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, row) => (
        <CrudActions
          onView={() => {
            setCurrent(row)
            setOpen(true)
          }}
          viewLabel="详情"
          onEdit={() => openEdit(row)}
          onDelete={() => {
            remove(row.id)
            if (current?.id === row.id) {
              setOpen(false)
              setCurrent(null)
            }
            message.success('已删除因子')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="排放因子库"
        subtitle={`共 ${items.length} 条因子 · 当前筛选 ${filtered.length} 条`}
        breadcrumbs={[{ title: '碳排放管理' }, { title: '排放因子库' }]}
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="搜索名称 / 活动 / 来源"
              style={{ width: 240 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              allowClear
              placeholder="按类别筛选"
              style={{ width: 160 }}
              value={category}
              onChange={setCategory}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新建
            </Button>
          </Space>
        }
      />

      <ChartCard title="因子列表" height="auto">
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 960 }}
        />
      </ChartCard>

      <Drawer
        title={current?.name ?? '因子详情'}
        width={480}
        open={open}
        onClose={() => setOpen(false)}
      >
        {current && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="编号">{current.id}</Descriptions.Item>
            <Descriptions.Item label="名称">{current.name}</Descriptions.Item>
            <Descriptions.Item label="类别">{current.category}</Descriptions.Item>
            <Descriptions.Item label="燃料/活动">
              {current.fuelOrActivity}
            </Descriptions.Item>
            <Descriptions.Item label="因子值">
              {numFormat(current.value, {
                digits: Math.abs(current.value) >= 10 ? 2 : 6,
              })}
            </Descriptions.Item>
            <Descriptions.Item label="单位">{current.unit}</Descriptions.Item>
            <Descriptions.Item label="来源">{current.source}</Descriptions.Item>
            <Descriptions.Item label="年份">{current.year}</Descriptions.Item>
            <Descriptions.Item label="地区">{current.region}</Descriptions.Item>
            {current.gwp != null && (
              <Descriptions.Item label="GWP">{current.gwp}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title={editing ? '编辑排放因子' : '新建排放因子'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="因子名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：天然气排放因子" />
          </Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true, message: '请输入类别' }]}>
            <Input placeholder="如：燃料燃烧" list="factor-category-options" />
          </Form.Item>
          <datalist id="factor-category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Form.Item
            name="fuelOrActivity"
            label="燃料/活动"
            rules={[{ required: true, message: '请输入燃料或活动' }]}
          >
            <Input />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="value"
              label="数值"
              rules={[{ required: true, message: '请输入数值' }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="unit"
              label="单位"
              rules={[{ required: true, message: '请输入单位' }]}
              style={{ marginBottom: 0, minWidth: 160 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="year"
              label="年份"
              rules={[{ required: true, message: '请输入年份' }]}
              style={{ marginBottom: 0, minWidth: 120 }}
            >
              <InputNumber style={{ width: '100%' }} min={1990} max={2100} />
            </Form.Item>
          </Space>
          <Form.Item
            name="region"
            label="地区"
            rules={[{ required: true, message: '请输入地区' }]}
            style={{ marginTop: 16 }}
          >
            <Input />
          </Form.Item>
          <Form.Item name="source" label="来源" rules={[{ required: true, message: '请输入来源' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
