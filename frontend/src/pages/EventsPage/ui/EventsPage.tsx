/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-3.1
 * HOCFRONT-28 / TASK-05 — страница «Игры и тренировки»
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'

import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'
import {fetchEvents} from '@/entities/event'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  ACCESS_SCOPE_FILTER_OPTIONS,
  canViewTraining,
  EventCard,
  EventCreateForm,
  getUserTeamIds,
  isUpcomingEvent,
  matchesAccessScopeFilter,
  OrganizerTrainingsPanel,
  SKILL_LEVEL_FILTER_OPTIONS,
  TRAINING_FORMAT_FILTER_OPTIONS,
} from '@/features/events'
import {LeagueGameRsvp, TeamRsvpList} from '@/features/radar'
import {getApiMode} from '@/shared/config/apiMode'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyRinkLoader} from '@/shared/ui/HockeyRinkLoader'
import {IceCard} from '@/shared/ui/IceCard'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

const MOCK_RESULTS_LOADER_MS = 3000
const RESULTS_LOADER_MS =
  isDemoLoaderEnabled() && getApiMode() === 'mock' && import.meta.env.MODE !== 'test'
    ? MOCK_RESULTS_LOADER_MS
    : 240

function isDemoLoaderEnabled(): boolean {
  return import.meta.env.VITE_DEMO_LOADER !== 'false'
}

const SHOW_MOCK_DEMO_LOADER =
  isDemoLoaderEnabled() && getApiMode() === 'mock' && import.meta.env.MODE !== 'test'

type CatalogTypeFilter = 'all' | 'training' | 'game'

/**
 * @spec SPEC-UI-2.5 - Раздел «Игры и тренировки»
 * @spec SPEC-FR-4.1.1 - Список будущих игр и тренировок
 * @spec TASK-05-02 - Без матч-центра и прошедших в основном списке
 */
