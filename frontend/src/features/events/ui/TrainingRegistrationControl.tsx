/**
 * TASK-05-05 — запись на тренировку: записаться / отменить / лист ожидания.
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'

import type {AttendanceStatus} from '@/entities/common'
import {updateAttendance} from '@/entities/event'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface TrainingRegistrationControlProps {
  eventId: string
  currentStatus?: AttendanceStatus
  registrationStatus?: 'open' | 'full'
  currentUserId?: string
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
  currentStatus,
  registrationStatus = 'open',
  currentUserId = 'user-001',
}: TrainingRegistrationControlProps) {
  const queryClient = useQueryClient()
  const isRegistered = currentStatus === 'going'
  const isWaitlisted = currentStatus === 'maybe'
  const isFull = registrationStatus === 'full'

  const mutation = useMutation({
    mutationFn: (status: AttendanceStatus) =>
      updateAttendance(eventId, status, currentUserId === 'user-001' ? 'Иван Петров' : undefined),
    onSuccess: () => invalidateTrainingQueries(queryClient, eventId),
  })

  const statusText = isRegistered
    ? 'Вы записаны на тренировку'
    : isWaitlisted
      ? 'Вы в листе ожидания'
      : isFull
        ? 'Мест нет — можно встать в лист ожидания'
        : 'Есть свободные места'

  return (
    <div
      className="hockey-stack hockey-stack--gap-8"
      data-testid={testId('events', 'training-registration', 'panel', eventId)}
    >
      <Text
        color="secondary"
        data-testid={testId('events', 'training-registration', 'text', 'status', eventId)}
      >
        {statusText}
      </Text>

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

        {(isRegistered || isWaitlisted) && (
          <HockeyButton
            view="outlined"
            size="m"
            loading={mutation.isPending}
            onClick={() => mutation.mutate('not_going')}
            data-testid={testId('events', 'training-registration', 'btn', 'cancel', eventId)}
          >
            Отменить запись
          </HockeyButton>
        )}
      </div>

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
