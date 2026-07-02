/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.4
 * SPEC-UI-6.4
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {CreateHighlightPayload} from '@/entities/highlight/types'
import {MockUploadNotice} from '@/features/highlights/MockUploadNotice'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const MOCK_CURRENT_USER_ID = 'user-001'

const EVENT_OPTIONS = [
  {value: 'event-001', content: 'Товарищеская игра — Медведи САО'},
  {value: 'event-002', content: 'Утренняя тренировка'},
]

/** @spec SPEC-FR-14.1.1 */
export interface HighlightUploadFormProps {
  onSubmit: (payload: CreateHighlightPayload) => void
  isPending?: boolean
}

/**
 * @spec SPEC-FR-14.1.1 - Mock-загрузка момента
 * @spec SPEC-FR-14.1.4 - Без реальной загрузки файла
 */
export function HighlightUploadForm({onSubmit, isPending = false}: HighlightUploadFormProps) {
  const [title, setTitle] = useState('')
  const [eventId, setEventId] = useState('event-001')

  function handleSubmit() {
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      eventId,
      teamId: 'team-001',
      authorUserId: MOCK_CURRENT_USER_ID,
      durationSeconds: 10,
    })
    setTitle('')
  }

  return (
    <div className="highlight-upload" data-testid={testId('highlights', 'upload-form', 'form')}>
      <Text
        variant="subheader-2"
        data-testid={testId('highlights', 'upload-form', 'text', 'title')}
      >
        Новый момент
      </Text>
      <MockUploadNotice />
      <div
        className="highlight-upload__fields"
        data-testid={testId('highlights', 'upload-form', 'panel', 'fields')}
      >
        <TextInput
          placeholder="Название момента"
          value={title}
          onUpdate={setTitle}
          size="m"
          data-testid={testId('highlights', 'upload-form', 'field', 'title')}
        />
        <Select
          value={[eventId]}
          onUpdate={(vals) => setEventId(vals[0])}
          options={EVENT_OPTIONS}
          size="m"
          data-testid={testId('highlights', 'upload-form', 'select', 'event')}
        />
        <HockeyButton
          size="m"
          onClick={handleSubmit}
          disabled={isPending || !title.trim()}
          data-testid={testId('highlights', 'upload-form', 'btn', 'submit')}
        >
          Mock-загрузка
        </HockeyButton>
      </div>
    </div>
  )
}
