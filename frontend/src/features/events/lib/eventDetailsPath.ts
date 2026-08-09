import type {EventType} from '@/entities/common'

/** Deep-link на детальную страницу игры или тренировки. */
export function eventDetailsPath(event: {id: string; type: EventType}): string {
  return event.type === 'training' ? `/events/trainings/${event.id}` : `/events/games/${event.id}`
}

/** HOCFRONT-28G — stub edit route (пока только trainings). */
export function eventEditPath(event: {id: string; type: EventType}): string {
  if (event.type === 'training') return `/events/trainings/${event.id}/edit`
  return `/events/games/${event.id}`
}
