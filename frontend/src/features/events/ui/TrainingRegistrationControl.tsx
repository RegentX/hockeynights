/**
 * TASK-05-05 — запись на тренировку: записаться / отменить / лист ожидания.
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {AttendanceStatus, EventType} from '@/entities/common'
import {updateAttendance} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface TrainingRegistrationControlProps {
  eventId: string
  /** Для корректного текста «на игру» / «на тренировку» */
  eventType?: EventType
  currentStatus?: AttendanceStatus
  registrationStatus?: 'open' | 'full'
  currentUserId?: string
  /** Без текста статуса — для плотных карточек календаря */
  compact?: boolean
}

function invalidateTrainingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
) {
  void queryClient.invalidateQueries({queryKey: ['events']})
  void queryClient.invalidateQueries({queryKey: ['event', eventId]})
  void queryClient.invalidateQueries({queryKey: ['calendar']})
  void queryClient.invalidateQueries({queryKey: ['roster-status', eventId]})
}

/**
 * @spec TASK-05-05 - UI регистрации на тренировку
 */
export function TrainingRegistrationControl({
  eventId,
  eventType = 'training',
  currentStatus,
  registrationStatus = 'open',
  compact = false,
}: TrainingRegistrationControlProps) {
  const queryClient = useQueryClient()
  const {session} = useSessionAccess()
  const displayName = session?.user.displayName
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isRegistered = currentStatus === 'going'
  const isWaitlisted = currentStatus === 'maybe'
  const isFull = registrationStatus === 'full'
  const entityLabel = eventType === 'game' ? 'игру' : 'тренировку'

  const mutation = useMutation({
    mutationFn: (status: AttendanceStatus) => updateAttendance(eventId, status, displayName),
    onSuccess: () => {
      setConfirmCancel(false)
      invalidateTrainingQueries(queryClient, eventId)
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
    },
  })

  const statusText = isRegistered
    ? `Вы записаны на ${entityLabel}`
    : isWaitlisted
      ? 'Вы в листе ожидания'
      : isFull
        ? 'Мест нет — можно встать в лист ожидания'
        : 'Есть свободные места'

  return (
    <div
      className={
        compact
          ? 'hockey-row hockey-row--gap-8 hockey-row--wrap'
          : 'hockey-stack hockey-stack--gap-8'
      }
      data-testid={testId('events', 'training-registration', 'panel', eventId)}
    >
      {!compact && (
        <Text
          color="secondary"
          data-testid={testId('events', 'training-registration', 'text', 'status', eventId)}
        >
          {statusText}
        </Text>
      )}

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('events', 'training-registration', 'list', 'actions', eventId)}
      >
        {!isRegistered && !isWaitlisted && !isFull && (
          <HockeyButton
            view="action"
            size="m"
            loading={mutation.isPending}
            onClick={() => mutation.mutate('going')}
            data-testid={testId('events', 'training-registration', 'btn', 'join', eventId)}
          >
            Записаться
          </HockeyButton>
        )}

        {!isRegistered && !isWaitlisted && isFull && (
          <HockeyButton
            view="action"
            size="m"
            loading={mutation.isPending}
            onClick={() => mutation.mutate('maybe')}
            data-testid={testId('events', 'training-registration', 'btn', 'waitlist', eventId)}
          >
            В лист ожидания
          </HockeyButton>
        )}

        {(isRegistered || isWaitlisted) && !confirmCancel && (
          <HockeyButton
            view="outlined"
            size="m"
            loading={mutation.isPending}
            onClick={() => setConfirmCancel(true)}
            data-testid={testId('events', 'training-registration', 'btn', 'cancel', eventId)}
          >
            Отменить запись
          </HockeyButton>
        )}
      </div>

      {confirmCancel && (
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId(
            'events',
            'training-registration',
            'panel',
            'confirm-cancel',
            eventId,
          )}
        >
          <Text
            color="secondary"
            data-testid={testId(
              'events',
              'training-registration',
              'text',
              'confirm-cancel',
              eventId,
            )}
          >
            Отменить запись? Место может сразу перейти игроку из листа ожидания. Оплата на MVP не
            списывается.
          </Text>
          <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
            <HockeyButton
              view="outlined"
              size="m"
              loading={mutation.isPending}
              onClick={() => mutation.mutate('not_going')}
              data-testid={testId(
                'events',
                'training-registration',
                'btn',
                'confirm-cancel',
                eventId,
              )}
            >
              Подтвердить отмену
            </HockeyButton>
            <HockeyButton
              view="flat"
              size="m"
              disabled={mutation.isPending}
              onClick={() => setConfirmCancel(false)}
              data-testid={testId(
                'events',
                'training-registration',
                'btn',
                'dismiss-cancel',
                eventId,
              )}
            >
              Оставить запись
            </HockeyButton>
          </div>
        </div>
      )}

      {mutation.isError && (
        <Text
          color="danger"
          data-testid={testId('events', 'training-registration', 'error', eventId)}
        >
          Не удалось обновить запись. Попробуйте ещё раз.
        </Text>
      )}
    </div>
  )
}
