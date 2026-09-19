import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { fillTasks as seedFills, rectifications as seedRects } from '@/mock/enterprisePortal'
import type {
  FillDataLine,
  FillFormData,
  FillTask,
  FillTaskStatus,
  Rectification,
} from '@/mock/types'

export type CreateFillTaskInput = {
  enterpriseId: string
  title: string
  period: string
  dataType: string
  deadline: string
}

export type CreateRectifyInput = {
  enterpriseId: string
  title: string
  source: string
  description: string
  assignee: string
  deadline: string
}

interface PortalContextValue {
  fillTasks: FillTask[]
  rectifications: Rectification[]
  createFillTask: (input: CreateFillTaskInput) => FillTask
  updateFillTask: (id: string, patch: Partial<Pick<FillTask, 'title' | 'period' | 'deadline' | 'dataType'>>) => void
  deleteFillTask: (id: string) => void
  saveFillDraft: (id: string, formData: FillFormData) => void
  submitFill: (id: string, formData?: FillFormData) => boolean
  approveFill: (id: string) => void
  rejectFill: (id: string, remark?: string) => void
  upsertFillLine: (taskId: string, line: FillDataLine) => void
  deleteFillLine: (taskId: string, lineId: string) => void
  createRectify: (input: CreateRectifyInput) => Rectification
  updateRectify: (
    id: string,
    patch: Partial<Pick<Rectification, 'title' | 'source' | 'description' | 'assignee' | 'deadline'>>,
  ) => void
  deleteRectify: (id: string) => void
  saveRectifyDraft: (id: string, patch: Pick<Rectification, 'response' | 'evidenceNote'>) => void
  advanceRectify: (id: string, patch?: Pick<Rectification, 'response' | 'evidenceNote'>) => boolean
}

const PortalContext = createContext<PortalContextValue | null>(null)

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

const RECTIFY_NEXT: Record<Rectification['status'], Rectification['status'] | null> = {
  open: 'rectifying',
  rectifying: 'pending_review',
  pending_review: 'closed',
  closed: null,
}

const EDITABLE: FillTaskStatus[] = ['pending', 'draft', 'rejected']

/** 按数据类型校验必填项 */
export function validateFillForm(dataType: string, form?: FillFormData): string | null {
  if (!form) return '请先填写表单数据'
  if (dataType === '能耗与产量') {
    const hasLines = (form.lines?.length ?? 0) > 0
    if (form.electricityKwh == null && !hasLines) return '请填写用电量或至少一条明细'
    if (form.outputValueWan == null) return '请填写产值'
  } else if (dataType === '供应链排放') {
    if (form.purchasedGoodsTco2e == null) return '请填写外购商品排放'
  } else if (dataType === '用电快报') {
    if (form.electricityKwh == null) return '请填写本周用电量'
  } else if (dataType === '过程排放') {
    if (form.sf6Kg == null && form.nf3Kg == null && form.otherProcessTco2e == null) {
      return '请至少填写一项过程排放数据'
    }
  }
  return null
}

