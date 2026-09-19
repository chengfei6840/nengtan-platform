import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PeriodType } from '@/mock/types'

interface DemoContextValue {
  period: PeriodType
  setPeriod: (p: PeriodType) => void
  zoneId: string | 'all'
  setZoneId: (z: string | 'all') => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [zoneId, setZoneId] = useState<string | 'all'>('all')
  const value = useMemo(
    () => ({ period, setPeriod, zoneId, setZoneId }),
    [period, zoneId],
  )
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
