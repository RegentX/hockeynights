/**
 * SPEC-FR-8.1.2
 */

import {useQuery} from '@tanstack/react-query'

import {fetchEvents} from '@/entities/event'
import {useSessionAccess} from '@/features/access'

/**
 * @spec SPEC-FR-8.1.2 - События, где пользователь участник
 */
export function useFeedbackEligibleEvents(currentUserId?: string) {
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId ?? sessionUserId

  return useQuery({
    queryKey: ['feedback-eligible-events', resolvedUserId],
    queryFn: async () => {
      const events = await fetchEvents()
      return events.filter((event) =>
        event.participation.some((p) => p.userId === resolvedUserId && p.status === 'going'),
      )
    },
    enabled: Boolean(resolvedUserId),
  })
}
