import type {IceSlot} from '@/entities/arena/model'

export function arenaHasFreeSlots(arenaId: string, slots: IceSlot[]): boolean {
  return slots.some((slot) => slot.arenaId === arenaId && slot.status === 'free')
}
