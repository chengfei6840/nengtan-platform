import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { GeoPoint, ZoneId } from '@/mock/types'
import { parkOverview } from '@/mock/park'
import { enterprisesById } from '@/mock/enterprises'

export type ParkMapColorMode = 'zone' | 'energy' | 'emission'

export interface ParkMapProps {
  points: GeoPoint[]
  colorMode: ParkMapColorMode
  onSelect?: (point: GeoPoint) => void
  selectedId?: string
  height?: number | string
}

const TYPE_META: Record<
  GeoPoint['type'],
  { label: string; shape: 'circle' | 'diamond' | 'square' | 'triangle' }
> = {
  enterprise: { label: '企业', shape: 'circle' },
  building: { label: '建筑', shape: 'square' },
  facility: { label: '设施', shape: 'square' },
  pv: { label: '光伏', shape: 'diamond' },
  storage: { label: '储能', shape: 'diamond' },
  charger: { label: '充电桩', shape: 'triangle' },
  gate: { label: '出入口', shape: 'square' },
}

const zoneColorMap = Object.fromEntries(parkOverview.zones.map((z) => [z.id, z.color])) as Record<
  ZoneId,
  string
>

function heatColor(ratio: number, mode: 'energy' | 'emission'): string {
  const t = Math.max(0, Math.min(1, ratio))
  if (mode === 'energy') {
    // 青绿 → 琥珀
    const r = Math.round(13 + t * (217 - 13))
    const g = Math.round(148 - t * (148 - 119))
    const b = Math.round(136 - t * 136)
    return `rgb(${r},${g},${b})`
  }
  // 排放：青绿 → 朱红
  const r = Math.round(13 + t * (220 - 13))
  const g = Math.round(148 - t * (148 - 38))
  const b = Math.round(136 - t * (136 - 38))
  return `rgb(${r},${g},${b})`
}

function normalizePositions(points: GeoPoint[]) {
  if (points.length === 0) {
    return { toPercent: (_p: GeoPoint) => ({ left: 50, top: 50 }) }
  }
  const lngs = points.map((p) => p.lng)
  const lats = points.map((p) => p.lat)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const padLng = (maxLng - minLng) * 0.12 || 0.001
  const padLat = (maxLat - minLat) * 0.12 || 0.001
  const left = minLng - padLng
  const right = maxLng + padLng
  const bottom = minLat - padLat
  const top = maxLat + padLat

  return {
    toPercent: (p: GeoPoint) => ({
      left: ((p.lng - left) / (right - left)) * 100,
      top: ((top - p.lat) / (top - bottom)) * 100,
    }),
  }
}

function pointSize(point: GeoPoint, colorMode: ParkMapColorMode, maxEnergy: number, maxEmission: number) {
  if (point.type !== 'enterprise' || !point.refId) return 14
  const ent = enterprisesById[point.refId]
  if (!ent) return 14
  if (colorMode === 'energy') {
    const r = maxEnergy > 0 ? ent.yearlyEnergy / maxEnergy : 0
    return 12 + r * 16
  }
  if (colorMode === 'emission') {
    const r = maxEmission > 0 ? ent.yearlyEmission / maxEmission : 0
    return 12 + r * 16
  }
  return 16
}

function pointColor(point: GeoPoint, colorMode: ParkMapColorMode, maxEnergy: number, maxEmission: number) {
  if (colorMode === 'zone') {
    return zoneColorMap[point.zoneId] ?? '#64748b'
  }
  if (point.type === 'enterprise' && point.refId) {
    const ent = enterprisesById[point.refId]
    if (ent) {
      if (colorMode === 'energy') {
        return heatColor(maxEnergy > 0 ? ent.yearlyEnergy / maxEnergy : 0, 'energy')
      }
      return heatColor(maxEmission > 0 ? ent.yearlyEmission / maxEmission : 0, 'emission')
    }
  }
  return zoneColorMap[point.zoneId] ?? '#94a3b8'
}

function markerStyle(shape: string, size: number, color: string, selected: boolean): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    background: color,
    border: selected ? '3px solid #134e4a' : '2px solid #fff',
    boxShadow: selected
      ? '0 0 0 3px rgba(13,148,136,0.35), 0 2px 8px rgba(15,23,42,0.25)'
      : '0 2px 6px rgba(15,23,42,0.2)',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    zIndex: selected ? 5 : 2,
  }
  if (shape === 'diamond') {
    return { ...base, borderRadius: 2, transform: 'translate(-50%, -50%) rotate(45deg)' }
  }
  if (shape === 'square') {
    return { ...base, borderRadius: 3 }
  }
  if (shape === 'triangle') {
    return {
      ...base,
      width: 0,
      height: 0,
      background: 'transparent',
      border: 'none',
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
      boxShadow: 'none',
      filter: selected ? 'drop-shadow(0 0 3px #134e4a)' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
    }
  }
  return { ...base, borderRadius: '50%' }
}

