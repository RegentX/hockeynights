import {Navigate} from 'react-router'

/**
 * По итогам CEO-реформы отдельная страница поиска тренировок убрана:
 * весь сценарий перенесён в раздел "Игры и тренировки".
 */
export function IceRadarPage() {
  return <Navigate to="/events" replace />
}
