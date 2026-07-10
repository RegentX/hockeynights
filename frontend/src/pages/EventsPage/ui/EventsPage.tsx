/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-3.1
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Search, Trophy} from 'lucide-react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Link} from 'react-router-dom'

import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'
import {fetchEvents} from '@/entities/event'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {
  canViewTraining,
  EventCard,
  EventCreateForm,
  getUserTeamIds,
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

/**
 * @spec SPEC-UI-2.5 - Страница событий как матч-центр
 * @spec SPEC-FR-4.1.1 - Страница событий
 */
export function EventsPage() {
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
  const {userId, roles, canOrganizeEvents} = useSessionAccess()
  const canSeeDeclineDetails =
    roles.includes('captain') || roles.includes('coach') || roles.includes('admin')
  const trainings = events.filter((event) => event.type === 'training')
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
  const [isNearestGameVisible, setIsNearestGameVisible] = useState(true)
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

  const accessOptions = [
    {value: 'all', content: 'Любой доступ'},
    {value: 'club_only', content: 'Внутри клуба'},
    {value: 'limited', content: 'Для ограниченных лиц'},
    {value: 'public', content: 'Публичная'},
  ]

  const fillStateOptions = [
    {value: 'all', content: 'Любая заполненность'},
    {value: 'guaranteed', content: 'Точно состоится'},
    {value: 'questionable', content: 'Под вопросом'},
    {value: 'full', content: 'Полностью укомплектована'},
  ]

  const arenaOptions = [
    {value: 'all', content: 'Любая арена'},
    ...Array.from(new Set(trainings.map((training) => training.arenaId))).map((arenaId) => ({
      value: arenaId,
      content: trainings.find((training) => training.arenaId === arenaId)?.arenaName ?? arenaId,
    })),
  ]

  const districtOptions = [
    {value: 'all', content: 'Любой округ'},
    ...Array.from(new Set(trainings.map((training) => training.district).filter(Boolean))).map(
      (district) => ({
        value: district!,
        content: district!,
      }),
    ),
  ]

  const filtersEnabled = isFiltersVisible

  const filteredTrainings = trainings
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
      if (!filtersEnabled) return true
      if (!selectedDate) return true
      return training.startsAt.slice(0, 10) === selectedDate
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedFormat === 'all') return true
      return training.trainingFormat === selectedFormat
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedTimeSlot === 'all') return true
      const hour = new Date(training.startsAt).getHours()
      if (selectedTimeSlot === 'morning') return hour >= 6 && hour < 12
      if (selectedTimeSlot === 'day') return hour >= 12 && hour < 18
      return hour >= 18 || hour < 6
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedLevel === 'all') return true
      return training.requiredSkillLevel === selectedLevel
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedArena === 'all') return true
      return training.arenaId === selectedArena
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedStatus === 'all') return true
      return training.registrationStatus === selectedStatus
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedDistrict === 'all') return true
      return training.district === selectedDistrict
    })
    .filter((training) => {
      if (!filtersEnabled) return true
      if (selectedAccessScope === 'all') return true
      return training.accessScope === selectedAccessScope
    })
    .filter((training) => {
      if (!filtersEnabled) return true
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
      if (!filtersEnabled) return true
      const price = training.pricePerPlayer ?? 0
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
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text
              variant="header-1"
              className="variable-font-header"
              data-testid={testId('events', 'page', 'text', 'title')}
            >
              {EVENTS_LABEL}
            </Text>
            <Text color="secondary" data-testid={testId('events', 'page', 'text', 'subtitle')}>
              Все записи и ближайшие активности теперь собраны в одном разделе.
            </Text>
          </div>
          <Link
            to="/events/magic"
            className="hockey-ui-preview-link"
            data-testid={testId('events', 'page', 'link', 'magic-preview')}
          >
            Magic UI preview →
          </Link>
        </div>
      </ScrollReveal>

      <IceCard padding="m" data-testid={testId('events', 'page', 'card', 'search')}>
        <TextInput
          size="xl"
          placeholder="Поиск по тренировкам: название, арена, округ, формат, уровень, организатор, телефон"
          value={searchQuery}
          onUpdate={setSearchQuery}
          data-testid={testId('events', 'page', 'field', 'search')}
        />
      </IceCard>

      <div
        className="hockey-grid hockey-grid--cards-280"
        data-testid={testId('events', 'page', 'grid')}
      >
        {canOrganizeEvents && (
          <ScrollReveal direction="left">
            <div data-testid={testId('events', 'page', 'card', 'create-form')}>
              <IceCard padding="m">
                <EventCreateForm />
              </IceCard>
            </div>
          </ScrollReveal>
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
              <Trophy size={18} color="#38bdf8" aria-hidden /> Ближайшая игра и мои игры
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

      <div
        className="hockey-stack hockey-stack--gap-10"
        data-testid={testId('events', 'page', 'panel', 'filters')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'filters-title')}
          >
            <Search size={18} color="#38bdf8" aria-hidden /> Фильтры тренировок
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
                ? 'Загрузка тренировок...'
                : 'Обновляем результаты...'
            }
            testIdPrefix="events"
          />
        </div>
      )}

      {!isLoading && !isResultsLoading && !isDemoLoaderVisible && events.length === 0 && (
        <div data-testid={testId('events', 'page', 'empty', 'upcoming')}>
          <EmptyNetState
            title="Событий пока нет"
            copy="Ближайшие игры и тренировки появятся здесь."
          />
        </div>
      )}

      {!isLoading && !isResultsLoading && !isDemoLoaderVisible && filteredTrainings.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('events', 'page', 'list', 'details')}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'page', 'text', 'details-title')}
          >
            Список тренировок
          </Text>
          {filteredTrainings.map((event, index) => (
            <ScrollReveal key={event.id} direction={index % 2 === 0 ? 'up' : 'down'}>
              <EventCard event={event} currentUserId={userId} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {!isLoading &&
        !isResultsLoading &&
        !isDemoLoaderVisible &&
        filteredTrainings.length === 0 && (
          <div data-testid={testId('events', 'page', 'empty', 'trainings')}>
            <EmptyNetState
              title="Тренировки не найдены"
              copy="Измените фильтры или поисковый запрос."
            />
          </div>
        )}
    </div>
  )
}
