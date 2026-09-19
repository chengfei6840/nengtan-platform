import { useCallback, useMemo, useState } from 'react'

/** 通用内存列表 CRUD（刷新恢复 seed） */
export function useCrudList<T extends { id: string }>(seed: T[], idPrefix = 'row') {
  const [items, setItems] = useState<T[]>(() => structuredClone(seed))

  const create = useCallback(
    (input: Omit<T, 'id'> & { id?: string }) => {
      const row = { ...input, id: input.id ?? `${idPrefix}-${Date.now()}` } as T
      setItems((list) => [row, ...list])
      return row
    },
    [idPrefix],
  )

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((row) => row.id !== id))
  }, [])

  const upsert = useCallback((row: T) => {
    setItems((list) => {
      const idx = list.findIndex((r) => r.id === row.id)
      if (idx < 0) return [row, ...list]
      return list.map((r) => (r.id === row.id ? row : r))
    })
  }, [])

  const replaceAll = useCallback((next: T[]) => {
    setItems(next)
  }, [])

  return useMemo(
    () => ({ items, setItems, create, update, remove, upsert, replaceAll }),
    [items, create, update, remove, upsert, replaceAll],
  )
}
