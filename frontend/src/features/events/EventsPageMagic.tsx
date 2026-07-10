/**
 * HOCFRONT-13 — прототип матч-центра на Magic UI (Tailwind + Framer Motion).
 * @spec SPEC-FR-4.1.1 - Прототип страницы событий на Magic UI.
 * Маршрут: /events/magic — не заменяет основную EventsPage.
 */

import '@/shared/magic-ui/magic-ui.css'

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {CalendarDays, Filter, Search} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Link} from 'react-router-dom'

import {LEAGUE_SATURDAY_EVENT_ID, fetchEventRsvp, fetchEvents} from '@/entities/event'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  canViewTraining,
  getUserTeamIds,
  SKILL_LEVEL_FILTER_OPTIONS,
  TRAINING_FORMAT_FILTER_OPTIONS,
} from '@/features/events'
import {EventMagicCard} from '@/features/events/magic/EventMagicCard'
import {NearestGameTeaserCard} from '@/features/events/magic/NearestGameTeaserCard'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {cn} from '@/shared/lib/cn'
import {MagicCard} from '@/shared/magic-ui/magic-card'
import {MagicDatePicker} from '@/shared/magic-ui/magic-date-picker'
import {MagicSelectField} from '@/shared/magic-ui/magic-select-field'
import {ShimmerButton} from '@/shared/magic-ui/shimmer-button'
import {testId} from '@/shared/testing/testId'

const TIME_OPTIONS = [
  {value: 'all', content: 'Любое время'},
  {value: 'morning', content: 'Утро (06:00-11:59)'},
  {value: 'day', content: 'День (12:00-17:59)'},
  {value: 'evening', content: 'Вечер (18:00-23:59)'},
] as const

const STATUS_OPTIONS = [
  {value: 'all', content: 'Любой статус'},
  {value: 'open', content: 'Открыт для записи'},
  {value: 'full', content: 'Состав укомплектован'},
] as const

const ACCESS_OPTIONS = [
  {value: 'all', content: 'Любой доступ'},
  {value: 'club_only', content: 'Внутри клуба'},
  {value: 'limited', content: 'Для ограниченных лиц'},
  {value: 'public', content: 'Публичная'},
] as const

const FILL_STATE_OPTIONS = [
  {value: 'all', content: 'Любая заполненность'},
  {value: 'guaranteed', content: 'Точно состоится'},
  {value: 'questionable', content: 'Под вопросом'},
  {value: 'full', content: 'Полностью укомплектована'},
] as const

