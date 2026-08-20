/**
 * SPEC-FR-22.1.1 — создание темы внутри чата или канала.
 */

import {Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {Chat, ChatTopic, ChatUser} from '@/entities/messenger'
import {createChatTopic, searchChatUsers} from '@/entities/messenger'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyFormDialog, HockeyFormSection} from '@/shared/ui/HockeyFormDialog'

import {MessengerMemberPicker} from './MessengerMemberPicker'

interface MessengerNewTopicDialogProps {
  open: boolean
  onClose: () => void
  chat: Chat
  onCreated: (topic: ChatTopic, statusMessage: string) => void
}

export function MessengerNewTopicDialog({
  open,
  onClose,
  chat,
  onCreated,
}: MessengerNewTopicDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [restricted, setRestricted] = useState(false)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const {data: allUsers = []} = useQuery({
    queryKey: ['messenger-users', '__all__'],
    queryFn: () => searchChatUsers(''),
    enabled: open,
  })

  /** Ограничить тему можно только участниками самого чата. */
  const availableMembers = useMemo<ChatUser[]>(
    () =>
      chat.memberIds?.length
        ? allUsers.filter((user) => chat.memberIds?.includes(user.userId))
        : allUsers,
    [allUsers, chat.memberIds],
  )

  const createMutation = useMutation({
    mutationFn: (payload: {title: string; tag?: string; restrictedUserIds?: string[]}) =>
      createChatTopic(chat.id, payload),
    onSuccess: (topic) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-topics', chat.id]})
      reset()
      onCreated(topic, 'Тема создана.')
    },
  })

  function reset() {
    setTitle('')
    setTag('')
    setRestricted(false)
    setMemberIds([])
    setValidationError(null)
    createMutation.reset()
  }

  function handleClose() {
    if (createMutation.isPending) return
    reset()
    onClose()
  }

  function handleSubmit() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setValidationError('Укажи название темы.')
      return
    }
    setValidationError(null)
    createMutation.mutate({
      title: trimmedTitle,
      tag: tag.trim() || undefined,
      restrictedUserIds: restricted ? memberIds : undefined,
    })
  }

  const errorCopy =
    validationError ??
    (createMutation.error != null
      ? parseApiErrorMessage(createMutation.error, 'Не удалось создать тему')
      : null)

  return (
    <HockeyFormDialog
      open={open}
      onClose={handleClose}
      caption="Новая тема"
      description={chat.title}
      maxWidth="m"
      data-testid={testId('messenger', 'new-topic-dialog', 'card')}
      footer={
        <>
          <HockeyButton
            view="outlined"
            disabled={createMutation.isPending}
            onClick={handleClose}
            data-testid={testId('messenger', 'new-topic-dialog', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            view="action"
            loading={createMutation.isPending}
            onClick={handleSubmit}
            data-testid={testId('messenger', 'page', 'btn', 'create-topic')}
          >
            Создать тему
          </HockeyButton>
        </>
      }
    >
      <HockeyFormSection title="Основное">
        <div className="hockey-stack hockey-stack--gap-4">
          <Text variant="caption-2" color="secondary">
            Название
          </Text>
          <TextInput
            value={title}
            onUpdate={setTitle}
            placeholder="Например, Состав"
            aria-label="Название темы"
            data-testid={testId('messenger', 'page', 'field', 'topic-title')}
          />
        </div>
        <div className="hockey-stack hockey-stack--gap-4">
          <Text variant="caption-2" color="secondary">
            Тег
          </Text>
          <TextInput
            value={tag}
            onUpdate={setTag}
            placeholder="roster"
            aria-label="Тег темы"
            data-testid={testId('messenger', 'page', 'field', 'topic-tag')}
          />
        </div>
      </HockeyFormSection>

      <HockeyFormSection title="Доступ" layout="stack">
        <label
          className="messenger-composer__switch"
          data-testid={testId('messenger', 'page', 'field', 'topic-restricted')}
        >
          <span data-testid={testId('messenger', 'page', 'text', 'topic-restricted-label')}>
            Ограничить доступ к теме
          </span>
          <Switch
            checked={restricted}
            onUpdate={(value) => {
              setRestricted(value)
              if (!value) setMemberIds([])
            }}
            data-testid={testId('messenger', 'page', 'checkbox', 'topic-restricted')}
          />
        </label>
        {restricted && (
          <MessengerMemberPicker
            users={availableMembers}
            selectedIds={memberIds}
            testIdQualifier="topic-member"
            emptyCopy="В чате нет участников для ограничения."
            onToggle={(userId) =>
              setMemberIds((prev) =>
                prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
              )
            }
          />
        )}
      </HockeyFormSection>

      {errorCopy && (
        <Text
          color="danger"
          data-testid={testId('messenger', 'new-topic-dialog', 'error', 'create')}
        >
          {errorCopy}
        </Text>
      )}
    </HockeyFormDialog>
  )
}
