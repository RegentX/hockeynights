import {testId} from '@/shared/testing/testId'

export interface HockeyRinkLoaderProps {
  label?: string
  testIdPrefix?: string
  'data-testid'?: string
}

const SPARKLE_PIXELS = [
  {className: 'hockey-rink-loader__pixel--1', delay: '0s'},
  {className: 'hockey-rink-loader__pixel--2', delay: '0.18s'},
  {className: 'hockey-rink-loader__pixel--3', delay: '0.42s'},
  {className: 'hockey-rink-loader__pixel--4', delay: '0.65s'},
  {className: 'hockey-rink-loader__pixel--5', delay: '0.9s'},
  {className: 'hockey-rink-loader__pixel--6', delay: '1.12s'},
] as const

/**
 * Хоккейный лоадер: шайба с ретро-переливом (пиксели + диагональный блик).
 */
export function HockeyRinkLoader({
  label = 'Загрузка результатов тренировок',
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: HockeyRinkLoaderProps) {
  return (
    <div
      className="hockey-rink-loader"
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid={dataTestId ?? testId(testIdPrefix, 'rink-loader', 'loader')}
    >
      <div
        className="hockey-rink-loader__stage"
        data-testid={testId(testIdPrefix, 'rink-loader', 'panel', 'rink')}
      >
        <div
          className="hockey-rink-loader__puck"
          data-testid={testId(testIdPrefix, 'rink-loader', 'shape', 'puck')}
        >
          <span
            className="hockey-rink-loader__mosaic"
            data-testid={testId(testIdPrefix, 'rink-loader', 'shape', 'trail')}
            aria-hidden
          />
          <span className="hockey-rink-loader__shine" aria-hidden />
          {SPARKLE_PIXELS.map((pixel) => (
            <span
              key={pixel.className}
              className={`hockey-rink-loader__pixel ${pixel.className}`}
              style={{animationDelay: pixel.delay}}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  )
}