export function ParkMap({ points, colorMode, onSelect, selectedId, height = 480 }: ParkMapProps) {
  const { toPercent } = useMemo(() => normalizePositions(points), [points])

  const { maxEnergy, maxEmission } = useMemo(() => {
    let maxE = 0
    let maxEm = 0
    for (const p of points) {
      if (p.type === 'enterprise' && p.refId) {
        const ent = enterprisesById[p.refId]
        if (ent) {
          maxE = Math.max(maxE, ent.yearlyEnergy)
          maxEm = Math.max(maxEm, ent.yearlyEmission)
        }
      }
    }
    return { maxEnergy: maxE, maxEmission: maxEm }
  }, [points])

  const presentTypes = useMemo(() => {
    const set = new Set(points.map((p) => p.type))
    return (Object.keys(TYPE_META) as GeoPoint['type'][]).filter((t) => set.has(t))
  }, [points])

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          overflow: 'hidden',
          background:
            'linear-gradient(145deg, #ecfdf5 0%, #e0f2fe 45%, #f0fdfa 100%)',
          border: '1px solid #99f6e4',
        }}
      >
        {/* 分区底色示意 */}
        <div
          style={{
            position: 'absolute',
            left: '8%',
            top: '8%',
            width: '48%',
            height: '55%',
            background: 'rgba(13,148,136,0.12)',
            borderRadius: 16,
            border: '1px dashed rgba(13,148,136,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '4%',
            top: '28%',
            width: '36%',
            height: '52%',
            background: 'rgba(8,145,178,0.10)',
            borderRadius: 16,
            border: '1px dashed rgba(8,145,178,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '32%',
            top: '58%',
            width: '42%',
            height: '32%',
            background: 'rgba(5,150,105,0.10)',
            borderRadius: 16,
            border: '1px dashed rgba(5,150,105,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 10,
            fontSize: 12,
            color: '#0f766e',
            fontWeight: 600,
            opacity: 0.7,
          }}
        >
          {parkOverview.shortName} · 园区示意地图
        </div>

        {points.map((point) => {
          const pos = toPercent(point)
          const meta = TYPE_META[point.type]
          const size = pointSize(point, colorMode, maxEnergy, maxEmission)
          const color = pointColor(point, colorMode, maxEnergy, maxEmission)
          const selected = point.id === selectedId
          return (
            <button
              key={point.id}
              type="button"
              title={`${point.name}（${meta.label}）`}
              aria-label={point.name}
              onClick={() => onSelect?.(point)}
              style={{
                ...markerStyle(meta.shape, size, color, selected),
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                padding: 0,
              }}
            />
          )
        })}

        {/* 点位名称（企业） */}
        {points
          .filter((p) => p.type === 'enterprise')
          .map((point) => {
            const pos = toPercent(point)
            return (
              <div
                key={`label-${point.id}`}
                style={{
                  position: 'absolute',
                  left: `${pos.left}%`,
                  top: `calc(${pos.top}% + 12px)`,
                  transform: 'translateX(-50%)',
                  fontSize: 11,
                  color: '#134e4a',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  textShadow: '0 0 4px #fff, 0 0 4px #fff',
                  fontWeight: 500,
                  zIndex: 3,
                }}
              >
                {point.name}
              </div>
            )
          })}
      </div>

      {/* 图例 */}
      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
          fontSize: 12,
          color: '#334155',
          zIndex: 6,
          maxWidth: 220,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6, color: '#134e4a' }}>图例</div>
        {colorMode === 'zone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            {parkOverview.zones.map((z) => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: z.color,
                    display: 'inline-block',
                  }}
                />
                {z.name}
              </div>
            ))}
          </div>
        )}
        {(colorMode === 'energy' || colorMode === 'emission') && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 4 }}>
              {colorMode === 'energy' ? '年综合能耗强度' : '年碳排放强度'}
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background:
                  colorMode === 'energy'
                    ? 'linear-gradient(90deg,#0d9488,#d97706)'
                    : 'linear-gradient(90deg,#0d9488,#dc2626)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>低</span>
              <span>高</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {presentTypes.map((t) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: '#0d9488',
                  borderRadius: TYPE_META[t].shape === 'circle' ? '50%' : 2,
                  display: 'inline-block',
                }}
              />
              {TYPE_META[t].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ParkMap
