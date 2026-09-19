/** 数值与能源/排放展示格式化 */

export function numFormat(
  value: number | null | undefined,
  options?: {
    digits?: number
    fallback?: string
  },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? '--'
  }
  const digits = options?.digits ?? (Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2)
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** 电量/能量：自动选 kWh / MWh / GWh 或保留原单位 */
export function energyFormat(
  value: number | null | undefined,
  options?: {
    unit?: 'kWh' | 'MWh' | 'GWh' | 'tce' | 'm³' | 't' | 'auto'
    digits?: number
    fallback?: string
  },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? '--'
  }

  const unit = options?.unit ?? 'auto'
  if (unit === 'tce' || unit === 'm³' || unit === 't') {
    return `${numFormat(value, { digits: options?.digits ?? 1 })} ${unit}`
  }

  // 电量入参默认按 kWh；auto 时自动升档
  let scaled = value
  let label: 'kWh' | 'MWh' | 'GWh' = 'kWh'

  if (unit === 'auto') {
    if (Math.abs(value) >= 1e6) {
      scaled = value / 1e6
      label = 'GWh'
    } else if (Math.abs(value) >= 1e3) {
      scaled = value / 1e3
      label = 'MWh'
    }
  } else if (unit === 'MWh') {
    scaled = value / 1e3
    label = 'MWh'
  } else if (unit === 'GWh') {
    scaled = value / 1e6
    label = 'GWh'
  } else {
    label = 'kWh'
  }

  const digits = options?.digits ?? (Math.abs(scaled) >= 100 ? 0 : 2)
  return `${numFormat(scaled, { digits })} ${label}`
}

/** 排放量：tCO₂e，过大时用 万 tCO₂e */
export function emissionFormat(
  value: number | null | undefined,
  options?: {
    digits?: number
    fallback?: string
    compact?: boolean
  },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? '--'
  }

  const compact = options?.compact ?? Math.abs(value) >= 10000
  if (compact) {
    const digits = options?.digits ?? 2
    return `${numFormat(value / 10000, { digits })} 万 tCO₂e`
  }

  const digits = options?.digits ?? (Math.abs(value) >= 100 ? 0 : 1)
  return `${numFormat(value, { digits })} tCO₂e`
}

export function percentFormat(
  value: number | null | undefined,
  options?: { digits?: number; fallback?: string },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? '--'
  }
  return `${numFormat(value, { digits: options?.digits ?? 1 })}%`
}

/** value 按「元」传入；unit=万元 时按万元展示 */
export function moneyFormat(
  value: number | null | undefined,
  options?: { unit?: '元' | '万元'; digits?: number; fallback?: string },
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return options?.fallback ?? '--'
  }
  const unit = options?.unit ?? (Math.abs(value) >= 10000 ? '万元' : '元')
  const amount = unit === '万元' ? value / 10000 : value
  return `${numFormat(amount, { digits: options?.digits ?? 2 })} ${unit}`
}
