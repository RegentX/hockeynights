/**
 * HOCFRONT-25 / TASK-04-07..11 — кабинет партнёра клуба
 */

import {Text} from '@gravity-ui/uikit'
import {useQueries, useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useParams} from 'react-router'

import {fetchClub, fetchClubCalendar, fetchClubPrivateTrainings} from '@/entities/club'
import {fetchTeamRoster, fetchTeams} from '@/entities/team'
import {canManageClubEntity, useSessionAccess} from '@/features/access'
import {
  ClubDashboardSummary,
  type ClubPartnerTab,
  ClubPrivateTrainingsPanel,
  ClubProfileEditForm,
} from '@/features/clubs'
import {AddTeamMember, TeamCalendarSection, TeamLineupStudio, TeamRoster} from '@/features/teams'
import {isNotFoundError} from '@/shared/api/client'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const TAB_LABELS: Record<ClubPartnerTab, string> = {
  dashboard: 'Дашборд',
  profile: 'Профиль',
  roster: 'Состав',
  calendar: 'Календарь',
  private: 'Приватные',
}

/** HOCFRONT-25 — кабинет клуба */
export function ClubPartnerDashboard() {
  const {clubId = ''} = useParams()
  const [tab, setTab] = useState<ClubPartnerTab>('dashboard')
  const {session, teamPermissions, userId} = useSessionAccess()

  const {
    data: club,
    isLoading,
    error: clubError,
    refetch: refetchClub,
  } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => fetchClub(clubId),
    enabled: Boolean(clubId),
  })
  const {data: calendar = []} = useQuery({
    queryKey: ['club-calendar', clubId],
    queryFn: () => fetchClubCalendar(clubId),
    enabled: Boolean(clubId) && (tab === 'dashboard' || tab === 'calendar'),
  })
  const {data: privateTrainings = []} = useQuery({
    queryKey: ['club-private-trainings', clubId],
    queryFn: () => fetchClubPrivateTrainings(clubId),
    enabled: Boolean(clubId) && (tab === 'dashboard' || tab === 'private'),
  })

  const [nowMs] = useState(() => Date.now())
  const upcomingEvents = useMemo(() => {
    return [...calendar]
      .filter((event) => new Date(event.startsAt).getTime() >= nowMs - 60 * 60 * 1000)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 4)
  }, [calendar, nowMs])

  const teamIds = useMemo(
    () => (club?.teamIds ?? []).filter((teamId): teamId is string => Boolean(teamId)),
    [club?.teamIds],
  )

  const rosterQueries = useQueries({
    queries: teamIds.map((teamId) => ({
      queryKey: ['roster', teamId],
      queryFn: () => fetchTeamRoster(teamId),
      enabled: Boolean(club) && tab === 'dashboard',
    })),
  })

  const rosterCount = rosterQueries.reduce((sum, query) => {
    const members = query.data ?? []
    return sum + members.filter((member) => member.rosterStatus !== 'removed').length
  }, 0)

  const {data: allTeams = []} = useQuery({
    queryKey: ['teams'],
    queryFn: () => fetchTeams(),
    enabled: Boolean(clubId) && tab === 'roster',
  })
  const teamNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const team of allTeams) {
      map.set(team.id, team.name)
    }
    return map
  }, [allTeams])

  const canManage = canManageClubEntity(session, clubId)

  if (isLoading) {
    return (
      <div data-testid={testId('clubs', 'partner', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета клуба" />
      </div>
    )
  }

  if (clubError && !isNotFoundError(clubError)) {
    return (
      <QueryErrorState
        title="Не удалось загрузить кабинет клуба"
        onRetry={() => void refetchClub()}
        testIdPrefix="clubs"
        data-testid={testId('clubs', 'partner', 'error')}
      />
    )
  }

  if (!club) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('clubs', 'partner', 'panel', 'not-found')}
      >
        <EmptyNetState title="Клуб не найден" copy="Вернитесь к списку кабинетов." />
        <Link to="/partner" data-testid={testId('clubs', 'partner', 'link', 'hub')}>
          <HockeyButton
            view="outlined"
            size="s"
            data-testid={testId('clubs', 'partner', 'btn', 'hub')}
          >
            К кабинетам
          </HockeyButton>
        </Link>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div data-testid={testId('clubs', 'partner', 'panel', 'denied')}>
        <IceCard padding="m">
          <Text data-testid={testId('clubs', 'partner', 'text', 'denied')}>
            Кабинет доступен только представителю клуба. Выберите роль при входе.
          </Text>
          <Link
            to="/"
            className="hockey-mt-12"
            data-testid={testId('clubs', 'partner', 'link', 'login')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('clubs', 'partner', 'btn', 'login')}
            >
              Перейти к входу
            </HockeyButton>
          </Link>
        </IceCard>
      </div>
    )
  }

  return (
    <div
      className="partner-dashboard club-cabinet hockey-stack hockey-stack--gap-16"
      data-testid={testId('clubs', 'partner', 'page', clubId)}
    >
      <PageHeader
        title="Кабинет клуба"
        subtitle={`${club.name} · управление составом, штабом и приватными тренировками`}
        testIdPrefix="clubs"
        testIdSection="partner"
        actions={
          <Link to="/partner" data-testid={testId('clubs', 'partner', 'link', 'back', clubId)}>
            <HockeyButton
              view="flat"
              size="s"
              data-testid={testId('clubs', 'partner', 'btn', 'back', clubId)}
            >
              ← Все кабинеты
            </HockeyButton>
          </Link>
        }
      />

      <div className="club-cabinet__tabs" data-testid={testId('clubs', 'partner', 'nav', clubId)}>
        {(Object.keys(TAB_LABELS) as ClubPartnerTab[]).map((tabKey) => (
          <HockeyButton
            key={tabKey}
            view={tab === tabKey ? 'action' : 'outlined'}
            size="m"
            onClick={() => setTab(tabKey)}
            data-testid={testId('clubs', 'partner', 'tab', tabKey, clubId)}
          >
            {TAB_LABELS[tabKey]}
          </HockeyButton>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div data-testid={testId('clubs', 'partner', 'panel', 'dashboard', clubId)}>
          <ClubDashboardSummary
            club={club}
            rosterCount={rosterCount}
            staffCount={club.staff.length}
            calendarCount={calendar.length}
            privateTrainingCount={privateTrainings.length}
            upcomingEvents={upcomingEvents}
            onNavigateTab={setTab}
          />
        </div>
      )}

      {tab === 'profile' && (
        <div data-testid={testId('clubs', 'partner', 'panel', 'profile', clubId)}>
          <IceCard padding="m">
            <ClubProfileEditForm key={club.id} club={club} />
          </IceCard>
        </div>
      )}

      {tab === 'roster' && (
        <div
          className="club-cabinet__roster hockey-stack hockey-stack--gap-20"
          data-testid={testId('clubs', 'partner', 'panel', 'roster', clubId)}
        >
          {teamIds.length === 0 && (
            <Text
              color="secondary"
              data-testid={testId('clubs', 'partner', 'empty', 'roster', clubId)}
            >
              У клуба нет привязанных команд
            </Text>
          )}
          {teamIds.map((teamId) => {
            const canEditLineup = teamPermissions('captain').canEditLineup
            const canManageRoster = teamPermissions('captain').canManageRoster
            return (
              <div
                key={teamId}
                className="hockey-stack hockey-stack--gap-16"
                data-testid={testId('clubs', 'partner', 'card', 'roster', teamId)}
              >
                <div className="club-cabinet__roster-head">
                  <Text
                    variant="header-2"
                    className="variable-font-header"
                    data-testid={testId('clubs', 'partner', 'text', 'roster-team', teamId)}
                  >
                    Расстановка · {teamNameById.get(teamId) ?? teamId}
                  </Text>
                  <Text
                    color="secondary"
                    data-testid={testId('clubs', 'partner', 'text', 'roster-hint', teamId)}
                  >
                    Собирайте постановки на льду и сохраняйте шаблоны — их можно подставить при
                    создании тренировки
                  </Text>
                </div>

                <TeamLineupStudio teamId={teamId} canEdit={canEditLineup} />

                {canManageRoster && (
                  <IceCard
                    padding="m"
                    data-testid={testId('clubs', 'partner', 'card', 'roster-manage', teamId)}
                  >
                    <Text
                      variant="subheader-2"
                      className="hockey-mb-12"
                      data-testid={testId('clubs', 'partner', 'text', 'roster-manage', teamId)}
                    >
                      Статусы и роли состава
                    </Text>
                    <AddTeamMember teamId={teamId} />
                    <TeamRoster teamId={teamId} userId={userId} teamPermissions={teamPermissions} />
                  </IceCard>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'calendar' && (
        <div data-testid={testId('clubs', 'partner', 'panel', 'calendar', clubId)}>
          <IceCard padding="m">
            <TeamCalendarSection
              events={calendar}
              emptyText="В календаре клуба пока нет событий"
              testIdPrefix="clubs"
              scope="club"
              scopeId={clubId}
            />
          </IceCard>
        </div>
      )}

      {tab === 'private' && (
        <div data-testid={testId('clubs', 'partner', 'panel', 'private', clubId)}>
          <IceCard padding="m">
            <ClubPrivateTrainingsPanel clubId={clubId} />
          </IceCard>
        </div>
      )}
    </div>
  )
}
