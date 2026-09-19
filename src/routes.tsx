import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'

import OverviewPage from '@/pages/cockpit/OverviewPage'
import EnergyMapPage from '@/pages/cockpit/EnergyMapPage'
import CarbonMapPage from '@/pages/cockpit/CarbonMapPage'

import EnterprisesPage from '@/pages/archive/EnterprisesPage'
import BuildingsPage from '@/pages/archive/BuildingsPage'
import DevicesPage from '@/pages/archive/DevicesPage'
import MetersPage from '@/pages/archive/MetersPage'

import RealtimePage from '@/pages/energy/RealtimePage'
import StatsPage from '@/pages/energy/StatsPage'
import BenchmarkPage from '@/pages/energy/BenchmarkPage'
import CostPage from '@/pages/energy/CostPage'
import PlanPage from '@/pages/energy/PlanPage'

import AccountingPage from '@/pages/carbon/AccountingPage'
import CarbonOverviewPage from '@/pages/carbon/OverviewPage'
import FactorsPage from '@/pages/carbon/FactorsPage'
import BudgetPage from '@/pages/carbon/BudgetPage'
import AssetsPage from '@/pages/carbon/AssetsPage'

import PvPage from '@/pages/renewable/PvPage'
import StoragePage from '@/pages/renewable/StoragePage'
import ChargerPage from '@/pages/renewable/ChargerPage'
import MicrogridPage from '@/pages/renewable/MicrogridPage'

import MonitorPage from '@/pages/ops/MonitorPage'
import AlarmsPage from '@/pages/ops/AlarmsPage'
import WorkOrdersPage from '@/pages/ops/WorkOrdersPage'

import DiagnosisPage from '@/pages/saving/DiagnosisPage'
import ProjectsPage from '@/pages/saving/ProjectsPage'
import VerifyPage from '@/pages/saving/VerifyPage'

import WorkbenchPage from '@/pages/portal/WorkbenchPage'
import FillPage from '@/pages/portal/FillPage'
import RectifyPage from '@/pages/portal/RectifyPage'
import NoticesPage from '@/pages/portal/NoticesPage'

import QualityPage from '@/pages/data/QualityPage'
import QueryPage from '@/pages/data/QueryPage'
import DataInterfacesPage from '@/pages/data/InterfacesPage'

import ReportsPage from '@/pages/reports/ReportsPage'

import UsersPage from '@/pages/system/UsersPage'
import WorkflowsPage from '@/pages/system/WorkflowsPage'
import SystemInterfacesPage from '@/pages/system/InterfacesPage'
import AuditPage from '@/pages/system/AuditPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/cockpit/overview" replace />} />

        <Route path="/cockpit/overview" element={<OverviewPage />} />
        <Route path="/cockpit/energy-map" element={<EnergyMapPage />} />
        <Route path="/cockpit/carbon-map" element={<CarbonMapPage />} />

        <Route path="/archive/enterprises" element={<EnterprisesPage />} />
        <Route path="/archive/buildings" element={<BuildingsPage />} />
        <Route path="/archive/devices" element={<DevicesPage />} />
        <Route path="/archive/meters" element={<MetersPage />} />

        <Route path="/energy/realtime" element={<RealtimePage />} />
        <Route path="/energy/stats" element={<StatsPage />} />
        <Route path="/energy/benchmark" element={<BenchmarkPage />} />
        <Route path="/energy/cost" element={<CostPage />} />
        <Route path="/energy/plan" element={<PlanPage />} />

        <Route path="/carbon/accounting" element={<AccountingPage />} />
        <Route path="/carbon/overview" element={<CarbonOverviewPage />} />
        <Route path="/carbon/factors" element={<FactorsPage />} />
        <Route path="/carbon/budget" element={<BudgetPage />} />
        <Route path="/carbon/assets" element={<AssetsPage />} />

        <Route path="/renewable/pv" element={<PvPage />} />
        <Route path="/renewable/storage" element={<StoragePage />} />
        <Route path="/renewable/charger" element={<ChargerPage />} />
        <Route path="/renewable/microgrid" element={<MicrogridPage />} />

        <Route path="/ops/monitor" element={<MonitorPage />} />
        <Route path="/ops/alarms" element={<AlarmsPage />} />
        <Route path="/ops/workorders" element={<WorkOrdersPage />} />

        <Route path="/saving/diagnosis" element={<DiagnosisPage />} />
        <Route path="/saving/projects" element={<ProjectsPage />} />
        <Route path="/saving/verify" element={<VerifyPage />} />

        <Route path="/portal/workbench" element={<WorkbenchPage />} />
        <Route path="/portal/fill" element={<FillPage />} />
        <Route path="/portal/rectify" element={<RectifyPage />} />
        <Route path="/portal/notices" element={<NoticesPage />} />

        <Route path="/data/quality" element={<QualityPage />} />
        <Route path="/data/query" element={<QueryPage />} />
        <Route path="/data/interfaces" element={<DataInterfacesPage />} />

        <Route path="/reports" element={<ReportsPage />} />

        <Route path="/system/users" element={<UsersPage />} />
        <Route path="/system/workflows" element={<WorkflowsPage />} />
        <Route path="/system/interfaces" element={<SystemInterfacesPage />} />
        <Route path="/system/audit" element={<AuditPage />} />

        <Route path="*" element={<Navigate to="/cockpit/overview" replace />} />
      </Route>
    </Routes>
  )
}