/** 明细行汇总回写常用总量字段 */
export function syncSummaryFromLines(form: FillFormData): FillFormData {
  const lines = form.lines ?? []
  if (!lines.length) return form
  const sum = (cat: string) =>
    lines.filter((l) => l.category === cat).reduce((s, l) => s + (Number(l.quantity) || 0), 0)
  const elec = sum('电')
  const gas = sum('天然气')
  const steam = sum('蒸汽')
  const water = sum('水')
  const diesel = sum('柴油')
  return {
    ...form,
    electricityKwh: elec || form.electricityKwh,
    naturalGasNm3: gas || form.naturalGasNm3,
    steamTon: steam || form.steamTon,
    waterTon: water || form.waterTon,
    dieselKg: diesel || form.dieselKg,
  }
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [fillTasks, setFillTasks] = useState<FillTask[]>(() => structuredClone(seedFills))
  const [rectifications, setRectifications] = useState<Rectification[]>(() =>
    structuredClone(seedRects),
  )

  const createFillTask = useCallback((input: CreateFillTaskInput) => {
    const now = nowStamp()
    const task: FillTask = {
      id: `fill-demo-${Date.now()}`,
      enterpriseId: input.enterpriseId,
      title: input.title,
      period: input.period,
      dataType: input.dataType,
      deadline: input.deadline,
      status: 'pending',
      formData: { lines: [], updatedAt: now },
    }
    setFillTasks((list) => [task, ...list])
    return task
  }, [])

  const updateFillTask = useCallback(
    (id: string, patch: Partial<Pick<FillTask, 'title' | 'period' | 'deadline' | 'dataType'>>) => {
      setFillTasks((list) =>
        list.map((t) => {
          if (t.id !== id) return t
          if (t.status === 'approved' || t.status === 'submitted') return t
          return { ...t, ...patch }
        }),
      )
    },
    [],
  )

  const deleteFillTask = useCallback((id: string) => {
    setFillTasks((list) => list.filter((t) => t.id !== id))
  }, [])

  const saveFillDraft = useCallback((id: string, formData: FillFormData) => {
    const stamp = nowStamp()
    const synced = syncSummaryFromLines({ ...formData, updatedAt: stamp })
    setFillTasks((list) =>
      list.map((t) => {
        if (t.id !== id) return t
        if (!EDITABLE.includes(t.status)) return t
        return {
          ...t,
          status: t.status === 'pending' ? 'draft' : t.status,
          formData: synced,
        }
      }),
    )
  }, [])

  const submitFill = useCallback((id: string, formData?: FillFormData) => {
    let ok = false
    setFillTasks((list) => {
      const target = list.find((t) => t.id === id)
      if (!target) return list
      if (!EDITABLE.includes(target.status)) return list
      const merged = syncSummaryFromLines({
        ...(target.formData ?? {}),
        ...(formData ?? {}),
        updatedAt: nowStamp(),
      })
      if (validateFillForm(target.dataType, merged)) return list
      ok = true
      return list.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'submitted' as const,
              submittedAt: nowStamp(),
              remark: undefined,
              formData: merged,
            }
          : t,
      )
    })
    return ok
  }, [])

  const approveFill = useCallback((id: string) => {
    setFillTasks((list) =>
      list.map((t) => {
        if (t.id !== id || t.status !== 'submitted') return t
        return {
          ...t,
          status: 'approved',
          reviewer: t.reviewer ?? '园区碳核算专员',
        }
      }),
    )
  }, [])

  const rejectFill = useCallback((id: string, remark = '数据核验未通过，请修订后重提') => {
    setFillTasks((list) =>
      list.map((t) => {
        if (t.id !== id || t.status !== 'submitted') return t
        return {
          ...t,
          status: 'rejected',
          reviewer: t.reviewer ?? '园区碳核算专员',
          remark,
        }
      }),
    )
  }, [])

  const upsertFillLine = useCallback((taskId: string, line: FillDataLine) => {
    setFillTasks((list) =>
      list.map((t) => {
        if (t.id !== taskId || !EDITABLE.includes(t.status)) return t
        const prev = t.formData?.lines ?? []
        const idx = prev.findIndex((l) => l.id === line.id)
        const lines = idx >= 0 ? prev.map((l, i) => (i === idx ? line : l)) : [...prev, line]
        const formData = syncSummaryFromLines({
          ...(t.formData ?? {}),
          lines,
          updatedAt: nowStamp(),
        })
        return {
          ...t,
          status: t.status === 'pending' ? 'draft' : t.status,
          formData,
        }
      }),
    )
  }, [])

  const deleteFillLine = useCallback((taskId: string, lineId: string) => {
    setFillTasks((list) =>
      list.map((t) => {
        if (t.id !== taskId || !EDITABLE.includes(t.status)) return t
        const lines = (t.formData?.lines ?? []).filter((l) => l.id !== lineId)
        const formData = syncSummaryFromLines({
          ...(t.formData ?? {}),
          lines,
          updatedAt: nowStamp(),
        })
        return { ...t, formData }
      }),
    )
  }, [])

  const createRectify = useCallback((input: CreateRectifyInput) => {
    const item: Rectification = {
      id: `rect-demo-${Date.now()}`,
      enterpriseId: input.enterpriseId,
      title: input.title,
      source: input.source,
      description: input.description,
      assignee: input.assignee,
      deadline: input.deadline,
      status: 'open',
    }
    setRectifications((list) => [item, ...list])
    return item
  }, [])

  const updateRectify = useCallback(
    (
      id: string,
      patch: Partial<Pick<Rectification, 'title' | 'source' | 'description' | 'assignee' | 'deadline'>>,
    ) => {
      setRectifications((list) =>
        list.map((r) => (r.id === id && r.status !== 'closed' ? { ...r, ...patch } : r)),
      )
    },
    [],
  )

  const deleteRectify = useCallback((id: string) => {
    setRectifications((list) => list.filter((r) => r.id !== id))
  }, [])

  const saveRectifyDraft = useCallback(
    (id: string, patch: Pick<Rectification, 'response' | 'evidenceNote'>) => {
      setRectifications((list) =>
        list.map((r) => {
          if (r.id !== id) return r
          if (r.status === 'closed') return r
          return { ...r, ...patch, status: r.status === 'open' ? 'rectifying' : r.status }
        }),
      )
    },
    [],
  )

  const advanceRectify = useCallback(
    (id: string, patch?: Pick<Rectification, 'response' | 'evidenceNote'>) => {
      let ok = false
      setRectifications((list) =>
        list.map((r) => {
          if (r.id !== id) return r
          const next = RECTIFY_NEXT[r.status]
          if (!next) return r
          const merged = { ...r, ...patch }
          if (r.status === 'rectifying' && !merged.response?.trim()) return r
          ok = true
          return {
            ...merged,
            status: next,
            completedAt: next === 'closed' || next === 'pending_review' ? nowStamp() : r.completedAt,
          }
        }),
      )
      return ok
    },
    [],
  )

  const value = useMemo(
    () => ({
      fillTasks,
      rectifications,
      createFillTask,
      updateFillTask,
      deleteFillTask,
      saveFillDraft,
      submitFill,
      approveFill,
      rejectFill,
      upsertFillLine,
      deleteFillLine,
      createRectify,
      updateRectify,
      deleteRectify,
      saveRectifyDraft,
      advanceRectify,
    }),
    [
      fillTasks,
      rectifications,
      createFillTask,
      updateFillTask,
      deleteFillTask,
      saveFillDraft,
      submitFill,
      approveFill,
      rejectFill,
      upsertFillLine,
      deleteFillLine,
      createRectify,
      updateRectify,
      deleteRectify,
      saveRectifyDraft,
      advanceRectify,
    ],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortal must be used within PortalProvider')
  return ctx
}
