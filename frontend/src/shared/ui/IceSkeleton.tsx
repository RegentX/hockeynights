/**
 * SPEC-UI-3.3, SPEC-NFR-10
 */

import {testId} from '@/shared/testing/testId'

/** @spec SPEC-UI-3.3 - Props skeleton */
export interface IceSkeletonProps {
  /** @spec SPEC-UI-3.3 */
  height?: number | string
  /** @spec SPEC-UI-3.3 */
  count?: number
  testIdPrefix?: string
}

/**
 * @spec SPEC-UI-3.3 - Skeleton «заливка льда»
 */
export function IceSkeleton({height = 120, count = 1, testIdPrefix = 'shared'}: IceSkeletonProps) {
  return (
    <>
      {Array.from({length: count}, (_, i) => (
        <div
          key={i}
          className="ice-skeleton hockey-ice-shimmer"
          style={{
            ['--ice-skeleton-height' as string]:
              typeof height === 'number' ? `${height}px` : height,
          }}
          aria-hidden
          data-testid={testId(testIdPrefix, 'ice-skeleton', 'loader', i + 1)}
        />
      ))}
    </>
  )
}
