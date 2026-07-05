/**
 * SPEC-UI-3.2, SPEC-NFR-10
 */

import type {ReactNode} from 'react'

import {testId} from '@/shared/testing/testId'

/** @spec SPEC-UI-3.2 - Props пустой сетки */
export interface EmptyNetStateProps {
  /** @spec SPEC-UI-3.2 */
  title?: string
  /** @spec SPEC-UI-3.2 */
  copy?: string
  /** @spec SPEC-UI-3.2 */
  action?: ReactNode
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-3.2 - Пустое состояние «пустая сетка»
 */
export function EmptyNetState({
  title = 'Пустая сетка',
  copy = 'Здесь пока ничего — время забросить первую шайбу.',
  action,
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: EmptyNetStateProps) {
  return (
    <div
      className="empty-net"
      role="status"
      data-testid={dataTestId ?? testId(testIdPrefix, 'empty-net', 'panel')}
    >
      <div
        className="empty-net__icon"
        aria-hidden
        data-testid={testId(testIdPrefix, 'empty-net', 'icon')}
      >
        🥅
      </div>
      <div
        className="empty-net__title"
        data-testid={testId(testIdPrefix, 'empty-net', 'text', 'title')}
      >
        {title}
      </div>
      <div
        className="empty-net__copy"
        data-testid={testId(testIdPrefix, 'empty-net', 'text', 'copy')}
      >
        {copy}
      </div>
      {action}
    </div>
  )
}
