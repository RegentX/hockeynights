/**
 * HOCFRONT-9 / страница игры — ответ игрока на командный RSVP с причиной отказа.
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp, updateEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {DeclineReasonField} from '@/features/radar/ui/DeclineReasonField'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceSkeleton} from '@/shared/ui/IceSkeleton'

export interface TeamRsvpResponseControlProps {
  eventId: string
  currentUserId?: string
  /** Без блока статуса — для встраивания в hero LeagueGameRsvp */
  hideStatus?: boolean
}

const STATUS_LABELS: Record<EventRsvpStatus, string> = {
  confirmed: 'Вы идёте',
  declined: 'Вы не сможете',
  pending: 'Ответ не отправлен',
}

const STATUS_COLORS: Record<EventRsvpStatus, 'positive' | 'danger' | 'warning'> = {
  confirmed: 'positive',
  declined: 'danger',
  pending: 'warning',
}

export function TeamRsvpResponseControl({
  eventId,
  currentUserId,
  hideStatus = false,
}: TeamRsvpResponseControlProps) {
  const queryClient = useQueryClient()
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const [showDeclineReason, setShowDeclineReason] = useState(false)

  const {data: board, isLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  const mutation = useMutation({
    mutationFn: (payload: {status: EventRsvpStatus; declineReason?: string}) =>
      updateEventRsvp(eventId, payload),
    onSuccess: () => {
      setShowDeclineReason(false)
      void queryClient.invalidateQueries({queryKey: ['event-rsvp', eventId]})
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['event', eventId]})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
    },
  })

  if (isLoading) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('radar', 'team-rsvp-response', 'loader', eventId)}
        aria-busy="true"
      >
        <IceSkeleton height={36} count={2} testIdPrefix="radar" />
      </div>
    )
  }

  if (!board) return null

  const me = board.players.find((player) => player.userId === resolvedUserId)
  const myStatus = me?.status ?? 'pending'

  function confirmAttendance() {
    mutation.mutate({status: 'confirmed'})
  }

  function submitDecline(reason: string) {
    mutation.mutate({status: 'declined', declineReason: reason})
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-10"
      data-testid={testId('radar', 'team-rsvp-response', 'panel', eventId)}
    >
      {!hideStatus && (
        <div className="hockey-stack hockey-stack--gap-4">
          <Text
            color={STATUS_COLORS[myStatus]}
            data-testid={testId('radar', 'team-rsvp-response', 'text', 'status', eventId)}
          >
            {STATUS_LABELS[myStatus]}
            {myStatus === 'declined' && me?.declineReason ? ` · ${me.declineReason}` : ''}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('radar', 'team-rsvp-response', 'text', 'hint', eventId)}
          >
            Ответ попадает в RSVP команды — капитан видит причину отказа.
          </Text>
        </div>
      )}

      {!showDeclineReason ? (
        <div
          className="hockey-row hockey-row--gap-10 hockey-row--wrap"
          data-testid={testId('radar', 'team-rsvp-response', 'list', 'actions', eventId)}
        >
          <HockeyButton
            view={myStatus === 'confirmed' ? 'action' : 'outlined'}
            size="m"
            loading={mutation.isPending}
            onClick={confirmAttendance}
            data-testid={testId('radar', 'team-rsvp-response', 'btn', 'confirm', eventId)}
          >
            Буду
          </HockeyButton>
          <HockeyButton
            view={myStatus === 'declined' ? 'action' : 'outlined'}
            size="m"
            loading={mutation.isPending}
            onClick={() => setShowDeclineReason(true)}
            data-testid={testId('radar', 'team-rsvp-response', 'btn', 'decline', eventId)}
          >
            Не смогу
          </HockeyButton>
        </div>
      ) : (
        <DeclineReasonField
          onConfirm={submitDecline}
          onCancel={() => setShowDeclineReason(false)}
          isPending={mutation.isPending}
        />
      )}
    </div>
  )
}
