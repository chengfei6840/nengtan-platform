import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { alarms as seedAlarms, workOrders as seedOrders } from '@/mock/ops'
import type { Alarm, AlarmLevel, WorkOrder, ZoneId } from '@/mock/types'

export type CreateAlarmInput = {
  title: string
  message: string
  level?: AlarmLevel
  source: string
  sourceType?: Alarm['sourceType']
  sourceId?: string
  enterpriseId?: string
  zoneId?: ZoneId
  assignee?: string
}

export type UpdateAlarmInput = Partial<
  Pick<
    Alarm,
    | 'title'
    | 'message'
    | 'level'
    | 'source'
    | 'sourceType'
    | 'sourceId'
    | 'enterpriseId'
    | 'zoneId'
    | 'assignee'
    | 'status'
  >
>

export type CreateWorkOrderInput = {
  title: string
  type: WorkOrder['type']
  priority?: WorkOrder['priority']
  assignee: string
  creator?: string
  description: string
  dueAt: string
  enterpriseId?: string
  deviceId?: string
  meterId?: string
  alarmId?: string
  status?: WorkOrder['status']
}

export type UpdateWorkOrderInput = Partial<
  Pick<
    WorkOrder,
    | 'title'
    | 'type'
    | 'priority'
    | 'assignee'
    | 'creator'
    | 'description'
    | 'dueAt'
    | 'enterpriseId'
    | 'deviceId'
    | 'meterId'
    | 'alarmId'
    | 'status'
  >
>

interface OpsContextValue {
  alarms: Alarm[]
  workOrders: WorkOrder[]
  createAlarm: (input: CreateAlarmInput) => Alarm
  updateAlarm: (id: string, patch: UpdateAlarmInput) => void
  deleteAlarm: (id: string) => void
  ackAlarm: (id: string) => void
  closeAlarm: (id: string) => void
  convertAlarmToOrder: (alarmId: string, assignee?: string) => WorkOrder | null
  createWorkOrder: (input: CreateWorkOrderInput) => WorkOrder
  updateWorkOrder: (id: string, patch: UpdateWorkOrderInput) => void
  deleteWorkOrder: (id: string) => void
  updateOrderStatus: (id: string, status: WorkOrder['status']) => void
}

const OpsContext = createContext<OpsContextValue | null>(null)

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function OpsProvider({ children }: { children: ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>(() => structuredClone(seedAlarms))
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => structuredClone(seedOrders))

  const createAlarm = useCallback((input: CreateAlarmInput) => {
    const alarm: Alarm = {
      id: `alm-demo-${Date.now()}`,
      title: input.title,
      level: input.level ?? 'major',
      status: 'open',
      source: input.source,
      sourceType: input.sourceType ?? 'energy',
      sourceId: input.sourceId,
      enterpriseId: input.enterpriseId,
      zoneId: input.zoneId,
      message: input.message,
      triggeredAt: nowStamp(),
      assignee: input.assignee,
    }
    setAlarms((list) => [alarm, ...list])
    return alarm
  }, [])

  const updateAlarm = useCallback((id: string, patch: UpdateAlarmInput) => {
    setAlarms((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((list) => list.filter((a) => a.id !== id))
  }, [])

  const ackAlarm = useCallback((id: string) => {
    setAlarms((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'ack', ackAt: nowStamp() } : a)),
    )
  }, [])

  const closeAlarm = useCallback((id: string) => {
    setAlarms((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'closed', closedAt: nowStamp() } : a)),
    )
  }, [])

  const convertAlarmToOrder = useCallback(
    (alarmId: string, assignee = '运维值班') => {
      const alarm = alarms.find((a) => a.id === alarmId)
      if (!alarm) return null
      const now = nowStamp()
      const order: WorkOrder = {
        id: `wo-demo-${Date.now()}`,
        title: `【告警转单】${alarm.title}`,
        type: '应急',
        status: 'assigned',
        priority: alarm.level === 'critical' ? 'high' : alarm.level === 'major' ? 'medium' : 'low',
        alarmId: alarm.id,
        enterpriseId: alarm.enterpriseId,
        deviceId: alarm.sourceType === 'device' ? alarm.sourceId : undefined,
        meterId: alarm.sourceType === 'meter' ? alarm.sourceId : undefined,
        description: alarm.message,
        assignee,
        creator: '告警转单',
        createdAt: now,
        dueAt: now.slice(0, 10) + ' 18:00:00',
      }
      setWorkOrders((list) => [order, ...list])
      setAlarms((list) =>
        list.map((a) =>
          a.id === alarmId ? { ...a, status: 'ack', ackAt: now, assignee } : a,
        ),
      )
      return order
    },
    [alarms],
  )

  const createWorkOrder = useCallback((input: CreateWorkOrderInput) => {
    const now = nowStamp()
    const order: WorkOrder = {
      id: `wo-demo-${Date.now()}`,
      title: input.title,
      type: input.type,
      status: input.status ?? 'pending',
      priority: input.priority ?? 'medium',
      alarmId: input.alarmId,
      enterpriseId: input.enterpriseId,
      deviceId: input.deviceId,
      meterId: input.meterId,
      description: input.description,
      assignee: input.assignee,
      creator: input.creator ?? '系统管理员',
      createdAt: now,
      dueAt: input.dueAt,
    }
    setWorkOrders((list) => [order, ...list])
    return order
  }, [])

  const updateWorkOrder = useCallback((id: string, patch: UpdateWorkOrderInput) => {
    const now = nowStamp()
    setWorkOrders((list) =>
      list.map((o) => {
        if (o.id !== id) return o
        const next = { ...o, ...patch }
        if (patch.status === 'done' && !next.completedAt) {
          next.completedAt = now
        }
        return next
      }),
    )
  }, [])

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders((list) => list.filter((o) => o.id !== id))
  }, [])

  const updateOrderStatus = useCallback((id: string, status: WorkOrder['status']) => {
    const now = nowStamp()
    setWorkOrders((list) =>
      list.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              completedAt: status === 'done' ? now : o.completedAt,
            }
          : o,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      alarms,
      workOrders,
      createAlarm,
      updateAlarm,
      deleteAlarm,
      ackAlarm,
      closeAlarm,
      convertAlarmToOrder,
      createWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
      updateOrderStatus,
    }),
    [
      alarms,
      workOrders,
      createAlarm,
      updateAlarm,
      deleteAlarm,
      ackAlarm,
      closeAlarm,
      convertAlarmToOrder,
      createWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
      updateOrderStatus,
    ],
  )

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}

export function useOps() {
  const ctx = useContext(OpsContext)
  if (!ctx) throw new Error('useOps must be used within OpsProvider')
  return ctx
}
