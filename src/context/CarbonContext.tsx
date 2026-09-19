import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { accountingTasks as seedTasks } from '@/mock/carbon'
import type { AccountingTask, ScopeType } from '@/mock/types'

export type CreateTaskInput = {
  name: string
  year: number
  period: string
  enterpriseCount?: number
  scopeCoverage?: ScopeType[]
  owner?: string
}

interface CarbonContextValue {
  tasks: AccountingTask[]
  createTask: (input: CreateTaskInput) => AccountingTask
  updateTask: (
    id: string,
    patch: Partial<Pick<AccountingTask, 'name' | 'year' | 'period' | 'enterpriseCount' | 'scopeCoverage' | 'owner'>>,
  ) => void
  deleteTask: (id: string) => void
  runCalc: (id: string) => AccountingTask | null
  approve: (id: string) => AccountingTask | null
}

const CarbonContext = createContext<CarbonContextValue | null>(null)

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function estimateEmission(enterpriseCount: number, scopes: ScopeType[]) {
  const base = enterpriseCount * 820
  const scopeFactor =
    (scopes.includes('scope1') ? 0.35 : 0) +
    (scopes.includes('scope2') ? 0.5 : 0) +
    (scopes.includes('scope3') ? 0.25 : 0)
  return Math.round(base * Math.max(scopeFactor, 0.35) * 10) / 10
}

function nextCalc(task: AccountingTask): AccountingTask | null {
  const now = nowStamp()
  if (task.status === 'draft' || task.status === 'collecting') {
    return { ...task, status: 'calculating', updatedAt: now }
  }
  if (task.status === 'calculating') {
    return {
      ...task,
      status: 'reviewing',
      totalEmission: task.totalEmission || estimateEmission(task.enterpriseCount, task.scopeCoverage),
      updatedAt: now,
    }
  }
  return null
}

function nextApprove(task: AccountingTask): AccountingTask | null {
  if (task.status !== 'reviewing' && task.status !== 'locked') return null
  return {
    ...task,
    status: 'published',
    totalEmission: task.totalEmission || estimateEmission(task.enterpriseCount, task.scopeCoverage),
    updatedAt: nowStamp(),
  }
}

export function CarbonProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<AccountingTask[]>(() => structuredClone(seedTasks))

  const createTask = useCallback((input: CreateTaskInput) => {
    const now = nowStamp()
    const scopes = input.scopeCoverage ?? (['scope1', 'scope2'] as ScopeType[])
    const enterpriseCount = input.enterpriseCount ?? 24
    const task: AccountingTask = {
      id: `acc-demo-${Date.now()}`,
      name: input.name,
      year: input.year,
      period: input.period,
      status: 'draft',
      enterpriseCount,
      scopeCoverage: scopes,
      totalEmission: 0,
      createdAt: now,
      updatedAt: now,
      owner: input.owner ?? '园区碳核算专员',
    }
    setTasks((list) => [task, ...list])
    return task
  }, [])

  const updateTask = useCallback(
    (
      id: string,
      patch: Partial<Pick<AccountingTask, 'name' | 'year' | 'period' | 'enterpriseCount' | 'scopeCoverage' | 'owner'>>,
    ) => {
      setTasks((list) =>
        list.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowStamp() } : t)),
      )
    },
    [],
  )

  const deleteTask = useCallback((id: string) => {
    setTasks((list) => list.filter((t) => t.id !== id))
  }, [])

  const runCalc = useCallback((id: string) => {
    const current = tasks.find((t) => t.id === id)
    if (!current) return null
    const updated = nextCalc(current)
    if (!updated) return current
    setTasks((list) => list.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [tasks])

  const approve = useCallback((id: string) => {
    const current = tasks.find((t) => t.id === id)
    if (!current) return null
    const updated = nextApprove(current)
    if (!updated) return current
    setTasks((list) => list.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [tasks])

  const value = useMemo(
    () => ({ tasks, createTask, updateTask, deleteTask, runCalc, approve }),
    [tasks, createTask, updateTask, deleteTask, runCalc, approve],
  )

  return <CarbonContext.Provider value={value}>{children}</CarbonContext.Provider>
}

export function useCarbon() {
  const ctx = useContext(CarbonContext)
  if (!ctx) throw new Error('useCarbon must be used within CarbonProvider')
  return ctx
}
