/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 * HOCFRONT-34A — каталог: поиск/фильтры, карточка → /leagues/:leagueId
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect} from 'react'
import {useNavigate, useSearchParams} from 'react-router'

import {fetchSession} from '@/entities/auth'
import type {
  League,
  LeagueFilters as LeagueFiltersType,
  LeagueRegionFilter,
} from '@/entities/league'
import {fetchLeagues} from '@/entities/league'
import {LeagueCard, LeagueFilters, MyLeagueWidget} from '@/features/leagues'
import {PartnerAccessHint, PartnerCabinetBanner} from '@/features/partners'
import {LEAGUES_PAGE_TITLE} from '@/shared/config/navigationLabels'
import {leagueDetailsPath} from '@/shared/const/appRoutes'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const EMPTY_FILTERS: LeagueFiltersType = {}

function hasActiveFilters(filters: LeagueFiltersType): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '')
}

function filtersFromSearchParams(params: URLSearchParams): LeagueFiltersType {
  const region = params.get('region')
  return {
    query: params.get('q') || undefined,
    region: region === 'moscow' || region === 'russia' ? (region as LeagueRegionFilter) : undefined,
    level: (params.get('level') as LeagueFiltersType['level']) || undefined,
    recruitingStatus:
      (params.get('recruitingStatus') as LeagueFiltersType['recruitingStatus']) || undefined,
  }
}

function writeFiltersToSearchParams(filters: LeagueFiltersType): URLSearchParams {
  const next = new URLSearchParams()
  if (filters.query) next.set('q', filters.query)
  if (filters.region) next.set('region', filters.region)
  if (filters.level) next.set('level', filters.level)
  if (filters.recruitingStatus) next.set('recruitingStatus', filters.recruitingStatus)
  return next
}

/**
 * @spec SPEC-UI-2.7 - Табло турнирной таблицы
 * @spec SPEC-FR-7.1.1 - Страница списка лиг
 */
export function LeaguesPage() {
  useDocumentTitle(LEAGUES_PAGE_TITLE)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacyLeagueId = searchParams.get('leagueId')

  const filters = filtersFromSearchParams(searchParams)

  // Старые ссылки ?leagueId= → полноценная страница лиги
  useEffect(() => {
    if (!legacyLeagueId) return
    navigate(leagueDetailsPath(legacyLeagueId), {replace: true})
  }, [legacyLeagueId, navigate])

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const leagueMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'league')

  const {
    data: leagues = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['leagues', filters],
    queryFn: () => fetchLeagues(filters),
    placeholderData: (previous) => previous,
    enabled: !legacyLeagueId,
  })

  const applyFilters = (nextFilters: LeagueFiltersType) => {
    setSearchParams(writeFiltersToSearchParams(nextFilters), {replace: true})
  }

  const handleResetFilters = () => applyFilters(EMPTY_FILTERS)

  const openLeague = (id: string) => navigate(leagueDetailsPath(id))

  const isFiltered = hasActiveFilters(filters)
  const showLayout = !isPending && !isError && !legacyLeagueId
  const showEmpty = showLayout && leagues.length === 0

  return (
    <div className="hockey-stack hockey-stack--gap-20" data-testid={testId('leagues', 'page')}>
      <Text variant="header-1" data-testid={testId('leagues', 'page', 'text', 'title')}>
        {LEAGUES_PAGE_TITLE}
      </Text>

      <div data-testid={testId('leagues', 'page', 'panel', 'partner-access')}>
        {leagueMembership ? (
          <PartnerCabinetBanner membership={leagueMembership} />
        ) : (
          <PartnerAccessHint kind="league" />
        )}
      </div>

      <Text color="secondary" data-testid={testId('leagues', 'page', 'text', 'subtitle')}>
        Любительские лиги Москвы и России. Данные могут быть mock, manual, imported или external —
        смотрите бейдж источника.
      </Text>

      <MyLeagueWidget />

      <LeagueFilters filters={filters} onChange={applyFilters} onReset={handleResetFilters} />

      {isPending && (
        <div data-testid={testId('leagues', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка лиг" />
          <div className="arenas-page__skeleton">
            <IceSkeleton count={3} height={220} />
          </div>
        </div>
      )}

      {isError && !isPending && (
        <QueryErrorState
          title="Не удалось загрузить лиги"
          onRetry={() => refetch()}
          testIdPrefix="leagues"
          data-testid={testId('leagues', 'page', 'error')}
        />
      )}

      {showEmpty && (
        <div data-testid={testId('leagues', 'page', 'empty')}>
          <EmptyNetState
            title="Лиг по фильтру не найдено"
            copy="Попробуйте другой регион, уровень или сбросьте фильтры."
            action={
              isFiltered ? (
                <HockeyButton
                  view="outlined"
                  size="s"
                  onClick={handleResetFilters}
                  data-testid={testId('leagues', 'page', 'btn', 'reset')}
                >
                  Сбросить фильтры
                </HockeyButton>
              ) : undefined
            }
          />
        </div>
      )}

      {showLayout && leagues.length > 0 && (
        <div
          className="hockey-grid hockey-grid--cards-300"
          data-testid={testId('leagues', 'page', 'list')}
        >
          {leagues.map((league: League) => (
            <LeagueCard key={league.id} league={league} onOpenDetails={openLeague} />
          ))}
        </div>
      )}
    </div>
  )
}
