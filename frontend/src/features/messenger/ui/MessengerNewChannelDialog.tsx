/**
 * SPEC-FR-22.1.2 — создание канала или командного чата.
 */

import {Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {Chat} from '@/entities/messenger'
import {createChannelOrChat, searchChatUsers} from '@/entities/messenger'
import {parseApiErrorMessage} from '@/shared/api/parseApiError'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {HockeyFormDialog, HockeyFormSection} from '@/shared/ui/HockeyFormDialog'

import {MessengerMemberPicker} from './MessengerMemberPicker'

interface MessengerNewChannelDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (chat: Chat, statusMessage: string) => void
}

export function MessengerNewChannelDialog({
  open,
  onClose,
  onCreated,
}: MessengerNewChannelDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [isChannel, setIsChannel] = useState(true)
  const [restricted, setRestricted] = useState(false)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const {data: allUsers = []} = useQuery({
    queryKey: ['messenger-users', '__all__'],
    queryFn: () => searchChatUsers(''),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: createChannelOrChat,
    onSuccess: (chat) => {
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      reset()
      onCreated(chat, `${chat.type === 'channel' ? 'Канал' : 'Чат'} создан.`)
    },
  })

  function reset() {
    setTitle('')
    setTag('')
    setIsChannel(true)
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
      setValidationError('Укажи название канала или чата.')
      return
    }
    setValidationError(null)
    createMutation.mutate({
      type: isChannel ? 'channel' : 'team',
      title: trimmedTitle,
      tag: tag.trim() || undefined,
      restrictedUserIds: restricted ? memberIds : undefined,
    })
  }

  const errorCopy =
    validationError ??
    (createMutation.error != null
      ? parseApiErrorMessage(createMutation.error, 'Не удалось создать канал/чат')
      : null)

  return (
    <HockeyFormDialog
      open={open}
      onClose={handleClose}
      caption={isChannel ? 'Новый канал' : 'Новый командный чат'}
      description="Канал — для объявлений с ролями и темами, чат — для общения команды."
      data-testid={testId('messenger', 'new-channel-dialog', 'card')}
      footer={
        <>
          <HockeyButton
            view="outlined"
            disabled={createMutation.isPending}
            onClick={handleClose}
            data-testid={testId('messenger', 'new-channel-dialog', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            view="action"
            loading={createMutation.isPending}
            onClick={handleSubmit}
            data-testid={testId('messenger', 'page', 'btn', 'create-entity')}
          >
            Создать
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
            placeholder={isChannel ? 'Например, Анонсы лиги' : 'Например, Медведи САО'}
            aria-label="Название"
            data-testid={testId('messenger', 'page', 'field', 'entity-title')}
          />
        </div>
        <div className="hockey-stack hockey-stack--gap-4">
          <Text variant="caption-2" color="secondary">
            Тег
          </Text>
          <TextInput
            value={tag}
            onUpdate={setTag}
            placeholder="goalies"
            aria-label="Тег"
            data-testid={testId('messenger', 'page', 'field', 'entity-tag')}
          />
        </div>
      </HockeyFormSection>

      <HockeyFormSection title="Доступ" layout="stack">
        <label
          className="messenger-composer__switch"
          data-testid={testId('messenger', 'page', 'field', 'entity-kind')}
        >
          <span>Это канал с ролями и темами</span>
          <Switch
            checked={isChannel}
            onUpdate={setIsChannel}
            data-testid={testId('messenger', 'page', 'checkbox', 'entity-kind')}
          />
        </label>
        <label
          className="messenger-composer__switch"
          data-testid={testId('messenger', 'page', 'field', 'entity-restricted')}
        >
          <span data-testid={testId('messenger', 'page', 'text', 'entity-restricted-label')}>
            Только для особых участников
          </span>
          <Switch
            checked={restricted}
            onUpdate={(value) => {
              setRestricted(value)
              if (!value) setMemberIds([])
            }}
            data-testid={testId('messenger', 'page', 'checkbox', 'entity-restricted')}
          />
        </label>
        {restricted && (
          <MessengerMemberPicker
            users={allUsers}
            selectedIds={memberIds}
            testIdQualifier="entity-member"
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
          data-testid={testId('messenger', 'new-channel-dialog', 'error', 'create')}
        >
          {errorCopy}
        </Text>
      )}
    </HockeyFormDialog>
  )
}
