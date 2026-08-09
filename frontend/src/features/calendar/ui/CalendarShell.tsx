/**
 * HOCFRONT-28 — calendar shell UI
 */

import {Select, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {useSearchParams} from 'react-router'

import type {AttendanceStatus, EventType} from '@/entities/common'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {
  type CalendarLens,
  calendarLensEmptyCopy,
  calendarScopeTitle,
  type CalendarUiState,
  type CalendarViewMode,
  countActiveCalendarFilters,
  defaultLensFromRoles,
  localDateKey,
  parseCalendarState,
  serializeCalendarState,
} from '../lib/calendarState'
import {filterCalendarEvents, loadCalendarEvents} from '../lib/loadCalendarEvents'
import {AvailabilityWindowsPanel} from './AvailabilityWindowsPanel'
import {CalendarAgenda} from './CalendarAgenda'
import {CalendarFilters} from './CalendarFilters'
import {CalendarMonthGrid} from './CalendarMonthGrid'
import {CalendarQuickChips} from './CalendarQuickChips'
import {GoalieRequestsInbox} from './GoalieRequestsInbox'

const LENS_OPTIONS: {id: CalendarLens; label: string}[] = [
  {id: 'player', label: 'Игрок'},
  {id: 'goalie', label: 'Вратарь'},
  {id: 'organizer', label: 'Организатор'},
]

export interface CalendarShellProps {
  title?: string
  compact?: boolean
  forcedScope?: Pick<CalendarUiState, 'scope' | 'scopeId'>
  showActions?: boolean
}

/**
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 */
export function CalendarShell({
  title,
  compact = false,
  forcedScope,
  showActions = true,
}: CalendarShellProps) {
  const {userId, roles, session} = useSessionAccess()
  const fallbackLens = defaultLensFromRoles(roles, session?.personaId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const state = useMemo(() => {
    const parsed = parseCalendarState(searchParams, fallbackLens)
    if (!forcedScope) return parsed
    return {...parsed, scope: forcedScope.scope, scopeId: forcedScope.scopeId}
  }, [searchParams, forcedScope, fallbackLens])

  const {
    data: rawEvents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['calendar-shell', state.scope, state.scopeId, state.type, state.status],
    queryFn: () => loadCalendarEvents(state),
  })

  const events = useMemo(
    () => filterCalendarEvents(rawEvents, state, userId),
    [rawEvents, state, userId],
  )

  function patchState(patch: Partial<CalendarUiState>) {
    const next: CalendarUiState = {
      ...state,
      ...patch,
      ...(forcedScope ? {scope: forcedScope.scope, scopeId: forcedScope.scopeId} : {}),
    }
    setSearchParams(serializeCalendarState(next), {replace: true})
  }

  function resetFilters() {
    patchState({
      type: '',
      status: '',
      range: null,
      mineOnly: false,
      needsGoalie: false,
      date: localDateKey(),
    })
  }

  const heading = title ?? calendarScopeTitle(state)
  const scopeDenied =
    (state.scope === 'team' || state.scope === 'club' || state.scope === 'player') && !state.scopeId
  const selectedDate = state.date || localDateKey()
  const allowActions = showActions && state.scope !== 'player'
  const showWindows = !compact && state.scope === 'me' && state.lens === 'goalie'
  const showGoalieInbox = !compact && state.scope === 'me' && state.lens === 'goalie'
  const activeFilterCount = countActiveCalendarFilters(state)

  return (
    <div
      className={`hockey-calendar-shell${compact ? ' hockey-calendar-shell--compact' : ''}`}
      data-testid={testId('calendar', 'shell', 'page')}
    >
      <header className="hockey-calendar-shell__header">
        <div className="hockey-calendar-shell__title-block">
          <Text
            variant={compact ? 'subheader-2' : 'header-1'}
            className="hockey-calendar-shell__title"
            data-testid={testId('calendar', 'shell', 'text', 'title')}
          >
            {heading}
          </Text>
          <Text color="secondary" data-testid={testId('calendar', 'shell', 'text', 'summary')}>
            {events.length === 0
              ? 'Нет событий по текущим фильтрам'
              : events.length === 1
                ? '1 событие'
                : events.length < 5
                  ? `${events.length} события`
                  : `${events.length} событий`}
            {activeFilterCount > 0 ? ` · фильтров: ${activeFilterCount}` : ''}
          </Text>
        </div>

        <div
          className="hockey-calendar-shell__view-toggle"
          data-testid={testId('calendar', 'shell', 'panel', 'view-toggle')}
          role="group"
          aria-label="Режим просмотра"
        >
          {(['month', 'agenda'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`hockey-calendar-shell__view-btn${state.view === mode ? ' is-active' : ''}`}
              onClick={() => patchState({view: mode})}
              data-testid={testId('calendar', 'shell', 'btn', 'view', mode)}
            >
              {mode === 'month' ? 'Месяц' : 'Лента'}
            </button>
          ))}
        </div>
      </header>

      {!compact && (
        <div className="hockey-calendar-shell__toolbar">
          <div className="hockey-calendar-shell__lens-block">
            <Text
              color="secondary"
              className="hockey-calendar-shell__lens-hint"
              data-testid={testId('calendar', 'shell', 'text', 'lens-hint')}
            >
              Смотреть как
            </Text>
            <div
              className="hockey-calendar-shell__lenses"
              data-testid={testId('calendar', 'shell', 'panel', 'lenses')}
              role="radiogroup"
              aria-label="Смотреть календарь как"
            >
              {LENS_OPTIONS.map((lens) => (
                <button
                  key={lens.id}
                  type="button"
                  role="radio"
                  aria-checked={state.lens === lens.id}
                  className={`hockey-calendar-shell__lens${state.lens === lens.id ? ' is-active' : ''}`}
                  onClick={() => patchState({lens: lens.id})}
                  data-testid={testId('calendar', 'shell', 'btn', 'lens', lens.id)}
                >
                  {lens.label}
                </button>
              ))}
            </div>
          </div>

          <CalendarQuickChips state={state} onChange={patchState} onReset={resetFilters} />

          <div className="hockey-calendar-shell__toolbar-actions">
            <HockeyButton
              view={filtersOpen ? 'action' : 'outlined'}
              size="s"
              onClick={() => setFiltersOpen((prev) => !prev)}
              data-testid={testId('calendar', 'shell', 'btn', 'filters-toggle')}
            >
              {filtersOpen ? 'Скрыть фильтры' : 'Фильтры'}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </HockeyButton>
          </div>

          {filtersOpen && (
            <div
              className="hockey-calendar-shell__filters"
              data-testid={testId('calendar', 'shell', 'panel', 'filters')}
            >
              <CalendarFilters
                filters={{
                  type: (state.type || undefined) as EventType | undefined,
                  attendanceStatus: (state.status || undefined) as AttendanceStatus | undefined,
                }}
                onChange={(filters) =>
                  patchState({
                    type: filters.type ?? '',
                    status: filters.attendanceStatus ?? '',
                  })
                }
              />
              {!forcedScope && (
                <div
                  className="hockey-row hockey-row--gap-12 hockey-row--wrap"
                  data-testid={testId('calendar', 'shell', 'panel', 'scope')}
                >
                  <Select
                    label="Чей календарь"
                    value={[state.scope]}
                    onUpdate={(value) => {
                      const scope = (value[0] as CalendarUiState['scope']) ?? 'me'
                      patchState({
                        scope,
                        scopeId: scope === 'me' ? '' : state.scopeId,
                      })
                    }}
                    options={[
                      {value: 'me', content: 'Мой'},
                      {value: 'player', content: 'Игрок'},
                      {value: 'team', content: 'Команда'},
                      {value: 'club', content: 'Клуб'},
                    ]}
                    width={160}
                    data-testid={testId('calendar', 'shell', 'select', 'scope')}
                  />
                  {state.scope !== 'me' && (
                    <Select
                      label="Выбор"
                      value={[state.scopeId || '']}
                      onUpdate={(value) => patchState({scopeId: value[0] ?? ''})}
                      options={
                        state.scope === 'team'
                          ? [
                              {value: 'team-001', content: 'Медведи САО'},
                              {value: 'team-002', content: 'Вымпел'},
                            ]
                          : state.scope === 'club'
                            ? [{value: 'club-001', content: 'Клуб Медведи'}]
                            : [
                                {value: 'user-001', content: 'Иван Петров'},
                                {value: 'user-003', content: 'Дмитрий Козлов'},
                              ]
                      }
                      width={200}
                      data-testid={testId('calendar', 'shell', 'select', 'scope-id')}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {showGoalieInbox && <GoalieRequestsInbox userId={userId} />}
          {showWindows && <AvailabilityWindowsPanel userId={userId} />}
        </div>
      )}

      {scopeDenied && (
        <div data-testid={testId('calendar', 'shell', 'empty', 'scope')}>
          <EmptyNetState
            title="Выберите контекст"
            copy="Укажите игрока, команду или клуб, чтобы открыть календарь."
          />
        </div>
      )}

      {isLoading && (
        <div data-testid={testId('calendar', 'shell', 'loader')}>
          <ScoreboardLoader label="Загрузка календаря" />
        </div>
      )}

      {isError && (
        <div data-testid={testId('calendar', 'shell', 'error')}>
          <EmptyNetState title="Не удалось загрузить" copy="Попробуйте обновить страницу." />
        </div>
      )}

      {!isLoading && !isError && !scopeDenied && state.view === 'month' && (
        <div
          className="hockey-calendar-shell__layout"
          data-testid={testId('calendar', 'shell', 'panel', 'month-layout')}
        >
          <CalendarMonthGrid
            selectedDate={selectedDate}
            events={events}
            onSelectDate={(date) => patchState({date})}
            onNavigateMonth={(date) => patchState({date})}
          />
          <CalendarAgenda
            selectedDate={selectedDate}
            events={events}
            currentUserId={userId}
            showActions={allowActions}
            showOrganizerMeta={state.lens === 'organizer'}
          />
        </div>
      )}

      {!isLoading && !isError && !scopeDenied && state.view === 'agenda' && (
        <>
          {events.length === 0 ? (
            <div data-testid={testId('calendar', 'shell', 'empty')}>
              <EmptyNetState title="Пустая сетка" copy={calendarLensEmptyCopy(state.lens)} />
            </div>
          ) : (
            <CalendarAgenda
              selectedDate={selectedDate}
              events={events}
              currentUserId={userId}
              showActions={allowActions}
              showOrganizerMeta={state.lens === 'organizer'}
            />
          )}
        </>
      )}
    </div>
  )
}
