/**
 * HOCFRONT-25 / TASK-04-03 — публичный профиль команды
 */

import {Accordion, Label, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link, useParams} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {
  fetchTeam,
  fetchTeamCalendarEvents,
  fetchTeamClubProfile,
  fetchTeamRoster,
} from '@/entities/team'
import {canManageClubEntity} from '@/features/access'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {FavoriteButton} from '@/features/favorites'
import {ContactStaffModal, STAFF_ROLE_LABELS, TeamCalendarSection} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** HOCFRONT-25 — публичная страница команды */
export function TeamProfilePage() {
  const {teamId = ''} = useParams()
  const [contactOpen, setContactOpen] = useState(false)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const {data: team, isLoading: teamLoading} = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: Boolean(teamId),
  })
  const {data: roster = []} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
    enabled: Boolean(teamId),
  })
  const {data: club} = useQuery({
    queryKey: ['club-profile', teamId],
    queryFn: () => fetchTeamClubProfile(teamId),
    enabled: Boolean(teamId),
  })
  const {data: calendar = []} = useQuery({
    queryKey: ['team-calendar', teamId],
    queryFn: () => fetchTeamCalendarEvents(teamId),
    enabled: Boolean(teamId),
  })

  if (teamLoading) {
    return (
      <div data-testid={testId('teams', 'profile', 'loader')}>
        <ScoreboardLoader label="Загрузка профиля команды" />
      </div>
    )
  }

  if (!team) {
    return (
      <IceCard padding="m" data-testid={testId('teams', 'profile', 'card', 'not-found')}>
        <Text data-testid={testId('teams', 'profile', 'text', 'not-found')}>
          Команда не найдена
        </Text>
        <Link to={routes.teams} data-testid={testId('teams', 'profile', 'link', 'back-missing')}>
          <HockeyButton
            view="outlined"
            size="s"
            className="hockey-mt-12"
            data-testid={testId('teams', 'profile', 'btn', 'back-missing')}
          >
            К списку команд
          </HockeyButton>
        </Link>
      </IceCard>
    )
  }

  const clubId = club?.id ?? team.clubId
  const canManageClub = canManageClubEntity(session, clubId)

  const activeRoster = roster.filter((member) => member.rosterStatus !== 'removed')
  const initial = team.name.trim().charAt(0).toUpperCase() || '?'
  const description = team.description || team.shortDescription

  return (
    <div
      className="team-profile hockey-stack hockey-stack--gap-20"
      data-testid={testId('teams', 'profile', 'page', team.id)}
    >
      <Link to={routes.teams} data-testid={testId('teams', 'profile', 'link', 'back', team.id)}>
        <HockeyButton
          view="flat"
          size="s"
          data-testid={testId('teams', 'profile', 'btn', 'back', team.id)}
        >
          ← К ленте команд
        </HockeyButton>
      </Link>

      <section
        className="team-profile__hero"
        data-testid={testId('teams', 'profile', 'panel', 'hero', team.id)}
      >
        <div className="team-profile__hero-top">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt=""
              className="team-profile__logo"
              data-testid={testId('teams', 'profile', 'img', 'logo', team.id)}
            />
          ) : (
            <div
              className="team-profile__crest"
              aria-hidden
              data-testid={testId('teams', 'profile', 'icon', 'crest', team.id)}
            >
              {initial}
            </div>
          )}

          <div className="team-profile__hero-copy">
            <div className="hockey-row hockey-row--between">
              <Text
                variant="header-1"
                className="variable-font-header"
                data-testid={testId('teams', 'profile', 'text', 'title', team.id)}
              >
                {team.name}
              </Text>
              <FavoriteButton type="team" entityId={team.id} title={team.name} size="m" />
            </div>
            <Text
              color="secondary"
              data-testid={testId('teams', 'profile', 'text', 'city', team.id)}
            >
              {team.city}
              {club ? ` · ${club.name}` : ''}
            </Text>
            <div
              className="team-profile__meta"
              data-testid={testId('teams', 'profile', 'panel', 'meta', team.id)}
            >
              <Label size="s" data-testid={testId('teams', 'profile', 'badge', 'skill', team.id)}>
                {SKILL_LEVEL_LABELS[team.skillLevel] ?? team.skillLevel}
              </Label>
              <Label size="s" data-testid={testId('teams', 'profile', 'badge', 'roster', team.id)}>
                В составе: {activeRoster.length}
              </Label>
              {team.leagueId && (
                <Label
                  size="s"
                  data-testid={testId('teams', 'profile', 'badge', 'league', team.id)}
                >
                  В лиге
                </Label>
              )}
            </div>
            {description && (
              <Text
                className="team-profile__lead"
                data-testid={testId('teams', 'profile', 'text', 'description', team.id)}
              >
                {description}
              </Text>
            )}
          </div>
        </div>

        <div
          className="team-profile__actions"
          data-testid={testId('teams', 'profile', 'panel', 'actions', team.id)}
        >
          <HockeyButton
            size="l"
            onClick={() => setContactOpen(true)}
            data-testid={testId('teams', 'profile', 'btn', 'contact-staff', team.id)}
          >
            Связаться со штабом
          </HockeyButton>
          {canManageClub && clubId && (
            <Link
              to={`/partner/clubs/${clubId}`}
              data-testid={testId('teams', 'profile', 'link', 'club-cabinet', team.id)}
            >
              <HockeyButton
                view="outlined"
                size="l"
                data-testid={testId('teams', 'profile', 'btn', 'club-cabinet', team.id)}
              >
                Кабинет клуба
              </HockeyButton>
            </Link>
          )}
        </div>
        <Text
          color="secondary"
          data-testid={testId('teams', 'profile', 'text', 'contact-hint', team.id)}
        >
          Откроет форму заявки в штаб — без перехода в мессенджер.
        </Text>
      </section>

      <ContactStaffModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        teamId={team.id}
        teamName={team.name}
        clubName={club?.name}
      />

      <div
        className="team-profile__sections"
        data-testid={testId('teams', 'profile', 'panel', 'sections', team.id)}
      >
        <IceCard padding="m" data-testid={testId('teams', 'profile', 'card', 'sections', team.id)}>
          <Accordion
            multiple
            defaultValue={['roster', 'staff']}
            ariaLabel="Секции профиля команды"
            size="l"
          >
            <Accordion.Item
              value="roster"
              summary={`Состав · ${activeRoster.length}`}
              qa={testId('teams', 'profile', 'accordion', 'roster', team.id)}
            >
              <ul
                className="team-profile__list"
                data-testid={testId('teams', 'profile', 'list', 'roster', team.id)}
              >
                {activeRoster.length === 0 && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'empty', 'roster', team.id)}
                  >
                    Состав пока пуст
                  </Text>
                )}
                {activeRoster.map((member) => (
                  <li
                    key={member.userId}
                    className="team-profile__person"
                    data-testid={testId('teams', 'profile', 'row', 'roster', member.userId)}
                  >
                    <div className="team-profile__person-avatar" aria-hidden>
                      {member.displayName.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="team-profile__person-body">
                      <Link
                        to={`/players/${member.userId}`}
                        data-testid={testId('teams', 'profile', 'link', 'player', member.userId)}
                      >
                        <Text
                          variant="subheader-2"
                          data-testid={testId(
                            'teams',
                            'profile',
                            'text',
                            'player-name',
                            member.userId,
                          )}
                        >
                          {member.displayName}
                        </Text>
                      </Link>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'teams',
                          'profile',
                          'text',
                          'player-meta',
                          member.userId,
                        )}
                      >
                        {POSITION_LABELS[member.position] ?? member.position}
                        {member.teamRole ? ` · ${member.teamRole}` : ''}
                      </Text>
                    </div>
                  </li>
                ))}
              </ul>
            </Accordion.Item>

            <Accordion.Item
              value="staff"
              summary={`Штаб · ${club?.staff?.length ?? 0}`}
              qa={testId('teams', 'profile', 'accordion', 'staff', team.id)}
            >
              <ul
                className="team-profile__list"
                data-testid={testId('teams', 'profile', 'list', 'staff', team.id)}
              >
                {!club?.staff?.length && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'empty', 'staff', team.id)}
                  >
                    Штаб не указан — можно оставить заявку через форму выше.
                  </Text>
                )}
                {club?.staff.map((member) => (
                  <li
                    key={member.userId}
                    className="team-profile__person"
                    data-testid={testId('teams', 'profile', 'row', 'staff', member.userId)}
                  >
                    <div
                      className="team-profile__person-avatar team-profile__person-avatar--staff"
                      aria-hidden
                    >
                      {member.displayName.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="team-profile__person-body">
                      <Text
                        variant="subheader-2"
                        data-testid={testId(
                          'teams',
                          'profile',
                          'text',
                          'staff-name',
                          member.userId,
                        )}
                      >
                        {member.displayName}
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'teams',
                          'profile',
                          'text',
                          'staff-role',
                          member.userId,
                        )}
                      >
                        {STAFF_ROLE_LABELS[member.role]}
                      </Text>
                    </div>
                  </li>
                ))}
              </ul>
            </Accordion.Item>

            <Accordion.Item
              value="calendar"
              summary={`Календарь · ${calendar.length}`}
              qa={testId('teams', 'profile', 'accordion', 'calendar', team.id)}
            >
              <TeamCalendarSection
                events={calendar}
                emptyText="В календаре команды пока нет событий"
                scope="team"
                scopeId={team.id}
              />
            </Accordion.Item>

            <Accordion.Item
              value="info"
              summary="Информация о команде"
              qa={testId('teams', 'profile', 'accordion', 'info', team.id)}
            >
              <div
                className="hockey-stack hockey-stack--gap-8"
                data-testid={testId('teams', 'profile', 'panel', 'info', team.id)}
              >
                <Text data-testid={testId('teams', 'profile', 'text', 'info-city', team.id)}>
                  Город: {team.city}
                </Text>
                <Text data-testid={testId('teams', 'profile', 'text', 'info-level', team.id)}>
                  Уровень: {SKILL_LEVEL_LABELS[team.skillLevel] ?? team.skillLevel}
                </Text>
                {team.shortDescription && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'text', 'info-short', team.id)}
                  >
                    {team.shortDescription}
                  </Text>
                )}
                {team.description && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'text', 'info-description', team.id)}
                  >
                    {team.description}
                  </Text>
                )}
                {club && (
                  <Text
                    color="secondary"
                    data-testid={testId('teams', 'profile', 'text', 'info-club', team.id)}
                  >
                    Клуб: {club.name}
                  </Text>
                )}
              </div>
            </Accordion.Item>
          </Accordion>
        </IceCard>
      </div>
    </div>
  )
}
