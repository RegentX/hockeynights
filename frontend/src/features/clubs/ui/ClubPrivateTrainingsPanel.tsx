/**
 * HOCFRONT-25 / TASK-04-11 — приватные тренировки: раскладка → тренер → мессенджер
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchClub, fetchClubPrivateTrainings} from '@/entities/club'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {LineupCoachApprovalPanel} from './LineupCoachApprovalPanel'
import {TeamTrainingCreateWizard} from './TeamTrainingCreateWizard'

export interface ClubPrivateTrainingsPanelProps {
  clubId: string
}

/** HOCFRONT-25 — список и мастер создания private_club тренировок */
export function ClubPrivateTrainingsPanel({clubId}: ClubPrivateTrainingsPanelProps) {
  const {
    data: club,
    isLoading: clubLoading,
    isError: clubError,
  } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => fetchClub(clubId),
  })
  const {data: trainings = [], isLoading} = useQuery({
    queryKey: ['club-private-trainings', clubId],
    queryFn: () => fetchClubPrivateTrainings(clubId),
  })

  if (clubLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка клуба"
        data-testid={testId('clubs', 'private-trainings', 'loader', 'club', clubId)}
      />
    )
  }

  if (clubError || !club) {
    return (
      <Text
        color="danger"
        data-testid={testId('clubs', 'private-trainings', 'error', 'club', clubId)}
      >
        Не удалось загрузить клуб для приватных тренировок.
      </Text>
    )
  }

  const teamIds = club.teamIds ?? []

  return (
    <div
      className="club-private-trainings hockey-stack hockey-stack--gap-20"
      data-testid={testId('clubs', 'private-trainings', 'panel', clubId)}
    >
      {teamIds.length > 0 ? (
        <TeamTrainingCreateWizard clubId={clubId} teamIds={teamIds} />
      ) : (
        <Text
          color="secondary"
          data-testid={testId('clubs', 'private-trainings', 'empty', 'teams', clubId)}
        >
          Привяжите команду к клубу, чтобы создать тренировку с раскладкой.
        </Text>
      )}

      <div className="club-private-trainings__section">
        <LineupCoachApprovalPanel clubId={clubId} />
      </div>

      <div
        className="club-private-trainings__section hockey-stack hockey-stack--gap-10"
        data-testid={testId('clubs', 'private-trainings', 'list', clubId)}
      >
        <Text
          variant="subheader-2"
          data-testid={testId('clubs', 'private-trainings', 'text', 'list-title', clubId)}
        >
          Опубликованные приватные тренировки
        </Text>
        {isLoading && (
          <ScoreboardLoader
            label="Загрузка тренировок"
            data-testid={testId('clubs', 'private-trainings', 'loader', clubId)}
          />
        )}
        {!isLoading && trainings.length === 0 && (
          <Text
            color="secondary"
            data-testid={testId('clubs', 'private-trainings', 'empty', clubId)}
          >
            Приватных тренировок пока нет
          </Text>
        )}
        {trainings.map((event) => (
          <div
            key={event.id}
            className="hockey-row hockey-row--between"
            data-testid={testId('clubs', 'private-trainings', 'row', event.id)}
          >
            <div>
              <Link
                to={`/events/trainings/${event.id}`}
                data-testid={testId('clubs', 'private-trainings', 'link', event.id)}
              >
                <Text data-testid={testId('clubs', 'private-trainings', 'text', 'title', event.id)}>
                  {event.title}
                </Text>
              </Link>
              <Text
                color="secondary"
                data-testid={testId('clubs', 'private-trainings', 'text', 'meta', event.id)}
              >
                {new Date(event.startsAt).toLocaleString('ru-RU')}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
