import type {EventType} from '@/entities/common'
import {routes} from '@/shared/const/appRoutes'

/** Deep-link на детальную страницу игры или тренировки. */
export function eventDetailsPath(event: {id: string; type: EventType}): string {
  return event.type === 'training' ? `/events/trainings/${event.id}` : `/events/games/${event.id}`
}

/** HOCFRONT-28G — edit route (пока только trainings). */
export function eventEditPath(event: {id: string; type: EventType}): string {
  if (event.type === 'training') return `/events/trainings/${event.id}/edit`
  return `/events/games/${event.id}`
}

/** Создание «похожей» тренировки — форма подтянет источник по `copyFrom`. */
export function eventCopyCreatePath(event: {id: string}): string {
  return `${routes.eventsCreate}?copyFrom=${encodeURIComponent(event.id)}`
}
