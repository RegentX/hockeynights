/**
 * SPEC-FR-14.1.3
 * SPEC-UI-6.3
 */

import {Select, Text, TextArea} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {HighlightComment, HighlightCommentTag} from '@/entities/highlight/types'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const TAG_OPTIONS = [
  {value: 'tip', content: 'Совет'},
  {value: 'mistake', content: 'Ошибка'},
  {value: 'good_play', content: 'Удачный ход'},
]

const TAG_LABELS: Record<HighlightCommentTag, string> = {
  tip: 'Совет',
  mistake: 'Ошибка',
  good_play: 'Удачный ход',
}

/** @spec SPEC-FR-14.1.3 - Props комментариев */
export interface HighlightCommentsProps {
  comments: HighlightComment[]
  onAddComment: (payload: {tag: HighlightCommentTag; text: string}) => void
  isPending?: boolean
  highlightId: string
}

/**
 * @spec SPEC-FR-14.1.3 - Комментарии капитана/тренера
 * @spec SPEC-UI-6.3 - Список комментариев справа на desktop
 */
export function HighlightComments({
  comments,
  onAddComment,
  isPending = false,
  highlightId,
}: HighlightCommentsProps) {
  const [tag, setTag] = useState<HighlightCommentTag>('tip')
  const [text, setText] = useState('')

  function submitComment() {
    if (!text.trim()) return
    onAddComment({tag, text: text.trim()})
    setText('')
  }

  return (
    <div
      className="highlight-comments"
      data-testid={testId('highlights', 'comments', 'panel', highlightId)}
    >
      <Text
        variant="subheader-2"
        data-testid={testId('highlights', 'comments', 'text', 'title', highlightId)}
      >
        Разбор команды
      </Text>

      <div
        className="highlight-comments__list"
        data-testid={testId('highlights', 'comments', 'list', highlightId)}
      >
        {comments.length === 0 ? (
          <Text
            color="secondary"
            data-testid={testId('highlights', 'comments', 'empty', highlightId)}
          >
            Комментариев пока нет
          </Text>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="highlight-comments__item"
              data-testid={testId('highlights', 'comments', 'comment', comment.id)}
            >
              <div
                className="highlight-comments__meta"
                data-testid={testId('highlights', 'comments', 'panel', 'meta', comment.id)}
              >
                <Text data-testid={testId('highlights', 'comments', 'text', 'author', comment.id)}>
                  {comment.authorDisplayName}
                </Text>
                <span
                  className={`highlight-comments__tag highlight-comments__tag--${comment.tag}`}
                  data-testid={testId('highlights', 'comments', 'badge', 'tag', comment.id)}
                >
                  {TAG_LABELS[comment.tag]}
                </span>
              </div>
              <Text data-testid={testId('highlights', 'comments', 'text', 'body', comment.id)}>
                {comment.text}
              </Text>
              <Text
                color="secondary"
                className="highlight-comments__time"
                data-testid={testId('highlights', 'comments', 'text', 'time', comment.id)}
              >
                {new Date(comment.createdAt).toLocaleString('ru-RU')}
              </Text>
            </article>
          ))
        )}
      </div>

      <div
        className="highlight-comments__form"
        data-testid={testId('highlights', 'comments', 'form', highlightId)}
      >
        <Select
          value={[tag]}
          onUpdate={(vals) => setTag(vals[0] as HighlightCommentTag)}
          options={TAG_OPTIONS}
          size="m"
          data-testid={testId('highlights', 'comments', 'select', 'tag', highlightId)}
        />
        <TextArea
          placeholder="Комментарий капитана или тренера"
          value={text}
          onUpdate={setText}
          minRows={3}
          data-testid={testId('highlights', 'comments', 'field', 'text', highlightId)}
        />
        <HockeyButton
          size="m"
          onClick={submitComment}
          disabled={isPending || !text.trim()}
          data-testid={testId('highlights', 'comments', 'btn', 'submit', highlightId)}
        >
          Оставить комментарий
        </HockeyButton>
      </div>
    </div>
  )
}
