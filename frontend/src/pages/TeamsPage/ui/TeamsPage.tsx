/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2
 * SPEC-UI-2.3
 * HOCFRONT-25 — лента команд: отдельный поиск + фильтры
 * HOCFRONT-19 — FavoriteButton на TeamCard; deep-link /teams/:teamId
 */

import {Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import {fetchTeams, type TeamsFilterParams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {TeamCard, TeamFilters} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScrollReveal} from '@/shared/ui/ScrollStory'

const EMPTY_FILTERS: TeamsFilterParams = {}

function hasActiveFilters(filters: TeamsFilterParams): boolean {
  return Object.entries(filters).some(
    ([key, value]) => key !== 'q' && value !== undefined && value !== '',
  )
}

/**
 * @spec SPEC-UI-2.3 - Лента команд
 * @spec SPEC-FR-3.1.1 - Публичный список с поиском и фильтрами
 */
export function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TeamsFilterParams>(EMPTY_FILTERS)
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')

  const queryFilters = useMemo<TeamsFilterParams>(
    () => ({
      ...filters,
      q: searchQuery.trim() || undefined,
    }),
    [filters, searchQuery],
  )

  const filtersActive = useMemo(() => hasActiveFilters(filters), [filters])
  const isFiltered = filtersActive || Boolean(searchQuery.trim())

  const {
    data: teams = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['teams', queryFilters],
    queryFn: () => fetchTeams(queryFilters),
    placeholderData: (previous) => previous,
  })

  const handleResetFilters = () => setFilters(EMPTY_FILTERS)

  const handleResetAll = () => {
    setSearchQuery('')
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('teams', 'teams-page', 'page')}
    >
      <div className="hockey-row hockey-row--between">
        <div className="hockey-stack hockey-stack--gap-8">
          <Text
            variant="header-1"
            className="variable-font-header"
            data-testid={testId('teams', 'teams-page', 'text', 'title')}
          >
            Команды
          </Text>
          <Text color="secondary" data-testid={testId('teams', 'teams-page', 'text', 'subtitle')}>
            Лента публичных команд: поиск, фильтры, профиль и чат в мессенджере.
          </Text>
        </div>
        {canCreateTeam && (
          <Link
            to={routes.teamsCreate}
            data-testid={testId('teams', 'teams-page', 'link', 'create')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('teams', 'teams-page', 'btn', 'create')}
            >
              Создать команду
            </HockeyButton>
          </Link>
        )}
      </div>

      <IceCard padding="m" data-testid={testId('teams', 'teams-page', 'card', 'search')}>
        <TextInput
          size="xl"
          placeholder="Поиск по названию или описанию команды"
          value={searchQuery}
          onUpdate={setSearchQuery}
          data-testid={testId('teams', 'teams-page', 'field', 'search')}
        />
      </IceCard>

      <div
        className="hockey-stack hockey-stack--gap-10"
        data-testid={testId('teams', 'teams-page', 'panel', 'filters')}
      >
        <div className="hockey-row hockey-row--between hockey-row--align-center">
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'teams-page', 'text', 'filters-title')}
          >
            Фильтры
          </Text>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={() => setIsFiltersVisible((prev) => !prev)}
            data-testid={testId('teams', 'teams-page', 'btn', 'filters-toggle')}
          >
            {isFiltersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
          </HockeyButton>
        </div>
        {isFiltersVisible && (
          <IceCard padding="m" data-testid={testId('teams', 'teams-page', 'card', 'filters')}>
            <TeamFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              isFiltered={filtersActive}
            />
          </IceCard>
        )}
      </div>

      <div className="hockey-row hockey-row--between hockey-row--align-center">
        <Text
          color="secondary"
          data-testid={testId('teams', 'teams-page', 'text', 'results-count')}
        >
          {isLoading ? 'Загрузка…' : isError ? 'Ошибка загрузки' : `Найдено: ${teams.length}`}
        </Text>
      </div>

      {isLoading && (
        <ScoreboardLoader
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'loader')}
        />
      )}

      {isError && !isLoading && (
        <QueryErrorState
          title="Не удалось загрузить команды"
          onRetry={() => void refetch()}
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'error')}
        />
      )}

      {!isLoading && !isError && teams.length === 0 && (
        <EmptyNetState
          title="Команды не найдены"
          copy="Измените поиск или сбросьте фильтры."
          testIdPrefix="teams"
          data-testid={testId('teams', 'teams-page', 'empty')}
          action={
            isFiltered ? (
              <HockeyButton
                view="outlined"
                size="s"
                onClick={handleResetAll}
                data-testid={testId('teams', 'teams-page', 'btn', 'reset-empty')}
              >
                Сбросить
              </HockeyButton>
            ) : undefined
          }
        />
      )}

      {!isError && (
        <div
          className="team-feed hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'teams-page', 'panel', 'feed')}
        >
          {teams.map((team, index) => (
            <ScrollReveal
              key={team.id}
              direction={index % 2 === 0 ? 'left' : 'right'}
              data-testid={testId('teams', 'teams-page', 'item', team.id)}
            >
              <TeamCard team={team} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
