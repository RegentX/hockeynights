/**
 * SPEC-FR-3.3.1
 */

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Button, Text} from '@gravity-ui/uikit'
import {updateAttendance} from '@/features/events/api/eventsApi'
import type {AttendanceStatus} from '@/entities/common/types'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-3.3.1 - Props контроля посещаемости */
export interface AttendanceControlProps {
  /** @spec SPEC-FR-4.1.1 */
  eventId: string
  /** @spec SPEC-FR-3.3.1 */
  currentStatus?: AttendanceStatus
}

/**
 * @spec SPEC-FR-3.3.1 - Отметка участия: идёт, не идёт, под вопросом
 */
export function AttendanceControl({eventId, currentStatus}: AttendanceControlProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (status: AttendanceStatus) => updateAttendance(eventId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['roster-status', eventId]})
    },
  })

  const buttons: {status: AttendanceStatus; label: string}[] = [
    {status: 'going', label: 'Иду'},
    {status: 'not_going', label: 'Не иду'},
    {status: 'maybe', label: 'Под вопросом'},
  ]

  return (
    <div className="hockey-stack hockey-stack--gap-6" data-testid={testId('events', 'attendance', 'panel', eventId)}>
      <Text color="secondary" data-testid={testId('events', 'attendance', 'text', 'label', eventId)}>
        RSVP на матч/тренировку
      </Text>
      <div className="hockey-row hockey-row--gap-8" data-testid={testId('events', 'attendance', 'list', eventId)}>
        {buttons.map((btn) => (
          <Button
            key={btn.status}
            view={currentStatus === btn.status ? 'action' : 'outlined'}
            loading={mutation.isPending}
            onClick={() => mutation.mutate(btn.status)}
            data-testid={testId('events', 'attendance', 'btn', btn.status, eventId)}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
