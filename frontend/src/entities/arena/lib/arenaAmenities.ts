/**
 * HOCFRONT-32 — человекочитаемые удобства арены
 */

const AMENITY_LABELS: Record<string, string> = {
  parking: 'Парковка',
  shower: 'Душ',
  skate_sharpening: 'Заточка коньков',
  rental: 'Прокат',
  cafe: 'Кафе',
}

export function formatArenaAmenity(code: string): string {
  return AMENITY_LABELS[code] ?? code
}

export function formatArenaAmenities(amenities: string[]): string {
  return amenities.map(formatArenaAmenity).join(' · ')
}
