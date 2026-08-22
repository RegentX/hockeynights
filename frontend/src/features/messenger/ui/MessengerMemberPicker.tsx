/**
 * SPEC-FR-22.1.1, SPEC-FR-22.1.2 — выбор участников для канала или темы.
 */

import {Text} from '@gravity-ui/uikit'

import type {ChatUser} from '@/entities/messenger'
import {testId} from '@/shared/testing/testId'

interface MessengerMemberPickerProps {
  users: ChatUser[]
  selectedIds: string[]
  onToggle: (userId: string) => void
  /** Квалификатор data-testid: `entity-member` / `topic-member`. */
  testIdQualifier: string
  emptyCopy?: string
}

export function MessengerMemberPicker({
  users,
  selectedIds,
  onToggle,
  testIdQualifier,
  emptyCopy = 'Участники не найдены',
}: MessengerMemberPickerProps) {
  if (users.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('messenger', 'page', 'empty', testIdQualifier)}>
        {emptyCopy}
      </Text>
    )
  }

  return (
    <div
      className="messenger-member-list"
      data-testid={testId('messenger', 'page', 'list', `${testIdQualifier}s`)}
    >
      {users.map((user) => {
        const selected = selectedIds.includes(user.userId)
        return (
          <button
            key={user.userId}
            type="button"
            className={`messenger-member-pill ${selected ? 'is-selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onToggle(user.userId)}
            data-testid={testId('messenger', 'page', 'item', testIdQualifier, user.userId)}
          >
            {user.displayName}
          </button>
        )
      })}
    </div>
  )
}
