/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useRef} from 'react'
import {useSearchParams} from 'react-router'

import {fetchLeagues, fetchLeagueSchedule, fetchLeagueStandings} from '@/entities/league'
import {useSessionAccess} from '@/features/access'
import {LeagueCard, LeagueProfilePanel, LeagueSchedule, LeagueStandings} from '@/features/leagues'
import {PartnerAccessHint, PartnerCabinetBanner} from '@/features/partners'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryState} from '@/shared/ui/QueryState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/**
 * @spec SPEC-UI-2.7 - Табло турнирной таблицы с автовыбором лиги
 * @spec SPEC-FR-7.1.1 - Страница списка лиг
 */
export function LeaguesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const leagueIdFromUrl = searchParams.get('leagueId')
  const scrollOnNextLeagueRef = useRef(false)
  const detailRef = useRef<HTMLDivElement | null>(null)

  const {session} = useSessionAccess()
  const leagueMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'league')

  const {
    data: leagues = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
  })

  const activeLeagueId = useMemo(() => {
    if (leagueIdFromUrl && leagues.some((league) => league.id === leagueIdFromUrl)) {
      return leagueIdFromUrl
    }
    return leagues[0]?.id ?? null
  }, [leagueIdFromUrl, leagues])

  const selectedLeague = leagues.find((l) => l.id === activeLeagueId)

  useEffect(() => {
    if (!leagueIdFromUrl) return
    scrollOnNextLeagueRef.current = true
  }, [leagueIdFromUrl])

  useEffect(() => {
    if (!activeLeagueId || !scrollOnNextLeagueRef.current) return
    scrollOnNextLeagueRef.current = false
    const node = detailRef.current
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    }
  }, [activeLeagueId])

  const handleSelectLeague = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('leagueId', id)
    setSearchParams(next, {replace: true})
  }

  const {data: standings = [], isLoading: standingsLoading} = useQuery({
    queryKey: ['league-standings', activeLeagueId],
    queryFn: () => fetchLeagueStandings(activeLeagueId!),
    enabled: Boolean(activeLeagueId),
  })

  const {data: schedule = [], isLoading: scheduleLoading} = useQuery({
    queryKey: ['league-schedule', activeLeagueId],
    queryFn: () => fetchLeagueSchedule(activeLeagueId!),
    enabled: Boolean(activeLeagueId),
  })

  return (
    <div className="hockey-stack hockey-stack--gap-20" data-testid={testId('leagues', 'page')}>
      <PageHeader
        title="Любительские лиги"
        subtitle="Данные могут быть mock, manual, imported или external — смотрите бейдж источника."
        testIdPrefix="leagues"
      />

      <div data-testid={testId('leagues', 'page', 'panel', 'partner-access')}>
        {leagueMembership ? (
          <PartnerCabinetBanner membership={leagueMembership} />
        ) : (
          <PartnerAccessHint kind="league" />
        )}
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && leagues.length === 0}
        loadingLabel="Загрузка лиг"
        errorTitle="Не удалось загрузить лиги"
        emptyTitle="Лиги не найдены"
        emptyCopy="Каталог любительских лиг пока пуст."
        onRetry={() => void refetch()}
        testIdPrefix="leagues"
      >
        <div
          className="hockey-grid hockey-grid--cards-300"
          data-testid={testId('leagues', 'page', 'list')}
        >
          {leagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              selected={activeLeagueId === league.id}
              onSelect={handleSelectLeague}
            />
          ))}
        </div>
      </QueryState>

      {activeLeagueId && selectedLeague && (
        <div
          ref={detailRef}
          className="hockey-stack hockey-stack--gap-16"
          data-testid={testId('leagues', 'page', 'panel', 'detail', activeLeagueId)}
        >
          <LeagueProfilePanel league={selectedLeague} />

          <div data-testid={testId('leagues', 'page', 'card', 'stats', activeLeagueId)}>
            <IceCard padding="m">
              <div className="hockey-row hockey-row--gap-12 hockey-row--between hockey-mb-16">
                <div>
                  <Text
                    variant="subheader-2"
                    data-testid={testId('leagues', 'page', 'text', 'stats-title', activeLeagueId)}
                  >
                    Статистика и расписание
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'leagues',
                      'page',
                      'text',
                      'stats-subtitle',
                      activeLeagueId,
                    )}
                  >
                    {selectedLeague.name} · {selectedLeague.region}
                  </Text>
                </div>
                <div data-testid={testId('leagues', 'page', 'badge', 'source', activeLeagueId)}>
                  <SourceMetaBadge sourceMeta={selectedLeague.sourceMeta} />
                </div>
              </div>

              <div className="hockey-stack hockey-stack--gap-20">
                {standingsLoading ? (
                  <div
                    data-testid={testId('leagues', 'page', 'loader', 'standings', activeLeagueId)}
                  >
                    <ScoreboardLoader label="Загрузка таблицы" />
                  </div>
                ) : (
                  <LeagueStandings standings={standings} leagueName={selectedLeague.name} />
                )}

                {scheduleLoading ? (
                  <div
                    data-testid={testId('leagues', 'page', 'loader', 'schedule', activeLeagueId)}
                  >
                    <ScoreboardLoader label="Загрузка расписания" />
                  </div>
                ) : (
                  <LeagueSchedule schedule={schedule} />
                )}
              </div>
            </IceCard>
          </div>
        </div>
      )}
    </div>
  )
}
