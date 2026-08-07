/**
 * SPEC-UI-8.1, SPEC-UI-8.2
 * HOCFRONT-25 — accept/decline training appointments with reason
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {ActionableMessageData, ChatAction, Message} from '@/entities/messenger'
import {resolveMessageAction} from '@/entities/messenger'
import {useSessionAccess} from '@/features/access'
import {DeclineReasonField} from '@/features/radar'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

interface ChatBubbleProps {
  message: Message
  isOwn?: boolean
}

/**
 * @spec SPEC-UI-8.1 - Glassmorphism бабблы сообщений
 */
export function ChatBubble({message, isOwn}: ChatBubbleProps) {
  return (
    <div
      className={`chat-bubble-container ${isOwn ? 'chat-bubble-container--own' : ''}`}
      data-testid={testId('messenger', 'chat-bubble', 'bubble', message.id)}
    >
      {!isOwn && (
        <Text
          variant="caption-1"
          className="chat-bubble-sender"
          data-testid={testId('messenger', 'chat-bubble', 'text', 'sender', message.id)}
        >
          {message.senderName}
        </Text>
      )}
      <div
        className={`chat-bubble ${isOwn ? 'chat-bubble--own' : ''}`}
        data-testid={testId('messenger', 'chat-bubble', 'panel', 'content', message.id)}
      >
        {message.type === 'actionable' && message.actionData ? (
          <ActionableMessage data={message.actionData} messageId={message.id} />
        ) : (
          <Text
            variant="body-1"
            data-testid={testId('messenger', 'chat-bubble', 'text', 'content', message.id)}
          >
            {message.content}
          </Text>
        )}
        <div
          className="chat-bubble-meta"
          data-testid={testId('messenger', 'chat-bubble', 'panel', 'meta', message.id)}
        >
          <Text
            variant="caption-1"
            className="chat-bubble-time"
            data-testid={testId('messenger', 'chat-bubble', 'text', 'time', message.id)}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwn && (
            <span
              className="chat-bubble-status"
              aria-hidden
              data-testid={testId('messenger', 'chat-bubble', 'badge', 'status', message.id)}
            >
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * @spec SPEC-UI-8.2 - Actionable Messages (интерактивные карточки)
 */
function ActionableMessage({data, messageId}: {data: ActionableMessageData; messageId: string}) {
  const queryClient = useQueryClient()
  const {userId} = useSessionAccess()
  const [showDecline, setShowDecline] = useState(false)
  const isTargetUser =
    data.type !== 'training_appointment' || !data.targetUserId || data.targetUserId === userId
  const canAct = data.status === 'pending' && data.actions.length > 0 && isTargetUser

  const mutation = useMutation({
    mutationFn: (payload: {action: string; declineReason?: string}) =>
      resolveMessageAction(messageId, payload),
    onSuccess: () => {
      setShowDecline(false)
      void queryClient.invalidateQueries({queryKey: ['messenger-messages']})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      void queryClient.invalidateQueries({queryKey: ['event-rsvp', data.eventId]})
    },
  })

  function handleAction(action: ChatAction) {
    if (!isTargetUser) return
    if (data.type === 'training_appointment' && action.action === 'decline') {
      setShowDecline(true)
      return
    }
    if (data.type === 'training_appointment' && action.action === 'accept') {
      mutation.mutate({action: 'accept'})
      return
    }
    mutation.mutate({action: action.action})
  }

  return (
    <div data-testid={testId('messenger', 'chat-bubble', 'card', 'actionable', messageId)}>
      <IceCard padding="s" className="actionable-card">
        <div
          className="actionable-card__header"
          data-testid={testId('messenger', 'chat-bubble', 'panel', 'actionable-header', messageId)}
        >
          <Text
            variant="subheader-1"
            color="primary"
            data-testid={testId('messenger', 'chat-bubble', 'text', 'actionable-title', messageId)}
          >
            {data.title}
          </Text>
          {data.positionLabel && (
            <Text
              color="secondary"
              data-testid={testId('messenger', 'chat-bubble', 'text', 'position', messageId)}
            >
              Позиция: {data.positionLabel}
            </Text>
          )}
        </div>
        <div
          className="actionable-card__body"
          data-testid={testId('messenger', 'chat-bubble', 'panel', 'actionable-body', messageId)}
        >
          <Text
            variant="body-1"
            data-testid={testId(
              'messenger',
              'chat-bubble',
              'text',
              'actionable-description',
              messageId,
            )}
          >
            {data.description}
          </Text>
        </div>
        {showDecline && canAct ? (
          <DeclineReasonField
            isPending={mutation.isPending}
            onCancel={() => setShowDecline(false)}
            onConfirm={(reason) => mutation.mutate({action: 'decline', declineReason: reason})}
          />
        ) : (
          canAct && (
            <div
              className="actionable-card__actions"
              data-testid={testId(
                'messenger',
                'chat-bubble',
                'panel',
                'actionable-actions',
                messageId,
              )}
            >
              {data.actions.map((action: ChatAction) => (
                <HockeyButton
                  key={action.id}
                  size="s"
                  view={action.style === 'primary' ? 'action' : 'normal'}
                  loading={mutation.isPending}
                  onClick={() => handleAction(action)}
                  data-testid={testId(
                    'messenger',
                    'chat-bubble',
                    'btn',
                    'action',
                    messageId,
                    action.id,
                  )}
                >
                  {action.label}
                </HockeyButton>
              ))}
            </div>
          )
        )}
        {data.type === 'training_appointment' &&
          data.status === 'pending' &&
          data.targetUserId &&
          data.targetUserId !== userId && (
            <Text
              color="secondary"
              data-testid={testId('messenger', 'chat-bubble', 'text', 'not-target', messageId)}
            >
              Назначение для другого игрока
            </Text>
          )}
        {mutation.isError && (
          <Text
            color="danger"
            data-testid={testId('messenger', 'chat-bubble', 'error', 'action', messageId)}
          >
            Не удалось выполнить действие. Попробуйте ещё раз.
          </Text>
        )}
      </IceCard>
    </div>
  )
}
