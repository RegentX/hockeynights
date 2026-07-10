/**
 * SPEC-FR-3.3.1, SPEC-FR-25.6.2
 */

import {Button, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {AttendanceStatus} from '@/entities/common'
import type {EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp, updateAttendance, updateEventRsvp} from '@/entities/event'
import {cn} from '@/shared/lib/cn'
import {testId} from '@/shared/testing/testId'
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
  /** Magic UI: чипы вместо Gravity Button */
  variant?: 'default' | 'magic'
  /** Скрыть подпись — для карточек в списке */
  compact?: boolean
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
function MagicAttendanceButtons<T extends string>({
  buttons,
  currentValue,
  isPending,
  onSelect,
  eventId,
  testIdPrefix,
}: {
  buttons: {status: T; label: string}[]
  currentValue?: T
  isPending: boolean
  onSelect: (status: T) => void
  eventId: string
  testIdPrefix: string
}) {
  return (
    <div
      className="magic-attendance-actions"
      data-testid={testId('events', testIdPrefix, 'list', eventId)}
    >
      {buttons.map((btn) => (
        <button
          key={btn.status}
          type="button"
          className={cn(
            'magic-attendance-btn',
            currentValue === btn.status && 'magic-attendance-btn--active',
          )}
          disabled={isPending}
          onClick={() => onSelect(btn.status)}
          data-testid={testId('events', testIdPrefix, 'btn', btn.status, eventId)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}

export function AttendanceControl({
  eventId,
  currentStatus,
  currentUserId = 'user-001',
  eventTitle,
  eventKind,
  useRsvpApi,
  variant = 'default',
  compact = false,
}: AttendanceControlProps) {
  const queryClient = useQueryClient()
  const rsvpEnabled = useRsvpApi ?? false
  const isMagic = variant === 'magic'
  const panelClassName = cn(
    'event-attendance',
    'hockey-stack',
    'hockey-stack--gap-6',
    isMagic && 'event-attendance--magic',
    compact && 'event-attendance--compact',
  )

  const {data: rsvpBoard, isLoading: isRsvpLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
    enabled: rsvpEnabled,
  })

  const attendanceMutation = useMutation({
    mutationFn: (status: AttendanceStatus) => updateAttendance(eventId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['events']})
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
        className={cn(panelClassName, 'event-attendance--loading')}
        data-testid={testId('events', 'attendance', 'loader', eventId)}
        aria-busy="true"
        aria-label="Загрузка RSVP"
      >
        {!compact && (
          <p
            className="magic-attendance-label"
            data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
          >
            RSVP команды на игру
          </p>
        )}
        <div className="hockey-row hockey-row--gap-8">
          <IceSkeleton height={36} count={2} testIdPrefix="events" />
        </div>
      </div>
    )
  }

  if (rsvpEnabled && rsvpBoard) {
    const currentRsvp =
      rsvpBoard.players.find((player) => player.userId === currentUserId)?.status ??
      attendanceToRsvp(currentStatus) ??
      'pending'

    const label = buildAttendanceLabel(eventKind ?? 'game', eventTitle ?? rsvpBoard.teamName)

    return (
      <div
        className={panelClassName}
        data-testid={testId('events', 'attendance', 'panel', eventId)}
      >
        {!compact &&
          (isMagic ? (
            <p
              className="magic-attendance-label"
              data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
            >
              {label}
            </p>
          ) : (
            <Text
              color="secondary"
              data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
            >
              {label}
            </Text>
          ))}
        {isMagic ? (
          <MagicAttendanceButtons
            buttons={RSVP_BUTTONS}
            currentValue={currentRsvp}
            isPending={rsvpMutation.isPending}
            onSelect={(status) => rsvpMutation.mutate(status)}
            eventId={eventId}
            testIdPrefix="attendance"
          />
        ) : (
          <div
            className="hockey-row hockey-row--gap-8"
            data-testid={testId('events', 'attendance', 'list', eventId)}
          >
            {RSVP_BUTTONS.map((btn) => (
              <Button
                key={btn.status}
                view={currentRsvp === btn.status ? 'action' : 'outlined'}
                loading={rsvpMutation.isPending}
                onClick={() => rsvpMutation.mutate(btn.status)}
                data-testid={testId('events', 'attendance', 'btn', btn.status, eventId)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const label = buildAttendanceLabel(eventKind, eventTitle)

  return (
    <div className={panelClassName} data-testid={testId('events', 'attendance', 'panel', eventId)}>
      {!compact &&
        (isMagic ? (
          <p
            className="magic-attendance-label"
            data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
          >
            {label}
          </p>
        ) : (
          <Text
            color="secondary"
            data-testid={testId('events', 'attendance', 'text', 'label', eventId)}
          >
            {label}
          </Text>
        ))}
      {isMagic ? (
        <MagicAttendanceButtons
          buttons={ATTENDANCE_BUTTONS}
          currentValue={currentStatus}
          isPending={attendanceMutation.isPending}
          onSelect={(status) => attendanceMutation.mutate(status)}
          eventId={eventId}
          testIdPrefix="attendance"
        />
      ) : (
        <div
          className="hockey-row hockey-row--gap-8"
          data-testid={testId('events', 'attendance', 'list', eventId)}
        >
          {ATTENDANCE_BUTTONS.map((btn) => (
            <Button
              key={btn.status}
              view={currentStatus === btn.status ? 'action' : 'outlined'}
              loading={attendanceMutation.isPending}
              onClick={() => attendanceMutation.mutate(btn.status)}
              data-testid={testId('events', 'attendance', 'btn', btn.status, eventId)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