export function EventsPageMagic() {
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
  const {userId, roles, canOrganizeEvents} = useSessionAccess()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedArena, setSelectedArena] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [selectedAccessScope, setSelectedAccessScope] = useState('all')
  const [selectedFillState, setSelectedFillState] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const PAGE_SIZE = 20
  const [visibleTrainingsCount, setVisibleTrainingsCount] = useState(PAGE_SIZE)
  const [isLoadingMoreTrainings, setIsLoadingMoreTrainings] = useState(false)
  const trainingsSentinelRef = useRef<HTMLDivElement | null>(null)

  const userTeamIds = useMemo(() => getUserTeamIds(teams, userId), [teams, userId])
  const isAdmin = roles.includes('admin')
  const trainings = useMemo(() => events.filter((event) => event.type === 'training'), [events])

  const formatOptions = useMemo(() => [...TRAINING_FORMAT_FILTER_OPTIONS], [])
  const levelOptions = useMemo(() => [...SKILL_LEVEL_FILTER_OPTIONS], [])

  const arenaOptions = useMemo(
    () => [
      {value: 'all', content: 'Любая арена'},
      ...Array.from(new Set(trainings.map((training) => training.arenaId))).map((arenaId) => ({
        value: arenaId,
        content: trainings.find((training) => training.arenaId === arenaId)?.arenaName ?? arenaId,
      })),
    ],
    [trainings],
  )

  const districtOptions = useMemo(
    () => [
      {value: 'all', content: 'Любой округ'},
      ...Array.from(new Set(trainings.map((training) => training.district).filter(Boolean))).map(
        (district) => ({
          value: district!,
          content: district!,
        }),
      ),
    ],
    [trainings],
  )

  const filteredTrainings = useMemo(() => {
    return trainings
      .filter((training) => canViewTraining(training, userId, userTeamIds, isAdmin))
      .filter((training) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        const haystack = [
          training.title,
          training.arenaName,
          training.arenaId,
          training.district,
          training.requiredSkillLevel,
          training.trainingFormat,
          training.organizerDisplayName,
          training.organizerPhone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
      .filter((training) => {
        if (!showFilters) return true
        if (!selectedDate) return true
        return training.startsAt.slice(0, 10) === selectedDate
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedFormat === 'all') return true
        return training.trainingFormat === selectedFormat
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedTimeSlot === 'all') return true
        const hour = new Date(training.startsAt).getHours()
        if (selectedTimeSlot === 'morning') return hour >= 6 && hour < 12
        if (selectedTimeSlot === 'day') return hour >= 12 && hour < 18
        return hour >= 18 || hour < 6
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedLevel === 'all') return true
        return training.requiredSkillLevel === selectedLevel
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedArena === 'all') return true
        return training.arenaId === selectedArena
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedStatus === 'all') return true
        return training.registrationStatus === selectedStatus
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedDistrict === 'all') return true
        return training.district === selectedDistrict
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedAccessScope === 'all') return true
        return training.accessScope === selectedAccessScope
      })
      .filter((training) => {
        if (!showFilters) return true
        if (selectedFillState === 'all') return true
        const requiredTotal = training.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
        const filledTotal = training.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
        const fillRatio = requiredTotal > 0 ? filledTotal / requiredTotal : 0
        if (selectedFillState === 'full') {
          return training.registrationStatus === 'full' || fillRatio >= 1
        }
        if (selectedFillState === 'guaranteed') {
          return fillRatio >= 0.7 || training.registrationStatus === 'full'
        }
        return fillRatio < 0.7 && training.registrationStatus !== 'full'
      })
      .filter((training) => {
        if (!showFilters) return true
        const price = training.pricePerPlayer ?? 0
        if (minPrice && price < Number(minPrice)) return false
        if (maxPrice && price > Number(maxPrice)) return false
        return true
      })
  }, [
    trainings,
    searchQuery,
    showFilters,
    selectedDate,
    selectedFormat,
    selectedTimeSlot,
    selectedLevel,
    selectedArena,
    selectedStatus,
    selectedDistrict,
    selectedAccessScope,
    selectedFillState,
    minPrice,
    maxPrice,
    userId,
    userTeamIds,
    isAdmin,
  ])

  const visibleTrainings = filteredTrainings.slice(0, visibleTrainingsCount)
  const hasMoreTrainings = visibleTrainingsCount < filteredTrainings.length

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisibleTrainingsCount(PAGE_SIZE)
      setIsLoadingMoreTrainings(false)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    searchQuery,
    showFilters,
    selectedDate,
    selectedFormat,
    selectedTimeSlot,
    selectedLevel,
    selectedArena,
    selectedStatus,
    selectedDistrict,
    selectedAccessScope,
    selectedFillState,
    minPrice,
    maxPrice,
    PAGE_SIZE,
  ])

  useEffect(() => {
    const el = trainingsSentinelRef.current
    if (!el) return
    if (!hasMoreTrainings) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((e) => e.isIntersecting)
        if (!isIntersecting) return
        if (!hasMoreTrainings || isLoadingMoreTrainings) return

        setIsLoadingMoreTrainings(true)
        window.setTimeout(() => {
          setVisibleTrainingsCount((prev) => Math.min(prev + PAGE_SIZE, filteredTrainings.length))
          setIsLoadingMoreTrainings(false)
        }, 250)
      },
      {rootMargin: '300px'},
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [
    trainingsSentinelRef,
    hasMoreTrainings,
    isLoadingMoreTrainings,
    PAGE_SIZE,
    filteredTrainings.length,
  ])

  const {
    data: nearestGameBoard,
    isLoading: isNearestGameLoading,
  } = useQuery({
    queryKey: ['event-rsvp', LEAGUE_SATURDAY_EVENT_ID],
    queryFn: () => fetchEventRsvp(LEAGUE_SATURDAY_EVENT_ID),
  })

  const nearestGameStart = nearestGameBoard ? new Date(nearestGameBoard.startsAt) : null
  const nearestGameDateTimeShort = nearestGameStart
    ? nearestGameStart.toLocaleString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div
      className="magic-page"
      data-testid={testId('events', 'magic', 'page')}
    >
      <div className="magic-page__bg1" />
      <div className="magic-page__bg2" />

      <div className="magic-layout">
        <header>
          <div className="magic-header-intro">
            <div className="magic-title-row">
              <Text
                variant="header-1"
                className="variable-font-header"
                data-testid={testId('events', 'magic', 'text', 'title')}
              >
                {EVENTS_LABEL}
              </Text>
              <Link
                to="/events"
                className="magic-classic-link magic-classic-link--inline"
                data-testid={testId('events', 'magic', 'link', 'classic')}
              >
                ← Классический вид
              </Link>
            </div>
          </div>

          <MagicCard
            className="magic-card--search"
            data-testid={testId('events', 'magic', 'panel', 'search')}
          >
            <div className="magic-search-bar">
              <Search className="magic-search-bar__icon" size={20} aria-hidden />
              <input
                type="search"
                placeholder="Поиск: арена, округ, организатор..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="magic-search-input"
                data-testid={testId('events', 'magic', 'field', 'search')}
              />
              <div className="magic-search-bar__actions">
                <button
                  type="button"
                  aria-label={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                  aria-pressed={showFilters}
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={cn(
                    'magic-search-filter-icon-btn',
                    showFilters && 'magic-search-filter-icon-btn--active',
                  )}
                  data-testid={testId('events', 'magic', 'btn', 'filters-toggle')}
                >
                  <Filter size={18} aria-hidden />
                </button>
              </div>
            </div>
          </MagicCard>
        </header>

        {showFilters && (
          <section
            className="magic-filters"
            data-testid={testId('events', 'magic', 'panel', 'filters')}
          >
            <p
              className="magic-filters__title"
              data-testid={testId('events', 'magic', 'text', 'filters-title')}
            >
              <Search size={16} color="#38bdf8" aria-hidden />
              Фильтры тренировок
            </p>
            <div
              className="magic-filters-grid"
              data-testid={testId('events', 'magic', 'grid', 'filters')}
            >
              <MagicFilterDate
                label="Дата"
                value={selectedDate}
                onChange={setSelectedDate}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'date')}
                testIdField={testId('events', 'magic', 'field', 'date')}
              />
              <MagicFilterSelect
                label="Формат"
                value={selectedFormat}
                onChange={setSelectedFormat}
                options={formatOptions}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'format')}
                testIdField={testId('events', 'magic', 'select', 'format')}
              />
              <MagicFilterSelect
                label="Время"
                value={selectedTimeSlot}
                onChange={setSelectedTimeSlot}
                options={TIME_OPTIONS}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'time')}
                testIdField={testId('events', 'magic', 'select', 'time')}
              />
              <MagicFilterSelect
                label="Уровень игрока"
                value={selectedLevel}
                onChange={setSelectedLevel}
                options={levelOptions}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'level')}
                testIdField={testId('events', 'magic', 'select', 'level')}
              />
              <MagicFilterSelect
                label="Арена"
                value={selectedArena}
                onChange={setSelectedArena}
                options={arenaOptions}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'arena')}
                testIdField={testId('events', 'magic', 'select', 'arena')}
              />
              <MagicFilterSelect
                label="Статус"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={STATUS_OPTIONS}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'status')}
                testIdField={testId('events', 'magic', 'select', 'status')}
              />
              <MagicFilterSelect
                label="Округ"
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                options={districtOptions}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'district')}
                testIdField={testId('events', 'magic', 'select', 'district')}
              />
              <MagicFilterSelect
                label="Доступ"
                value={selectedAccessScope}
                onChange={setSelectedAccessScope}
                options={ACCESS_OPTIONS}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'access')}
                testIdField={testId('events', 'magic', 'select', 'access')}
              />
              <MagicFilterSelect
                label="Заполненность"
                value={selectedFillState}
                onChange={setSelectedFillState}
                options={FILL_STATE_OPTIONS}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'fill-state')}
                testIdField={testId('events', 'magic', 'select', 'fill-state')}
              />
              <MagicFilterInput
                label="Цена от"
                type="number"
                value={minPrice}
                onChange={setMinPrice}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'price-min')}
                testIdField={testId('events', 'magic', 'field', 'price-min')}
              />
              <MagicFilterInput
                label="Цена до"
                type="number"
                value={maxPrice}
                onChange={setMaxPrice}
                testIdLabel={testId('events', 'magic', 'text', 'filter-label', 'price-max')}
                testIdField={testId('events', 'magic', 'field', 'price-max')}
              />
            </div>
          </section>
        )}

        {nearestGameBoard && (
          <NearestGameTeaserCard
            board={nearestGameBoard}
            dateTimeLabel={nearestGameDateTimeShort || nearestGameBoard.arenaName}
          />
        )}

        {isNearestGameLoading && !nearestGameBoard && (
          <MagicCard data-testid={testId('events', 'magic', 'loader', 'nearest-game')}>
            <div className="magic-nearest-game-teaser__inner magic-nearest-game-teaser__inner--loading">
              Загрузка ближайшей игры...
            </div>
          </MagicCard>
        )}

        <section
          data-testid={testId('events', 'magic', 'panel', 'trainings')}
        >
          <div className="magic-trainings-header">
            <CalendarDays size={22} color="#38bdf8" aria-hidden />
            <h2
              className="magic-section-title magic-trainings-header__title"
              data-testid={testId('events', 'magic', 'text', 'trainings-title')}
            >
              Тренировки · {isLoading ? '...' : filteredTrainings.length}
            </h2>
          </div>

          {isLoading && (
            <div className="magic-loader" data-testid={testId('events', 'magic', 'loader')}>
              <span>Загрузка льда...</span>
            </div>
          )}

          {!isLoading && filteredTrainings.length === 0 && (
            <MagicCard data-testid={testId('events', 'magic', 'empty')}>
              <div style={{padding: 32, textAlign: 'center'}}>
                <p style={{fontSize: 18, fontWeight: 600, color: '#fff', margin: 0}}>
                  Тренировки не найдены
                </p>
                <p style={{marginTop: 8, fontSize: 14, color: '#94a3b8', marginBottom: 0}}>
                  Попробуйте другой поиск или сбросьте фильтры.
                </p>
              </div>
            </MagicCard>
          )}

          {!isLoading && filteredTrainings.length > 0 && (
            <>
              <div
                className="magic-trainings-list"
                data-testid={testId('events', 'magic', 'grid', 'trainings')}
              >
                {visibleTrainings.map((event) => (
                  <EventMagicCard key={event.id} event={event} currentUserId={userId} />
                ))}
              </div>

              {hasMoreTrainings && (
                <div className="magic-infinite-more" aria-hidden>
                  {isLoadingMoreTrainings && (
                    <div className="magic-loader magic-loader--small">Подгружаем ещё 20...</div>
                  )}
                  <div
                    ref={trainingsSentinelRef}
                    className="magic-infinite-sentinel"
                    data-testid={testId('events', 'magic', 'loader', 'infinite')}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {canOrganizeEvents && filteredTrainings.length > 0 && (
          <div style={{display: 'flex', justifyContent: 'center', paddingTop: 8}}>
            <ShimmerButton
              shimmerColor="#38bdf8"
              background="linear-gradient(135deg, #0e3a5f 0%, #1e1b4b 100%)"
              data-testid={testId('events', 'magic', 'btn', 'create')}
            >
              + Создать тренировку
            </ShimmerButton>
          </div>
        )}
      </div>
    </div>
  )
}

type MagicFilterOption = {value: string; content: string}

function MagicFilterSelect({
  label,
  value,
  onChange,
  options,
  testIdLabel,
  testIdField,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly MagicFilterOption[]
  testIdLabel: string
  testIdField: string
}) {
  return (
    <div className="magic-filter-field">
      <label className="magic-filter-label" data-testid={testIdLabel}>
        {label}
      </label>
      <MagicSelectField
        value={value}
        onChange={onChange}
        options={options}
        testId={testIdField}
      />
    </div>
  )
}

function MagicFilterDate({
  label,
  value,
  onChange,
  testIdLabel,
  testIdField,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  testIdLabel: string
  testIdField: string
}) {
  return (
    <div className="magic-filter-field">
      <label className="magic-filter-label" data-testid={testIdLabel}>
        {label}
      </label>
      <MagicDatePicker value={value} onChange={onChange} testId={testIdField} />
    </div>
  )
}

function MagicFilterInput({
  label,
  type,
  value,
  onChange,
  testIdLabel,
  testIdField,
}: {
  label: string
  type: 'number' | 'text'
  value: string
  onChange: (value: string) => void
  testIdLabel: string
  testIdField: string
}) {
  return (
    <div className="magic-filter-field">
      <label className="magic-filter-label" htmlFor={testIdField} data-testid={testIdLabel}>
        {label}
      </label>
      <input
        id={testIdField}
        type={type}
        className="magic-filter-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testIdField}
      />
    </div>
  )
}
