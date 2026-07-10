import {MapPin, Users} from 'lucide-react'
import {Link} from 'react-router-dom'

import type {AttendanceStatus} from '@/entities/common'
import type {GameEvent} from '@/entities/event'
import {
  ACCESS_LABELS,
  AttendanceControl,
  EVENT_TYPE_LABELS,
  SKILL_LEVEL_LABELS,
  TRAINING_FORMAT_LABELS,
} from '@/features/events'
import {MagicCard} from '@/shared/magic-ui/magic-card'
import {testId} from '@/shared/testing/testId'

export interface EventMagicCardProps {
  event: GameEvent
  currentUserId?: string
}

function getFillRatio(event: GameEvent): number {
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  return requiredTotal > 0 ? filledTotal / requiredTotal : 0
}

export function EventMagicCard({event, currentUserId = 'user-001'}: EventMagicCardProps) {
  const start = new Date(event.startsAt)
  const fillRatio = getFillRatio(event)
  const fillPercent = Math.round(fillRatio * 100)
  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : undefined
  const formatLabel = event.trainingFormat ? TRAINING_FORMAT_LABELS[event.trainingFormat] : undefined
  const levelLabel = event.requiredSkillLevel
    ? SKILL_LEVEL_LABELS[event.requiredSkillLevel]
    : undefined
  const myAttendance = event.participation.find((p) => p.userId === currentUserId)
  const currentStatus = myAttendance?.status as AttendanceStatus | undefined

  const fillGradient =
    fillPercent >= 100
      ? 'linear-gradient(to right, #34d399, #38bdf8)'
      : fillPercent >= 70
        ? 'linear-gradient(to right, #38bdf8, #3b82f6)'
        : 'linear-gradient(to right, #f59e0b, #ef4444)'

  const content = (
    <MagicCard data-testid={testId('events', 'magic-card', 'card', event.id)}>
      <div className="magic-event-card">
        <div className="magic-event-top">
          <div className="magic-event-time">
            <span
              className="magic-event-time-text"
              data-testid={testId('events', 'magic-card', 'text', 'time', event.id)}
            >
              {start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
            </span>
            <span
              className="magic-event-date"
              data-testid={testId('events', 'magic-card', 'text', 'date', event.id)}
            >
              {start.toLocaleDateString('ru-RU', {weekday: 'short', day: 'numeric', month: 'long'})}
            </span>
          </div>

          <span
            className="magic-event-badge"
            data-testid={testId('events', 'magic-card', 'badge', 'type', event.id)}
          >
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </span>
        </div>

        <div>
          <h3
            className="magic-event-title"
            data-testid={testId('events', 'magic-card', 'text', 'title', event.id)}
          >
            {event.title}
          </h3>
          <p
            className="magic-event-arena"
            data-testid={testId('events', 'magic-card', 'text', 'arena', event.id)}
          >
            <MapPin size={18} color="#38bdf8" aria-hidden />
            {event.arenaName ?? event.arenaId}
            {event.district ? ` · ${event.district}` : ''}
          </p>
        </div>

        <div className="magic-event-chips">
          {formatLabel && <span className="magic-event-chip">{formatLabel}</span>}
          {levelLabel && <span className="magic-event-chip">{levelLabel}</span>}
          {accessLabel && (
            <span className="magic-event-chip magic-event-chip--access">{accessLabel}</span>
          )}
        </div>

        <div className="magic-event-fill">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <Users size={16} aria-hidden />
              Заполненность
            </span>
            <span data-testid={testId('events', 'magic-card', 'text', 'fill', event.id)}>
              {fillPercent}%
            </span>
          </div>

          <div className="magic-event-fill-bar">
            <div
              className="magic-event-fill-bar-inner"
              style={{
                width: `${Math.min(fillPercent, 100)}%`,
                backgroundImage: fillGradient,
              }}
            />
          </div>
        </div>

        <div className="magic-event-footer">
          {event.pricePerPlayer != null && (
            <span
              className="magic-event-price"
              data-testid={testId('events', 'magic-card', 'text', 'price', event.id)}
            >
              {event.pricePerPlayer.toLocaleString('ru-RU')} ₽
            </span>
          )}

          {event.type === 'training' && <span className="magic-details-link">Подробнее</span>}
        </div>

        {event.type === 'training' && (
          <div
            className="magic-event-attendance"
            onClick={(clickEvent) => {
              clickEvent.preventDefault()
              clickEvent.stopPropagation()
            }}
            onKeyDown={(keydownEvent) => keydownEvent.stopPropagation()}
            role="presentation"
            data-testid={testId('events', 'magic-card', 'panel', 'attendance', event.id)}
          >
            <p
              className="magic-event-attendance__title"
              data-testid={testId('events', 'magic-card', 'text', 'attendance-title', event.id)}
            >
              Моё участие
            </p>
            <AttendanceControl
              eventId={event.id}
              currentStatus={currentStatus}
              currentUserId={currentUserId}
              eventTitle={event.title}
              eventKind="training"
              variant="magic"
              compact
            />
          </div>
        )}
      </div>
    </MagicCard>
  )

  if (event.type !== 'training') return content

  return (
    <Link
      to={`/events/magic/trainings/${event.id}`}
      className="magic-card-link"
      data-testid={testId('events', 'magic-card', 'link', 'card', event.id)}
    >
      {content}
    </Link>
  )
}
