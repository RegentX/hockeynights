/**
 * SPEC-UI-2 — единый заголовок страницы каталога/кабинета
 */

import {Text} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'

import {testId} from '@/shared/testing/testId'

export interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  /** Первый сегмент data-testid, напр. `notifications` */
  testIdPrefix: string
  /** Второй сегмент data-testid, по умолчанию `page` */
  testIdSection?: string
  'data-testid'?: string
}

/**
 * Стандартный page header: header-1 + optional subtitle + actions.
 * Spacing: stack gap-8 внутри, страница оборачивает в gap-20.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  testIdPrefix,
  testIdSection = 'page',
  'data-testid': dataTestId,
}: PageHeaderProps) {
  return (
    <div
      className="hockey-row hockey-row--between page-header"
      data-testid={dataTestId ?? testId(testIdPrefix, testIdSection, 'header')}
    >
      <div className="hockey-stack hockey-stack--gap-8 page-header__copy">
        <Text
          variant="header-1"
          className="variable-font-header page-header__title"
          data-testid={testId(testIdPrefix, testIdSection, 'text', 'title')}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            color="secondary"
            data-testid={testId(testIdPrefix, testIdSection, 'text', 'subtitle')}
          >
            {subtitle}
          </Text>
        ) : null}
      </div>
      {actions}
    </div>
  )
}
