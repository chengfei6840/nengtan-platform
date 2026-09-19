import { Layout, Menu, Select, Space, Typography, theme } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { menuGroups } from './menuConfig'
import { useDemo } from '@/context/DemoContext'
import { parkOverview } from '@/mock/park'
import type { PeriodType } from '@/mock/types'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { period, setPeriod, zoneId, setZoneId } = useDemo()
  const { token } = theme.useToken()

  const selectedKeys = useMemo(() => {
    const leaf = menuGroups.flatMap((g) => g.children).find((c) => location.pathname.startsWith(c.path))
    return leaf ? [leaf.key] : []
  }, [location.pathname])

  const openKeysDefault = useMemo(() => {
    const group = menuGroups.find((g) => g.children.some((c) => location.pathname.startsWith(c.path)))
    return group ? [group.key] : ['cockpit']
  }, [location.pathname])

  const [openKeys, setOpenKeys] = useState<string[]>(openKeysDefault)

  const items = menuGroups.map((g) => ({
    key: g.key,
    icon: g.icon,
    label: g.label,
    children: g.children.map((c) => ({
      key: c.key,
      label: c.label,
      onClick: () => navigate(c.path),
    })),
  }))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={232}
        theme="dark"
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        <div
          style={{
            height: 56,
            margin: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 15,
            letterSpacing: 0.5,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            能
          </span>
          {!collapsed && <span>能碳管理平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={setOpenKeys}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: token.colorPrimary,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Space size={16}>
            <Text strong style={{ color: '#fff', fontSize: 16 }}>
              能碳管理平台
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              {parkOverview.name} · {parkOverview.city}
              {parkOverview.district} · {parkOverview.areaKm2} km²
            </Text>
          </Space>
          <Space>
            <Select
              value={zoneId}
              onChange={setZoneId}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部片区' },
                ...parkOverview.zones.map((z) => ({ value: z.id, label: z.name })),
              ]}
            />
            <Select
              value={period}
              onChange={(v: PeriodType) => setPeriod(v)}
              style={{ width: 110 }}
              options={[
                { value: 'day', label: '日统计' },
                { value: 'month', label: '月统计' },
                { value: 'year', label: '年统计' },
              ]}
            />
          </Space>
        </Header>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: 20,
              minHeight: 'calc(100vh - 56px - 32px)',
              boxShadow: '0 1px 2px rgba(15, 118, 110, 0.06)',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
