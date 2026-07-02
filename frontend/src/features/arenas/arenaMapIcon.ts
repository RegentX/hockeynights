/**
 * SPEC-FR-6.1.1, SPEC-UI-2.2
 */

import L from 'leaflet'

import type {Arena} from '@/entities/arena/types'

/**
 * @spec SPEC-FR-6.1.1 - DivIcon маркера арены на OSM-карте
 */
export function createArenaMapIcon(arena: Arena, selected: boolean, hasFree: boolean): L.DivIcon {
  const classes = [
    'arena-map__leaflet-pin',
    `arena-map__leaflet-pin--${arena.bookingMode}`,
    selected ? 'arena-map__leaflet-pin--selected' : '',
    hasFree ? 'arena-map__leaflet-pin--free' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return L.divIcon({
    className: 'arena-map__leaflet-icon',
    html: `<span class="${classes}"><span class="arena-map__leaflet-pin-core" aria-hidden="true"></span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  })
}
