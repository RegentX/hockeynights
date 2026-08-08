/**
 * SPEC-FR-3.3.1, SPEC-FR-25.6.2
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {AttendanceStatus} from '@/entities/common'
import type {EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp, updateAttendance, updateEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'

/** @spec SPEC-FR-3.3.1 - Props контрола посещаемости */
export interface AttendanceControlProps {
  /** @spec SPEC-FR-4.1.1 */
  eventId: string
  /** @spec SPEC-FR-3.3.1 */
  currentStatus?: AttendanceStatus
  /** @spec SPEC-FR-3.3.1 */
  currentUserId?: string
  /** Заголовок события для привязки RSVP к конкретной записи */
  eventTitle?: string
  /** Тип события для текста подписи */
  eventKind?: 'game' | 'training'
  /** @spec SPEC-FR-25.6.2 - Использовать RSVP API вместо attendance */
  useRsvpApi?: boolean
}

const RSVP_BUTTONS: {status: EventRsvpStatus; label: string}[] = [
  {status: 'confirmed', label: 'Иду'},
  {status: 'declined', label: 'Не иду'},
]

const ATTENDANCE_BUTTONS: {status: AttendanceStatus; label: string}[] = [
  {status: 'going', label: 'Иду'},
  {status: 'not_going', label: 'Не иду'},
  {status: 'maybe', label: 'Под вопросом'},
]

function attendanceToRsvp(status?: AttendanceStatus): EventRsvpStatus | undefined {
  if (status === 'going') return 'confirmed'
  if (status === 'not_going') return 'declined'
  if (status === 'maybe') return 'pending'
  return undefined
}

function buildAttendanceLabel(
  eventKind: 'game' | 'training' | undefined,
  eventTitle?: string,
): string {
  const kindLabel = eventKind === 'training' ? 'тренировке' : 'игре'
  if (eventTitle) {
    return `Участие в ${kindLabel} «${eventTitle}»`
  }
  return eventKind === 'training' ? 'Участие в тренировке' : 'Участие в игре'
}

/**
 * @spec SPEC-FR-3.3.1 - Отметка участия: идёт, не идёт, под вопросом
 */
export function AttendanceControl({
  eventId,
  currentStatus,
  currentUserId,
  eventTitle,
  eventKind,
  useRsvpApi,
}: AttendanceControlProps) {
  const queryClient = useQueryClient()
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const rsvpEnabled = useRsvpApi ?? false

  const {data: rsvpBoard, isLoading: isRsvpLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
    enabled: rsvpEnabled,
  })

  const attendanceMutation = useMutation({
    mutationFn: (status: AttendanceStatus) => updateAttendance(eventId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['event', eventId]})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['roster-status', eventId]})
    },
  })

  const rsvpMutation = useMutation({
    mutationFn: (status: EventRsvpStatus) => updateEventRsvp(eventId, {status}),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['event-rsvp', eventId]})
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['roster-status', eventId]})
    },
  })

  if (rsvpEnabled && isRsvpLoading) {
    return (
      <div
        className="event-attendance event-attendance--loading hockey-stack hockey-stack--gap-6"
        data-testid={testId('events', 'attendance', 'loader', eventId)}
        aria-busy="true"
        aria-label="Загрузка RSVP"
      >
        <Text
          color="secondary"
          data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
        >
          RSVP команды на игру
        </Text>
        <div className="hockey-row hockey-row--gap-8">
          <IceSkeleton height={36} count={2} testIdPrefix="events" />
        </div>
      </div>
    )
  }

  if (rsvpEnabled && rsvpBoard) {
    const currentRsvp =
      rsvpBoard.players.find((player) => player.userId === resolvedUserId)?.status ??
      attendanceToRsvp(currentStatus) ??
      'pending'

    return (
      <div
        className="event-attendance hockey-stack hockey-stack--gap-6"
        data-testid={testId('events', 'attendance', 'panel', eventId)}
      >
        <Text
          color="secondary"
          data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
        >
          {buildAttendanceLabel(eventKind ?? 'game', eventTitle ?? rsvpBoard.teamName)}
        </Text>
        <div
          className="hockey-row hockey-row--gap-8"
          data-testid={testId('events', 'attendance', 'list', eventId)}
        >
          {RSVP_BUTTONS.map((btn) => (
            <HockeyButton
              key={btn.status}
              view={currentRsvp === btn.status ? 'action' : 'outlined'}
              loading={rsvpMutation.isPending}
              onClick={() => rsvpMutation.mutate(btn.status)}
              data-testid={testId('events', 'attendance', 'btn', btn.status, eventId)}
            >
              {btn.label}
            </HockeyButton>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="event-attendance hockey-stack hockey-stack--gap-6"
      data-testid={testId('events', 'attendance', 'panel', eventId)}
    >
      <Text
        color="secondary"
        data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
      >
        {buildAttendanceLabel(eventKind, eventTitle)}
      </Text>
      <div
        className="hockey-row hockey-row--gap-8"
        data-testid={testId('events', 'attendance', 'list', eventId)}
      >
        {ATTENDANCE_BUTTONS.map((btn) => (
          <HockeyButton
            key={btn.status}
            view={currentStatus === btn.status ? 'action' : 'outlined'}
            loading={attendanceMutation.isPending}
            onClick={() => attendanceMutation.mutate(btn.status)}
            data-testid={testId('events', 'attendance', 'btn', btn.status, eventId)}
          >
            {btn.label}
          </HockeyButton>
        ))}
      </div>
    </div>
  )
}
