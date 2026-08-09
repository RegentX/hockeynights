/**
 * HOCFRONT-28CAL-A/C/F — URL-состояние календаря
 */

export type CalendarViewMode = 'month' | 'agenda'
export type CalendarScope = 'me' | 'player' | 'team' | 'club'
export type CalendarRangeChip = 'today' | 'week' | null
export type CalendarLens = 'player' | 'goalie' | 'organizer'

export interface CalendarUiState {
  view: CalendarViewMode
  /** YYYY-MM-DD выбранного дня */
  date: string
  scope: CalendarScope
  scopeId: string
  type: string
  status: string
  range: CalendarRangeChip
  mineOnly: boolean
  needsGoalie: boolean
  lens: CalendarLens
}

export const DEFAULT_CALENDAR_STATE: CalendarUiState = {
  view: 'month',
  date: '',
  scope: 'me',
  scopeId: '',
  type: '',
  status: '',
  range: null,
  mineOnly: false,
  needsGoalie: false,
  lens: 'player',
}

const VIEWS = new Set<CalendarViewMode>(['month', 'agenda'])
const SCOPES = new Set<CalendarScope>(['me', 'player', 'team', 'club'])
const RANGES = new Set<CalendarRangeChip>(['today', 'week'])
const LENSES = new Set<CalendarLens>(['player', 'goalie', 'organizer'])

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function startOfWeekMonday(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  return next
}

export function endOfWeekSunday(date: Date): Date {
  const start = startOfWeekMonday(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

export function defaultLensFromRoles(roles: string[], personaId?: string): CalendarLens {
  if (personaId === 'goalie' || roles.includes('goalie')) return 'goalie'
  if (
    personaId === 'organizer' ||
    roles.includes('organizer') ||
    roles.includes('training_organizer') ||
    roles.includes('club_admin') ||
    roles.includes('captain') ||
    roles.includes('coach') ||
    roles.includes('admin')
  ) {
    return 'organizer'
  }
  return 'player'
}

export function parseCalendarState(
  params: URLSearchParams,
  fallbackLens: CalendarLens = 'player',
): CalendarUiState {
  const viewRaw = params.get('view')
  const scopeRaw = params.get('scope')
  const rangeRaw = params.get('range')
  const lensRaw = params.get('lens')
  const dateRaw = params.get('date') ?? ''

  return {
    view:
      viewRaw && VIEWS.has(viewRaw as CalendarViewMode) ? (viewRaw as CalendarViewMode) : 'month',
    date: /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : localDateKey(),
    scope: scopeRaw && SCOPES.has(scopeRaw as CalendarScope) ? (scopeRaw as CalendarScope) : 'me',
    scopeId: params.get('scopeId') ?? '',
    type: params.get('type') ?? '',
    status: params.get('status') ?? '',
    range:
      rangeRaw && RANGES.has(rangeRaw as CalendarRangeChip)
        ? (rangeRaw as CalendarRangeChip)
        : null,
    mineOnly: params.get('mine') === '1',
    needsGoalie: params.get('needsGoalie') === '1',
    lens: lensRaw && LENSES.has(lensRaw as CalendarLens) ? (lensRaw as CalendarLens) : fallbackLens,
  }
}

export function serializeCalendarState(state: CalendarUiState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.view !== 'month') params.set('view', state.view)
  if (state.date) params.set('date', state.date)
  if (state.scope !== 'me') params.set('scope', state.scope)
  if (state.scopeId && state.scope !== 'me') params.set('scopeId', state.scopeId)
  if (state.type) params.set('type', state.type)
  if (state.status) params.set('status', state.status)
  if (state.range) params.set('range', state.range)
  if (state.mineOnly) params.set('mine', '1')
  if (state.needsGoalie) params.set('needsGoalie', '1')
  if (state.lens !== 'player') params.set('lens', state.lens)
  return params
}

export function countActiveCalendarFilters(state: CalendarUiState): number {
  let count = 0
  if (state.type) count += 1
  if (state.status) count += 1
  if (state.range) count += 1
  if (state.mineOnly) count += 1
  if (state.needsGoalie) count += 1
  return count
}

export function calendarScopeTitle(state: CalendarUiState): string {
  if (state.scope === 'team') return 'Календарь команды'
  if (state.scope === 'club') return 'Календарь клуба'
  if (state.scope === 'player') return 'Календарь игрока'
  return 'Календарь'
}

export function calendarLensEmptyCopy(lens: CalendarLens): string {
  if (lens === 'goalie') {
    return 'Нет событий с открытым слотом вратаря и активных окон. Добавьте окно возможностей или снимите фильтры.'
  }
  if (lens === 'organizer') {
    return 'Нет созданных вами событий в выбранном диапазоне.'
  }
  return 'События не найдены по выбранным фильтрам.'
}
