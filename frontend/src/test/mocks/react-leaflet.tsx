/**
 * SPEC-FR-6.1.1 - Stub react-leaflet для Vitest/jsdom
 */

import type {ReactNode} from 'react'

export function MapContainer({children}: {children?: ReactNode}) {
  return (
    <div className="arena-map__leaflet arena-map__leaflet--mock" data-testid="arenas-map-map">
      {children}
    </div>
  )
}

export function TileLayer() {
  return <span className="arena-map__osm-attribution">© OpenStreetMap contributors</span>
}

export function Marker({
  children,
  eventHandlers,
}: {
  children?: ReactNode
  eventHandlers?: {click?: () => void}
}) {
  return (
    <button type="button" className="arena-map__mock-marker" onClick={eventHandlers?.click}>
      {children}
    </button>
  )
}

export function Popup({children}: {children?: ReactNode}) {
  return <div className="arena-map__mock-popup">{children}</div>
}

export function useMap() {
  return {
    setView: () => undefined,
    fitBounds: () => undefined,
    panTo: () => undefined,
    flyTo: () => undefined,
    invalidateSize: () => undefined,
    getZoom: () => 10,
  }
}
