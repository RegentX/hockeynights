/**
 * SPEC-UI-8.1, SPEC-UI-8.2
 */

import {Text} from '@gravity-ui/uikit'

import type {ActionableMessageData, ChatAction, Message} from '@/entities/messenger/types'
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
        <div
          className="actionable-card__actions"
          data-testid={testId('messenger', 'chat-bubble', 'panel', 'actionable-actions', messageId)}
        >
          {data.actions.map((action: ChatAction) => (
            <HockeyButton
              key={action.id}
              size="s"
              view={action.style === 'primary' ? 'action' : 'normal'}
              onClick={() => console.log(`Action: ${action.action}`)}
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
      </IceCard>
    </div>
  )
}