export function EventsPage() {
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {userId, roles, session, canOrganizeEvents} = useSessionAccess()
  const canSeeDeclineDetails =
    roles.includes('captain') || roles.includes('coach') || roles.includes('admin')
  const upcomingCatalog = useMemo(
    () =>
      events
        .filter(
          (event) =>
            (event.type === 'training' || event.type === 'game') && isUpcomingEvent(event.startsAt),
        )
        .slice()
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events],
  )
  const [catalogType, setCatalogType] = useState<CatalogTypeFilter>('all')
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
  /** League RSVP — вторичный блок (TASK-05-02), по умолчанию свёрнут */
  const [isNearestGameVisible, setIsNearestGameVisible] = useState(false)
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)
  const [isResultsLoading, setIsResultsLoading] = useState(false)
  const [isDemoLoaderVisible, setIsDemoLoaderVisible] = useState(SHOW_MOCK_DEMO_LOADER)
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!SHOW_MOCK_DEMO_LOADER) return
    const timer = window.setTimeout(() => {
      setIsDemoLoaderVisible(false)
    }, MOCK_RESULTS_LOADER_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const userTeamIds = useMemo(() => getUserTeamIds(teams, userId), [teams, userId])
  const isAdmin = roles.includes('admin')
  const clubMembershipIds = useMemo(
    () =>
      new Set(
        (session?.user.partnerMemberships ?? [])
          .filter((membership) => membership.kind === 'club')
          .map((membership) => membership.entityId),
      ),
    [session?.user.partnerMemberships],
  )

  const formatOptions = [...TRAINING_FORMAT_FILTER_OPTIONS]

  const timeOptions = [
    {value: 'all', content: 'Любое время'},
    {value: 'morning', content: 'Утро (06:00-11:59)'},
    {value: 'day', content: 'День (12:00-17:59)'},
    {value: 'evening', content: 'Вечер (18:00-23:59)'},
  ]

  const levelOptions = [...SKILL_LEVEL_FILTER_OPTIONS]

  const statusOptions = [
    {value: 'all', content: 'Любой статус'},
    {value: 'open', content: 'Открыт для записи'},
    {value: 'full', content: 'Состав укомплектован'},
  ]

  const accessOptions = [...ACCESS_SCOPE_FILTER_OPTIONS]

  const fillStateOptions = [
    {value: 'all', content: 'Любая заполненность'},
    {value: 'guaranteed', content: 'Точно состоится'},
    {value: 'questionable', content: 'Под вопросом'},
    {value: 'full', content: 'Полностью укомплектована'},
  ]

  const arenaOptions = [
    {value: 'all', content: 'Любая арена'},
    ...Array.from(new Set(upcomingCatalog.map((item) => item.arenaId))).map((arenaId) => ({
      value: arenaId,
      content: upcomingCatalog.find((item) => item.arenaId === arenaId)?.arenaName ?? arenaId,
    })),
  ]

  const districtOptions = [
    {value: 'all', content: 'Любой округ'},
    ...Array.from(new Set(upcomingCatalog.map((item) => item.district).filter(Boolean))).map(
      (district) => ({
        value: district!,
        content: district!,
      }),
    ),
  ]

  const filtersEnabled = isFiltersVisible

  const filteredCatalog = upcomingCatalog
    .filter((item) => (catalogType === 'all' ? true : item.type === catalogType))
    .filter((item) =>
      canViewTraining(item, userId, userTeamIds, {
        isAdmin,
        canManageClub: Boolean(item.clubId && clubMembershipIds.has(item.clubId)),
      }),
    )
    .filter((item) => {
      const query = searchQuery.trim().toLowerCase()
      if (!query) return true
      const haystack = [
        item.title,
        item.arenaName,
        item.arenaId,
        item.district,
        item.requiredSkillLevel,
        item.trainingFormat,
        item.organizerDisplayName,
        item.organizerPhone,
        item.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (!selectedDate) return true
      return item.startsAt.slice(0, 10) === selectedDate
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedFormat === 'all') return true
      if (item.type !== 'training') return true
      return item.trainingFormat === selectedFormat
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedTimeSlot === 'all') return true
      const hour = new Date(item.startsAt).getHours()
      if (selectedTimeSlot === 'morning') return hour >= 6 && hour < 12
      if (selectedTimeSlot === 'day') return hour >= 12 && hour < 18
      return hour >= 18 || hour < 6
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedLevel === 'all') return true
      return item.requiredSkillLevel === selectedLevel
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedArena === 'all') return true
      return item.arenaId === selectedArena
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedStatus === 'all') return true
      return item.registrationStatus === selectedStatus
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedDistrict === 'all') return true
      return item.district === selectedDistrict
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (item.type !== 'training' && selectedAccessScope !== 'all') return true
      return matchesAccessScopeFilter(item.accessScope, selectedAccessScope)
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      if (selectedFillState === 'all') return true
      const requiredTotal = item.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
      const filledTotal = item.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
      const fillRatio = requiredTotal > 0 ? filledTotal / requiredTotal : 0
      if (selectedFillState === 'full') {
        return item.registrationStatus === 'full' || fillRatio >= 1
      }
      if (selectedFillState === 'guaranteed') {
        return fillRatio >= 0.7 || item.registrationStatus === 'full'
      }
      return fillRatio < 0.7 && item.registrationStatus !== 'full'
    })
    .filter((item) => {
      if (!filtersEnabled) return true
      const price = item.pricePerPlayer ?? 0
      if (minPrice && price < Number(minPrice)) return false
      return !(maxPrice && price > Number(maxPrice))
    })

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    setIsResultsLoading(true)
    const timer = window.setTimeout(() => {
      setIsResultsLoading(false)
    }, RESULTS_LOADER_MS)
    return () => window.clearTimeout(timer)
  }, [
    catalogType,
    searchQuery,
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
    filtersEnabled,
  ])

  return (
    <div className="hockey-stack hockey-stack--gap-20" data-testid={testId('events', 'page')}>
      <ScrollReveal direction="down">
        <Text
          variant="header-1"
          className="variable-font-header"
          data-testid={testId('events', 'page', 'text', 'title')}
        >
          {EVENTS_LABEL}
        </Text>
        <Text color="secondary" data-testid={testId('events', 'page', 'text', 'subtitle')}>
          Будущие игры и тренировки: поиск, фильтры, запись. Прошедшие события убраны из списка.
        </Text>
      </ScrollReveal>

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('events', 'page', 'panel', 'type-tabs')}
      >
        {(
          [
            {id: 'all', label: 'Все'},
            {id: 'training', label: 'Тренировки'},
            {id: 'game', label: 'Игры'},
          ] as const
        ).map((tab) => (
          <HockeyButton
            key={tab.id}
            view={catalogType === tab.id ? 'action' : 'outlined'}
            size="s"
            onClick={() => setCatalogType(tab.id)}
            data-testid={testId('events', 'page', 'btn', 'type', tab.id)}
          >
            {tab.label}
          </HockeyButton>
        ))}
      </div>

      <IceCard padding="m" data-testid={testId('events', 'page', 'card', 'search')}>
        <TextInput
          size="xl"
          placeholder="Поиск: название, арена, округ, формат, уровень, организатор"
          value={searchQuery}
          onUpdate={setSearchQuery}
          data-testid={testId('events', 'page', 'field', 'search')}
        />
      </IceCard>

      {canOrganizeEvents && (
        <ScrollReveal direction="left">
          <div
            className="hockey-stack hockey-stack--gap-12"
            data-testid={testId('events', 'page', 'panel', 'organizer')}
          >
            <div data-testid={testId('events', 'page', 'card', 'create-form')}>
              <IceCard padding="m">
                <EventCreateForm />
              </IceCard>
            </div>
            <OrganizerTrainingsPanel events={upcomingCatalog} organizerUserId={userId} />
          </div>
        </ScrollReveal>
      )}

      <div
        className="hockey-stack hockey-stack--gap-10"
        data-testid={testId('events', 'page', 'panel', 'filters')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'filters-title')}
          >
            Фильтры
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setIsFiltersVisible((prev) => !prev)}
            data-testid={testId('events', 'page', 'btn', 'filters-toggle')}
          >
            {isFiltersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
          </HockeyButton>
        </div>
        {isFiltersVisible && (
          <div
            className="hockey-grid hockey-grid--cards-280"
            data-testid={testId('events', 'page', 'grid', 'filters')}
          >
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'date')}
              >
                Дата
              </Text>
              <input
                type="date"
                className="g-text-input__control"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                data-testid={testId('events', 'page', 'field', 'date')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'format')}
              >
                Формат
              </Text>
              <Select
                value={[selectedFormat]}
                onUpdate={(value) => setSelectedFormat(value[0] ?? 'all')}
                options={formatOptions}
                data-testid={testId('events', 'page', 'select', 'format')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'time')}
              >
                Время
              </Text>
              <Select
                value={[selectedTimeSlot]}
                onUpdate={(value) => setSelectedTimeSlot(value[0] ?? 'all')}
                options={timeOptions}
                data-testid={testId('events', 'page', 'select', 'time')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'level')}
              >
                Уровень игрока
              </Text>
              <Select
                value={[selectedLevel]}
                onUpdate={(value) => setSelectedLevel(value[0] ?? 'all')}
                options={levelOptions}
                data-testid={testId('events', 'page', 'select', 'level')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'arena')}
              >
                Арена
              </Text>
              <Select
                value={[selectedArena]}
                onUpdate={(value) => setSelectedArena(value[0] ?? 'all')}
                options={arenaOptions}
                data-testid={testId('events', 'page', 'select', 'arena')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'status')}
              >
                Статус
              </Text>
              <Select
                value={[selectedStatus]}
                onUpdate={(value) => setSelectedStatus(value[0] ?? 'all')}
                options={statusOptions}
                data-testid={testId('events', 'page', 'select', 'status')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'district')}
              >
                Округ
              </Text>
              <Select
                value={[selectedDistrict]}
                onUpdate={(value) => setSelectedDistrict(value[0] ?? 'all')}
                options={districtOptions}
                data-testid={testId('events', 'page', 'select', 'district')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'access')}
              >
                Доступ
              </Text>
              <Select
                value={[selectedAccessScope]}
                onUpdate={(value) => setSelectedAccessScope(value[0] ?? 'all')}
                options={accessOptions}
                data-testid={testId('events', 'page', 'select', 'access')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'fill-state')}
              >
                Заполненность
              </Text>
              <Select
                value={[selectedFillState]}
                onUpdate={(value) => setSelectedFillState(value[0] ?? 'all')}
                options={fillStateOptions}
                data-testid={testId('events', 'page', 'select', 'fill-state')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'price-min')}
              >
                Цена от
              </Text>
              <TextInput
                value={minPrice}
                onUpdate={setMinPrice}
                data-testid={testId('events', 'page', 'field', 'price-min')}
              />
            </div>
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="body-2"
                data-testid={testId('events', 'page', 'text', 'filter-label', 'price-max')}
              >
                Цена до
              </Text>
              <TextInput
                value={maxPrice}
                onUpdate={setMaxPrice}
                data-testid={testId('events', 'page', 'field', 'price-max')}
              />
            </div>
          </div>
        )}
      </div>

      {(isLoading || isResultsLoading || isDemoLoaderVisible) && (
        <div data-testid={testId('events', 'page', 'loader')}>
          <HockeyRinkLoader
            label={
              isLoading || isDemoLoaderVisible
                ? 'Загрузка игр и тренировок...'
                : 'Обновляем результаты...'
            }
            testIdPrefix="events"
          />
        </div>
      )}

      {!isLoading && !isResultsLoading && !isDemoLoaderVisible && upcomingCatalog.length === 0 && (
        <div data-testid={testId('events', 'page', 'empty', 'upcoming')}>
          <EmptyNetState
            title="Событий пока нет"
            copy="Ближайшие игры и тренировки появятся здесь."
          />
        </div>
      )}

      {!isLoading && !isResultsLoading && !isDemoLoaderVisible && filteredCatalog.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('events', 'page', 'list', 'details')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'details-title')}
          >
            Список игр и тренировок
          </Text>
          {filteredCatalog.map((event, index) => (
            <ScrollReveal key={event.id} direction={index % 2 === 0 ? 'up' : 'down'}>
              <div id={event.id}>
                <EventCard event={event} currentUserId={userId} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {!isLoading &&
        !isResultsLoading &&
        !isDemoLoaderVisible &&
        upcomingCatalog.length > 0 &&
        filteredCatalog.length === 0 && (
          <div data-testid={testId('events', 'page', 'empty', 'trainings')}>
            <EmptyNetState
              title="Ничего не найдено"
              copy="Нет будущих событий по текущим фильтрам. Измените вкладку, фильтры или поиск."
            />
          </div>
        )}

      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('events', 'page', 'panel', 'nearest-game')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'nearest-game-title')}
          >
            Ближайшая игра команды
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setIsNearestGameVisible((prev) => !prev)}
            data-testid={testId('events', 'page', 'btn', 'nearest-game-toggle')}
          >
            {isNearestGameVisible ? 'Скрыть' : 'Показать'}
          </HockeyButton>
        </div>
        {isNearestGameVisible && (
          <div
            className="nearest-game-record"
            data-testid={testId('events', 'page', 'panel', 'league-rsvp')}
          >
            <LeagueGameRsvp eventId={LEAGUE_SATURDAY_EVENT_ID} currentUserId={userId} />
            <TeamRsvpList
              eventId={LEAGUE_SATURDAY_EVENT_ID}
              canSeeDeclineDetails={canSeeDeclineDetails}
            />
          </div>
        )}
      </div>
    </div>
  )
}
