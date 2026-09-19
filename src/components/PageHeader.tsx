import { Breadcrumb, Flex, Space, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Title, Text } = Typography

export interface PageHeaderBreadcrumb {
  title: string
  path?: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: PageHeaderBreadcrumb[]
  extra?: ReactNode
  tags?: ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, extra, tags }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 8 }}
          items={breadcrumbs.map((b) => ({ title: b.title, href: b.path }))}
        />
      )}
      <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
        <Space direction="vertical" size={4}>
          <Flex align="center" gap={12} wrap="wrap">
            <Title level={3} style={{ margin: 0, color: '#134e4a' }}>
              {title}
            </Title>
            {tags}
          </Flex>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          )}
        </Space>
        {extra && <Space wrap>{extra}</Space>}
      </Flex>
    </div>
  )
}
