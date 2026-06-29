/**
 * SPEC-FR-14.1.4
 * SPEC-UI-6.4
 */

import {Text} from '@gravity-ui/uikit'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-14.1.4 - Явная маркировка mock-загрузки
 * @spec SPEC-UI-6.4 - Статус Phase 1 mock upload
 */
export function MockUploadNotice() {
  return (
    <div className="highlight-mock-notice" role="status" data-testid={testId('highlights', 'mock-notice', 'panel')}>
      <span className="highlight-mock-notice__badge" data-testid={testId('highlights', 'mock-notice', 'badge')}>
        Phase 1 mock upload
      </span>
      <Text color="secondary" data-testid={testId('highlights', 'mock-notice', 'text')}>
        Файл не загружается на сервер — только метаданные и разметка в mock-режиме.
      </Text>
    </div>
  )
}
