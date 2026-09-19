import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { themeConfig } from '@/theme'
import { DemoProvider } from '@/context/DemoContext'
import { OpsProvider } from '@/context/OpsContext'
import { CarbonProvider } from '@/context/CarbonContext'
import { PortalProvider } from '@/context/PortalContext'
import { ArchiveProvider } from '@/context/ArchiveContext'
import { AppRoutes } from '@/routes'
import 'dayjs/locale/zh-cn'

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <DemoProvider>
          <ArchiveProvider>
            <OpsProvider>
              <CarbonProvider>
                <PortalProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </PortalProvider>
              </CarbonProvider>
            </OpsProvider>
          </ArchiveProvider>
        </DemoProvider>
      </AntApp>
    </ConfigProvider>
  )
}
