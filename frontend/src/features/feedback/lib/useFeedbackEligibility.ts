/**
 * SPEC-FR-8.1.2
 */

import {useQuery} from '@tanstack/react-query'

import {fetchEvents} from '@/entities/event'

/**
 * @spec SPEC-FR-8.1.2 - События, где пользователь участник
 */
export function useFeedbackEligibleEvents(currentUserId = 'user-001') {
  return useQuery({
    queryKey: ['feedback-eligible-events', currentUserId],
    queryFn: async () => {
      const events = await fetchEvents()
      return events.filter((event) =>
        event.participation.some((p) => p.userId === currentUserId && p.status === 'going'),
      )
    },
  })
}
