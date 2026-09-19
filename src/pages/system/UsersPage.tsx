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
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/PageHeader'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusTag } from '@/components/StatusTag'
import { CrudActions } from '@/components/CrudActions'
import { useCrudList } from '@/hooks/useCrudList'
import { enterprisesById, enterprises } from '@/mock/enterprises'
import { sysRoles as seedRoles, sysUsers as seedUsers } from '@/mock/system'
import type { ColumnsType } from 'antd/es/table'
import type { SysRole, SysUser } from '@/mock/types'

type UserFormValues = {
  username: string
  name: string
  org: string
  roleIds: string[]
  enterpriseId?: string
  phone: string
  email: string
  status: SysUser['status']
  lastLoginAt: string
}

type RoleFormValues = {
  name: string
  code: string
  description: string
  permissionsText: string
}

export default function UsersPage() {
  const usersCrud = useCrudList(seedUsers, 'user')
  const rolesCrud = useCrudList(seedRoles, 'role')
  const [userModal, setUserModal] = useState(false)
  const [roleModal, setRoleModal] = useState(false)
  const [editingUser, setEditingUser] = useState<SysUser | null>(null)
  const [editingRole, setEditingRole] = useState<SysRole | null>(null)
  const [userForm] = Form.useForm<UserFormValues>()
  const [roleForm] = Form.useForm<RoleFormValues>()

  const roleMap = useMemo(
    () => Object.fromEntries(rolesCrud.items.map((r) => [r.id, r.name])) as Record<string, string>,
    [rolesCrud.items],
  )

  const active = usersCrud.items.filter((u) => u.status === 'active').length

  const openCreateUser = () => {
    setEditingUser(null)
    userForm.setFieldsValue({
      username: '',
      name: '',
      org: '园区运营中心',
      roleIds: [],
      enterpriseId: undefined,
      phone: '',
      email: '',
      status: 'active',
      lastLoginAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    setUserModal(true)
  }

  const openEditUser = (row: SysUser) => {
    setEditingUser(row)
    userForm.setFieldsValue({ ...row })
    setUserModal(true)
  }

  const submitUser = async () => {
    const values = await userForm.validateFields()
    if (editingUser) {
      usersCrud.update(editingUser.id, {
        ...values,
        enterpriseId: values.enterpriseId || undefined,
      })
      message.success('用户已更新')
    } else {
      usersCrud.create({
        ...values,
        enterpriseId: values.enterpriseId || undefined,
      })
      message.success('用户已创建')
    }
    setUserModal(false)
  }

  const openCreateRole = () => {
    setEditingRole(null)
    roleForm.setFieldsValue({
      name: '',
      code: '',
      description: '',
      permissionsText: 'read',
    })
    setRoleModal(true)
  }

  const openEditRole = (row: SysRole) => {
    setEditingRole(row)
    roleForm.setFieldsValue({
      name: row.name,
      code: row.code,
      description: row.description,
      permissionsText: row.permissions.join(','),
    })
    setRoleModal(true)
  }

  const submitRole = async () => {
    const values = await roleForm.validateFields()
    const permissions = values.permissionsText
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (editingRole) {
      rolesCrud.update(editingRole.id, {
        name: values.name,
        code: values.code,
        description: values.description,
        permissions,
      })
      message.success('角色已更新')
    } else {
      rolesCrud.create({
        name: values.name,
        code: values.code,
        description: values.description,
        permissions,
      })
      message.success('角色已创建')
    }
    setRoleModal(false)
  }

  const userColumns: ColumnsType<SysUser> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '组织', dataIndex: 'org', ellipsis: true },
    {
      title: '角色',
      dataIndex: 'roleIds',
      width: 200,
      render: (ids: string[]) => (
        <>
          {ids.map((id) => (
            <Tag key={id} style={{ marginBottom: 2 }}>
              {roleMap[id] ?? id}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '企业',
      dataIndex: 'enterpriseId',
      width: 120,
      render: (id?: string) => (id ? enterprisesById[id]?.shortName ?? id : '—'),
    },
    { title: '手机', dataIndex: 'phone', width: 130 },
    { title: '最近登录', dataIndex: 'lastLoginAt', width: 160 },
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
          onEdit={() => openEditUser(row)}
          onDelete={() => {
            usersCrud.remove(row.id)
            message.success('已删除用户')
          }}
        />
      ),
    },
  ]

  const roleColumns: ColumnsType<SysRole> = [
    { title: '角色名称', dataIndex: 'name', width: 140 },
    { title: '编码', dataIndex: 'code', width: 140 },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    {
      title: '权限数',
      dataIndex: 'permissions',
      width: 90,
      render: (p: string[]) => (p.includes('*') ? '全部' : p.length),
    },
    {
      title: '操作',
      width: 140,
      render: (_, row) => (
        <CrudActions
          onEdit={() => openEditRole(row)}
          onDelete={() => {
            rolesCrud.remove(row.id)
            message.success('已删除角色')
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="用户与权限"
        subtitle={`${usersCrud.items.length} 用户 · ${rolesCrud.items.length} 角色`}
        breadcrumbs={[{ title: '系统管理' }, { title: '用户与权限' }]}
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={openCreateRole}>
              新建角色
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUser}>
              新建用户
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="用户数" value={usersCrud.items.length} unit="人" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="启用中" value={active} unit="人" />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <KpiCard title="角色数" value={rolesCrud.items.length} unit="个" />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="用户列表" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={userColumns}
            dataSource={usersCrud.items}
            pagination={false}
            scroll={{ x: 1240 }}
          />
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChartCard title="角色定义" height="auto">
          <Table
            size="small"
            rowKey="id"
            columns={roleColumns}
            dataSource={rolesCrud.items}
            pagination={false}
            expandable={{
              expandedRowRender: (r) => (
                <div style={{ color: '#64748b' }}>权限：{r.permissions.join('、')}</div>
              ),
            }}
          />
        </ChartCard>
      </div>

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={userModal}
        onCancel={() => setUserModal(false)}
        onOk={() => void submitUser()}
        destroyOnHidden
        width={640}
        okText="保存"
      >
        <Form form={userForm} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="org" label="组织" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'active', label: '启用' },
                    { value: 'disabled', label: '停用' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="roleIds" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
                <Select
                  mode="multiple"
                  options={rolesCrud.items.map((r) => ({ value: r.id, label: r.name }))}
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
            <Col span={12}>
              <Form.Item name="phone" label="手机" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastLoginAt" label="最近登录" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={roleModal}
        onCancel={() => setRoleModal(false)}
        onOk={() => void submitRole()}
        destroyOnHidden
        width={560}
        okText="保存"
      >
        <Form form={roleForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="permissionsText"
            label="权限（逗号分隔，* 表示全部）"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder="如 read,write 或 *" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
