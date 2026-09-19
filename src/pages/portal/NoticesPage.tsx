import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { notices as seedNotices } from '@/mock/enterprisePortal'
import { parkOverview } from '@/mock/park'
import type { Notice, ZoneId } from '@/mock/types'

const TYPE_COLOR: Record<string, string> = {
  通知: 'teal',
  公告: 'blue',
  预警: 'orange',
  政策: 'purple',
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: '全部企业',
  key_energy: '重点用能单位',
  key_emission: '重点排放单位',
  zone: '指定分区',
}

type NoticeFormValues = {
  title: string
  type: Notice['type']
  audience: Notice['audience']
  zoneId?: ZoneId
  content: string
  pinned: boolean
  publishedAt: string
}

export default function NoticesPage() {
  const { items, create, update, remove } = useCrudList(seedNotices, 'notice')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form] = Form.useForm<NoticeFormValues>()

  const pinned = items.filter((n) => n.pinned)
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.publishedAt.localeCompare(a.publishedAt)
      }),
    [items],
  )

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue({
      title: '',
      type: '通知',
      audience: 'all',
      zoneId: undefined,
      content: '',
      pinned: false,
      publishedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    setModalOpen(true)
  }

  const openEdit = (row: Notice) => {
    setEditing(row)
    form.setFieldsValue({ ...row })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      update(editing.id, {
        ...values,
        zoneId: values.audience === 'zone' ? values.zoneId : undefined,
      })
      message.success('通知已更新')
    } else {
      create({
        ...values,
        zoneId: values.audience === 'zone' ? values.zoneId : undefined,
      })
      message.success('通知已创建')
    }
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="通知公告"
        subtitle={`共 ${items.length} 条 · 置顶 ${pinned.length} 条`}
        breadcrumbs={[{ title: '企业门户' }, { title: '通知公告' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="通知总数" value={items.length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="置顶" value={pinned.length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="预警类" value={items.filter((n) => n.type === '预警').length} unit="条" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard title="政策类" value={items.filter((n) => n.type === '政策').length} unit="条" />
        </Col>
      </Row>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
        dataSource={sorted}
        renderItem={(item) => (
          <List.Item>
            <Card
              size="small"
              title={
                <span>
                  {item.pinned && (
                    <Tag color="gold" style={{ marginRight: 8 }}>
                      置顶
                    </Tag>
                  )}
                  {item.title}
                </span>
              }
              extra={
                <Space>
                  <Tag color={TYPE_COLOR[item.type] ?? 'default'}>{item.type}</Tag>
                  <CrudActions
                    onEdit={() => openEdit(item)}
                    onDelete={() => {
                      remove(item.id)
                      message.success('已删除通知')
                    }}
                  />
                </Space>
              }
            >
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>
                {item.publishedAt} · {AUDIENCE_LABEL[item.audience] ?? item.audience}
                {item.zoneId
                  ? `（${parkOverview.zones.find((z) => z.id === item.zoneId)?.name ?? item.zoneId}）`
                  : ''}
              </div>
              <div style={{ color: '#334155', lineHeight: 1.6 }}>{item.content}</div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editing ? '编辑通知' : '新建通知'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        destroyOnHidden
        width={640}
        okText="保存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '通知', label: '通知' },
                    { value: '公告', label: '公告' },
                    { value: '预警', label: '预警' },
                    { value: '政策', label: '政策' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="audience" label="受众" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'all', label: '全部企业' },
                    { value: 'key_energy', label: '重点用能单位' },
                    { value: 'key_emission', label: '重点排放单位' },
                    { value: 'zone', label: '指定分区' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="zoneId" label="分区" dependencies={['audience']}>
                <Select
                  allowClear
                  options={parkOverview.zones.map((z) => ({ value: z.id, label: z.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publishedAt" label="发布时间" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pinned" label="置顶" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
