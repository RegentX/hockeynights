/**
 * SPEC-FR-6.1.1
 */

import L from 'leaflet'
import {useEffect, useRef} from 'react'
import {useMap} from 'react-leaflet'

import type {Arena} from '@/entities/arena'
import {
  MOSCOW_MAP_CENTER,
  MOSCOW_MAP_DEFAULT_ZOOM,
  MOSCOW_MAP_MAX_BOUNDS,
} from '@/shared/config/geo'

/** @spec SPEC-FR-6.1.1 - Стартовый вид: центр Москвы */
export function MoscowInitialView() {
  const map = useMap()

  useEffect(() => {
    map.setView([MOSCOW_MAP_CENTER.lat, MOSCOW_MAP_CENTER.lng], MOSCOW_MAP_DEFAULT_ZOOM, {
      animate: false,
    })
    const timer = window.setTimeout(() => map.invalidateSize(), 0)
    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

/** @spec SPEC-FR-6.1.1 - Вписать регион Москвы и Подмосковья */
export function FitMoscowRegionBounds() {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds(MOSCOW_MAP_MAX_BOUNDS)
    map.fitBounds(bounds, {maxZoom: 11, animate: false})
    const timer = window.setTimeout(() => map.invalidateSize(), 50)
    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

/** @spec SPEC-FR-6.1.1 - Пересчитать размер после layout / ресайза контейнера */
export function MapResizeFix() {
  const map = useMap()

  useEffect(() => {
    if (typeof map.invalidateSize !== 'function') return

    const invalidate = () => map.invalidateSize({animate: false})
    const timers = [0, 50, 200, 500].map((ms) => window.setTimeout(invalidate, ms))

    const container = typeof map.getContainer === 'function' ? map.getContainer() : null
    const parent = container?.parentElement ?? null
    const observer =
      typeof ResizeObserver !== 'undefined' && (parent || container)
        ? new ResizeObserver(() => {
            invalidate()
          })
        : null
    if (observer) observer.observe(parent ?? container!)

    window.addEventListener('resize', invalidate)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      observer?.disconnect()
      window.removeEventListener('resize', invalidate)
    }
  }, [map])

  return null
}

/** @spec SPEC-FR-6.1.1 - Сфокусироваться на выбранной арене (только при смене выбора) */
export function FocusSelectedArena({
  arenas,
  selectedArenaId,
}: {
  arenas: Arena[]
  selectedArenaId: string | null
}) {
  const map = useMap()
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedArenaId) return

    if (prevIdRef.current === null) {
      prevIdRef.current = selectedArenaId
      return
    }

    if (prevIdRef.current === selectedArenaId) return
    prevIdRef.current = selectedArenaId

    const arena = arenas.find((item) => item.id === selectedArenaId)
    if (!arena) return

    const zoom = Math.max(map.getZoom(), MOSCOW_MAP_DEFAULT_ZOOM)
    map.flyTo([arena.latitude, arena.longitude], zoom, {duration: 0.35})
  }, [selectedArenaId, arenas, map])

  return null
}
