/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 * SPEC-UI-6.3, SPEC-UI-6.4
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import type {Highlight} from '@/entities/highlight/types'
import {
  addHighlightAnnotation,
  addHighlightComment,
  createHighlight,
  fetchHighlight,
  fetchHighlights,
} from '@/features/highlights/api/highlightsApi'
import {HighlightCard} from '@/features/highlights/HighlightCard'
import {HighlightUploadForm} from '@/features/highlights/HighlightUploadForm'
import {HighlightVideoBoard} from '@/features/highlights/HighlightVideoBoard'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {testId} from '@/shared/testing/testId'

const MOCK_CURRENT_USER_ID = 'user-001'
const MOCK_CURRENT_USER_NAME = 'Иван Петров'

/**
 * @spec SPEC-FR-14.1.1 - Страница Highlight Analysis
 * @spec SPEC-UI-6.3 - Video-board layout
 */
export function HighlightsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {data: highlights = [], isLoading: listLoading} = useQuery({
    queryKey: ['highlights'],
    queryFn: fetchHighlights,
  })

  const activeId = selectedId ?? highlights[0]?.id ?? null

  const {data: detail, isLoading: detailLoading} = useQuery({
    queryKey: ['highlight', activeId],
    queryFn: () => fetchHighlight(activeId!),
    enabled: Boolean(activeId),
  })

  const uploadMutation = useMutation({
    mutationFn: createHighlight,
    onSuccess: (created) => {
      queryClient.invalidateQueries({queryKey: ['highlights']})
      setSelectedId(created.id)
    },
  })

  const annotationMutation = useMutation({
    mutationFn: (payload: {
      timestampMs: number
      type: 'arrow' | 'zone' | 'text'
      payload: Record<string, unknown>
    }) =>
      addHighlightAnnotation(activeId!, {
        ...payload,
        authorUserId: MOCK_CURRENT_USER_ID,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['highlight', activeId]})
    },
  })

  const commentMutation = useMutation({
    mutationFn: (payload: {tag: 'tip' | 'mistake' | 'good_play'; text: string}) =>
      addHighlightComment(activeId!, {
        ...payload,
        authorUserId: MOCK_CURRENT_USER_ID,
        authorDisplayName: MOCK_CURRENT_USER_NAME,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['highlight', activeId]})
    },
  })

  function selectHighlight(highlight: Highlight) {
    setSelectedId(highlight.id)
  }

  if (listLoading) {
    return (
      <div data-testid={testId('highlights', 'page', 'loader')}>
        <ScoreboardLoader label="Загружаем моменты…" />
      </div>
    )
  }

  return (
    <div className="highlights-page" data-testid={testId('highlights', 'page', 'page')}>
      <Text variant="header-1" data-testid={testId('highlights', 'page', 'text', 'title')}>
        Highlight Analysis
      </Text>
      <Text color="secondary" data-testid={testId('highlights', 'page', 'text', 'subtitle')}>
        Разбор коротких моментов с игры — mock-загрузка, разметка и комментарии команды.
      </Text>

      <div className="highlights-page__layout" data-testid={testId('highlights', 'page', 'panel', 'layout')}>
        <div className="highlights-page__catalog" data-testid={testId('highlights', 'page', 'panel', 'catalog')}>
          <div data-testid={testId('highlights', 'page', 'card', 'upload')}>
            <IceCard padding="m">
              <HighlightUploadForm
                onSubmit={(payload) => uploadMutation.mutate(payload)}
                isPending={uploadMutation.isPending}
              />
            </IceCard>
          </div>

          <div className="highlights-page__list" data-testid={testId('highlights', 'page', 'list', 'highlights')}>
            {highlights.length === 0 ? (
              <div data-testid={testId('highlights', 'page', 'empty', 'highlights')}>
                <EmptyNetState
                  title="Нет моментов"
                  copy="Загрузи первый mock-момент с тренировки или игры."
                />
              </div>
            ) : (
              highlights.map((item) => (
                <HighlightCard
                  key={item.id}
                  highlight={item}
                  selected={item.id === activeId}
                  onSelect={selectHighlight}
                />
              ))
            )}
          </div>
        </div>

        <div className="highlights-page__board" data-testid={testId('highlights', 'page', 'panel', 'board')}>
          {!activeId ? (
            <div data-testid={testId('highlights', 'page', 'empty', 'board')}>
              <EmptyNetState copy="Выбери момент из каталога слева." />
            </div>
          ) : detailLoading || !detail ? (
            <div data-testid={testId('highlights', 'page', 'loader', 'detail')}>
              <ScoreboardLoader label="Открываем разбор…" />
            </div>
          ) : (
            <div data-testid={testId('highlights', 'page', 'card', 'video-board', activeId)}>
              <IceCard padding="m">
                <HighlightVideoBoard
                  highlight={detail}
                  onAddAnnotation={(payload) => annotationMutation.mutate(payload)}
                  onAddComment={(payload) => commentMutation.mutate(payload)}
                  isAnnotationPending={annotationMutation.isPending}
                  isCommentPending={commentMutation.isPending}
                />
              </IceCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
