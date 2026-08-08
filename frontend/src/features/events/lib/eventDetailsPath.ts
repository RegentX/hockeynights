import type {EventType} from '@/entities/common'

/** Deep-link на детальную страницу игры или тренировки. */
export function eventDetailsPath(event: {id: string; type: EventType}): string {
  return event.type === 'training' ? `/events/trainings/${event.id}` : `/events/games/${event.id}`
}
