/**
 * SPEC-FR-6.1.1
 * SPEC-UI-2.2
 */

import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import {Text} from '@gravity-ui/uikit'
import type {Arena, ArenaBookingMode} from '@/entities/arena/types'
import {createArenaMapIcon} from '@/features/arenas/arenaMapIcon'
import {
  FitMoscowRegionBounds,
  FocusSelectedArena,
  MapResizeFix,
  MoscowInitialView,
} from '@/features/arenas/ArenaMapControls'
import {
  MOSCOW_MAP_CENTER,
  MOSCOW_MAP_DEFAULT_ZOOM,
  MOSCOW_MAP_MAX_BOUNDS,
  MOSCOW_MAP_MAX_ZOOM,
  MOSCOW_MAP_MIN_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from '@/shared/config/geo'

const BOOKING_LABELS: Record<ArenaBookingMode, string> = {
  slot_calendar: 'Слоты по времени',
  external_portal: 'Запись через портал',
}

/** @spec SPEC-FR-6.1.1 - Props карты арен */
export interface ArenaMapProps {
  arenas: Arena[]
  selectedArenaId: string | null
  onSelectArena: (arenaId: string) => void
  freeSlotArenaIds?: Set<string>
}

/**
 * @spec SPEC-FR-6.1.1 - Карта арен на OpenStreetMap (Москва и Подмосковье)
 */
export function ArenaMap({
  arenas,
  selectedArenaId,
  onSelectArena,
  freeSlotArenaIds,
}: ArenaMapProps) {
  return (
    <div className="arena-map" role="application" aria-label="Карта площадок для аренды льда · Москва">
      <div className="arena-map__surface">
        <MapContainer
          center={[MOSCOW_MAP_CENTER.lat, MOSCOW_MAP_CENTER.lng]}
          zoom={MOSCOW_MAP_DEFAULT_ZOOM}
          minZoom={MOSCOW_MAP_MIN_ZOOM}
          maxZoom={MOSCOW_MAP_MAX_ZOOM}
          scrollWheelZoom
          maxBounds={MOSCOW_MAP_MAX_BOUNDS}
          maxBoundsViscosity={0.85}
          className="arena-map__leaflet"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          <MoscowInitialView />
          <FitMoscowRegionBounds />
          <MapResizeFix />
          <FocusSelectedArena arenas={arenas} selectedArenaId={selectedArenaId} />

          {arenas.map((arena) => {
            const selected = arena.id === selectedArenaId
            const hasFree = freeSlotArenaIds?.has(arena.id) ?? false
            return (
              <Marker
                key={arena.id}
                position={[arena.latitude, arena.longitude]}
                icon={createArenaMapIcon(arena, selected, hasFree)}
                eventHandlers={{
                  click: () => onSelectArena(arena.id),
                }}
              >
                <Popup>
                  <div className="arena-map__popup">
                    <strong>{arena.name}</strong>
                    <div>{arena.district ?? arena.city}</div>
                    <div>{BOOKING_LABELS[arena.bookingMode]}</div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        <div className="arena-map__bottom-cover" aria-hidden />
      </div>

      <div className="arena-map__a11y-pins" aria-hidden={false}>
        {arenas.map((arena) => (
          <button
            key={`a11y-${arena.id}`}
            type="button"
            className="arena-map__a11y-pin"
            onClick={() => onSelectArena(arena.id)}
            aria-pressed={arena.id === selectedArenaId}
            aria-label={`${arena.name}, ${BOOKING_LABELS[arena.bookingMode]}`}
          >
            {arena.name}
          </button>
        ))}
      </div>

      <div className="arena-map__legend">
        <span className="arena-map__legend-item arena-map__legend-item--slot">
          Слоты по времени
        </span>
        <span className="arena-map__legend-item arena-map__legend-item--portal">
          Запись через портал
        </span>
        <Text color="secondary" className="arena-map__hint">
          Карта OpenStreetMap · Москва и ближнее Подмосковье
        </Text>
      </div>
    </div>
  )
}
