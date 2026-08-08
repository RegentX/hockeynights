import type {EventRsvpStatus} from '@/entities/event'

/** Подпись личного статуса в командном RSVP — не путать с attendance «Вы записаны». */
export function teamRsvpStatusLabel(
  status: EventRsvpStatus | undefined,
  declineReason?: string,
): string {
  if (status === 'confirmed') return 'Вы идёте'
  if (status === 'declined') {
    return declineReason ? `Не смогу · ${declineReason}` : 'Не смогу'
  }
  return 'Ответ не отправлен'
}

export function isTeamRsvpConfirmed(status: EventRsvpStatus | undefined): boolean {
  return status === 'confirmed'
}
