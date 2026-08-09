/**
 * HOCFRONT-22 — секция «Команда» на публичной странице игрока.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchTeams} from '@/entities/team'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export interface PlayerTeamsSectionProps {
  /** userId игрока, чьи команды показываем */
  playerId: string
  /** Фоллбэк, если у игрока есть только имя основной команды без id в каталоге */
  fallbackTeamName?: string
}

/**
 * @spec HOCFRONT-22 — публичная информация: команда
 * Загружает команды через `GET /teams?playerId=` без хардкода списка.
 */
export function PlayerTeamsSection({playerId, fallbackTeamName}: PlayerTeamsSectionProps) {
  const {
    data: teams = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['teams', 'by-player', playerId],
    queryFn: () => fetchTeams({playerId}),
    enabled: Boolean(playerId),
  })

  return (
    <IceCard padding="m" data-testid={testId('players', 'player-teams', 'card', playerId)}>
      <div className="hockey-stack hockey-stack--gap-12">
        <Text
          variant="subheader-2"
          data-testid={testId('players', 'player-teams', 'text', 'title', playerId)}
        >
          Команда
        </Text>

        {isLoading && (
          <div data-testid={testId('players', 'player-teams', 'loader', playerId)}>
            <ScoreboardLoader label="Загрузка команд…" />
          </div>
        )}

        {isError && (
          <Text color="danger" data-testid={testId('players', 'player-teams', 'error', playerId)}>
            Не удалось загрузить команды игрока.
          </Text>
        )}

        {!isLoading && !isError && teams.length === 0 && (
          <Text
            color="secondary"
            data-testid={testId('players', 'player-teams', 'empty', playerId)}
          >
            {fallbackTeamName
              ? `${fallbackTeamName} — профиль команды пока недоступен.`
              : 'Игрок пока не состоит в команде.'}
          </Text>
        )}

        {!isLoading && !isError && teams.length > 0 && (
          <ul
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('players', 'player-teams', 'list', playerId)}
          >
            {teams.map((team) => (
              <li key={team.id} data-testid={testId('players', 'player-teams', 'row', team.id)}>
                <Link
                  to={`${routes.teams}/${team.id}`}
                  data-testid={testId('players', 'player-teams', 'link', team.id)}
                >
                  <Text
                    variant="body-2"
                    data-testid={testId('players', 'player-teams', 'text', 'name', team.id)}
                  >
                    {team.name}
                  </Text>
                </Link>
                <Text
                  color="secondary"
                  data-testid={testId('players', 'player-teams', 'text', 'meta', team.id)}
                >
                  {team.city}
                  {SKILL_LEVEL_LABELS[team.skillLevel]
                    ? ` · ${SKILL_LEVEL_LABELS[team.skillLevel]}`
                    : ''}
                </Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </IceCard>
  )
}
