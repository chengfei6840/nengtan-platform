import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { enterprises as seedEnterprises } from '@/mock/enterprises'
import { buildings as seedBuildings } from '@/mock/buildings'
import { devices as seedDevices } from '@/mock/devices'
import { meters as seedMeters } from '@/mock/meters'
import type { Building, Device, Enterprise, Meter } from '@/mock/types'

interface ArchiveContextValue {
  enterprises: Enterprise[]
  buildings: Building[]
  devices: Device[]
  meters: Meter[]
  createEnterprise: (row: Enterprise) => void
  updateEnterprise: (id: string, patch: Partial<Enterprise>) => void
  deleteEnterprise: (id: string) => void
  createBuilding: (row: Building) => void
  updateBuilding: (id: string, patch: Partial<Building>) => void
  deleteBuilding: (id: string) => void
  createDevice: (row: Device) => void
  updateDevice: (id: string, patch: Partial<Device>) => void
  deleteDevice: (id: string) => void
  createMeter: (row: Meter) => void
  updateMeter: (id: string, patch: Partial<Meter>) => void
  deleteMeter: (id: string) => void
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null)

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [enterprises, setEnterprises] = useState(() => structuredClone(seedEnterprises))
  const [buildings, setBuildings] = useState(() => structuredClone(seedBuildings))
  const [devices, setDevices] = useState(() => structuredClone(seedDevices))
  const [meters, setMeters] = useState(() => structuredClone(seedMeters))

  const createEnterprise = useCallback((row: Enterprise) => {
    setEnterprises((list) => [row, ...list])
  }, [])
  const updateEnterprise = useCallback((id: string, patch: Partial<Enterprise>) => {
    setEnterprises((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])
  const deleteEnterprise = useCallback((id: string) => {
    setEnterprises((list) => list.filter((e) => e.id !== id))
  }, [])

  const createBuilding = useCallback((row: Building) => {
    setBuildings((list) => [row, ...list])
  }, [])
  const updateBuilding = useCallback((id: string, patch: Partial<Building>) => {
    setBuildings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [])
  const deleteBuilding = useCallback((id: string) => {
    setBuildings((list) => list.filter((b) => b.id !== id))
  }, [])

  const createDevice = useCallback((row: Device) => {
    setDevices((list) => [row, ...list])
  }, [])
  const updateDevice = useCallback((id: string, patch: Partial<Device>) => {
    setDevices((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])
  const deleteDevice = useCallback((id: string) => {
    setDevices((list) => list.filter((d) => d.id !== id))
  }, [])

  const createMeter = useCallback((row: Meter) => {
    setMeters((list) => [row, ...list])
  }, [])
  const updateMeter = useCallback((id: string, patch: Partial<Meter>) => {
    setMeters((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])
  const deleteMeter = useCallback((id: string) => {
    setMeters((list) => list.filter((m) => m.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      enterprises,
      buildings,
      devices,
      meters,
      createEnterprise,
      updateEnterprise,
      deleteEnterprise,
      createBuilding,
      updateBuilding,
      deleteBuilding,
      createDevice,
      updateDevice,
      deleteDevice,
      createMeter,
      updateMeter,
      deleteMeter,
    }),
    [
      enterprises,
      buildings,
      devices,
      meters,
      createEnterprise,
      updateEnterprise,
      deleteEnterprise,
      createBuilding,
      updateBuilding,
      deleteBuilding,
      createDevice,
      updateDevice,
      deleteDevice,
      createMeter,
      updateMeter,
      deleteMeter,
    ],
  )

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
}

export function useArchive() {
  const ctx = useContext(ArchiveContext)
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider')
  return ctx
}

/** 由列表生成 id→实体 索引 */
export function indexById<T extends { id: string }>(list: T[]) {
  return Object.fromEntries(list.map((x) => [x.id, x])) as Record<string, T>
}
