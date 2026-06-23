/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-UI-2.7, SPEC-UI-2.8
 */

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {PartnerAccessHint} from '@/features/partners/PartnerAccessHint'
import {PartnerCabinetBanner} from '@/features/partners/PartnerCabinetBanner'
import {fetchLeagues, fetchLeagueSchedule, fetchLeagueStandings} from '@/features/leagues/api/leaguesApi'
import {LeagueCard} from '@/features/leagues/LeagueCard'
import {LeagueProfilePanel} from '@/features/leagues/LeagueProfilePanel'
import {LeagueSchedule} from '@/features/leagues/LeagueSchedule'
import {LeagueStandings} from '@/features/leagues/LeagueStandings'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-UI-2.7 - Табло турнирной таблицы с автовыбором лиги
 * @spec SPEC-FR-7.1.1 - Страница списка лиг
 */
export function LeaguesPage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const leagueMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'league')

  const {data: leagues = [], isLoading} = useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
  })

  const activeLeagueId = selectedLeagueId ?? leagues[0]?.id ?? null
  const selectedLeague = leagues.find((l) => l.id === activeLeagueId)

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
      <Text variant="header-1" data-testid={testId('leagues', 'page', 'text', 'title')}>
        Любительские лиги
      </Text>

      <div data-testid={testId('leagues', 'page', 'panel', 'partner-access')}>
        {leagueMembership ? (
          <PartnerCabinetBanner membership={leagueMembership} />
        ) : (
          <PartnerAccessHint kind="league" />
        )}
      </div>

      <Text color="secondary" data-testid={testId('leagues', 'page', 'text', 'subtitle')}>
        Данные могут быть mock, manual, imported или external — смотрите бейдж источника.
      </Text>

      {isLoading && (
        <div data-testid={testId('leagues', 'page', 'loader')}>
          <ScoreboardLoader label="Загрузка лиг" />
        </div>
      )}

      <div className="hockey-grid hockey-grid--cards-300" data-testid={testId('leagues', 'page', 'list')}>
        {leagues.map((league) => (
          <LeagueCard
            key={league.id}
            league={league}
            selected={activeLeagueId === league.id}
            onSelect={setSelectedLeagueId}
          />
        ))}
      </div>

      {activeLeagueId && selectedLeague && (
        <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('leagues', 'page', 'panel', 'detail', activeLeagueId)}>
          <LeagueProfilePanel league={selectedLeague} />

          <div data-testid={testId('leagues', 'page', 'card', 'stats', activeLeagueId)}>
            <IceCard padding="m">
              <div className="hockey-row hockey-row--gap-12 hockey-row--between hockey-mb-16">
                <div>
                  <Text variant="subheader-2" data-testid={testId('leagues', 'page', 'text', 'stats-title', activeLeagueId)}>
                    Статистика и расписание
                  </Text>
                  <Text color="secondary" data-testid={testId('leagues', 'page', 'text', 'stats-subtitle', activeLeagueId)}>
                    {selectedLeague.name} · {selectedLeague.region}
                  </Text>
                </div>
                <div data-testid={testId('leagues', 'page', 'badge', 'source', activeLeagueId)}>
                  <SourceMetaBadge sourceMeta={selectedLeague.sourceMeta} />
                </div>
              </div>

              <div className="hockey-stack hockey-stack--gap-20">
                {standingsLoading ? (
                  <div data-testid={testId('leagues', 'page', 'loader', 'standings', activeLeagueId)}>
                    <ScoreboardLoader label="Загрузка таблицы" />
                  </div>
                ) : (
                  <LeagueStandings
                    standings={standings}
                    leagueName={selectedLeague.name}
                  />
                )}

                {scheduleLoading ? (
                  <div data-testid={testId('leagues', 'page', 'loader', 'schedule', activeLeagueId)}>
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
