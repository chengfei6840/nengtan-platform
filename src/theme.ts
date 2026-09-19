import type { ThemeConfig } from 'antd'

/** 工业青绿主题 — 能碳管理平台 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0d9488',
    colorInfo: '#0891b2',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorLink: '#0f766e',
    colorTextBase: '#134e4a',
    colorBgBase: '#f8fafc',
    borderRadius: 8,
    fontFamily:
      '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, -apple-system, sans-serif',
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#0f766e',
      siderBg: '#134e4a',
      bodyBg: '#f1f5f9',
      triggerBg: '#0d9488',
    },
    Menu: {
      darkItemBg: '#134e4a',
      darkSubMenuItemBg: '#0f766e',
      darkItemSelectedBg: '#0d9488',
      darkItemHoverBg: '#0f766e',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(13, 148, 136, 0.15)',
    },
    Card: {
      borderRadiusLG: 10,
    },
    Table: {
      headerBg: '#ecfdf5',
      headerColor: '#134e4a',
      rowHoverBg: '#f0fdfa',
    },
    Tag: {
      defaultBg: '#ecfdf5',
      defaultColor: '#0f766e',
    },
  },
}

export const chartColors = {
  primary: '#0d9488',
  secondary: '#0891b2',
  accent: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  muted: '#94a3b8',
  series: ['#0d9488', '#0891b2', '#059669', '#14b8a6', '#0284c7', '#65a30d', '#ca8a04', '#ea580c'],
}
