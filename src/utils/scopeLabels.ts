import type { ScopeType } from '@/mock/types'

/** 核算范围：短名 + 白话说明 + 典型数据举例 */
export const SCOPE_META: Record<
  ScopeType,
  { short: string; full: string; hint: string; examples: string }
> = {
  scope1: {
    short: '范围一',
    full: '范围一 · 直接排放',
    hint: '企业边界内自己烧燃料、跑工艺直接排出来的温室气体',
    examples: '天然气锅炉、柴油叉车、制冷剂逸散、过程废气等',
  },
  scope2: {
    short: '范围二',
    full: '范围二 · 能源间接排放',
    hint: '外购电力、热力、蒸汽在上游发电/供热环节产生的排放（用多少算多少）',
    examples: '市电、外购蒸汽、外购热水等',
  },
  scope3: {
    short: '范围三',
    full: '范围三 · 其他间接排放',
    hint: '价值链上下游、不在本厂直接控制但因经营活动产生的排放',
    examples: '外购原材料、货物运输、员工通勤、危废处置、差旅等',
  },
}

export const SCOPE_ORDER: ScopeType[] = ['scope1', 'scope2', 'scope3']

export function scopeShort(s: ScopeType) {
  return SCOPE_META[s].short
}

export function scopeFull(s: ScopeType) {
  return SCOPE_META[s].full
}
