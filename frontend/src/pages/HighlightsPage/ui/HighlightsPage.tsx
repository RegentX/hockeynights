/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 * SPEC-UI-6.3, SPEC-UI-6.4
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {Highlight} from '@/entities/highlight'
import {
  addHighlightAnnotation,
  addHighlightComment,
  createHighlight,
  fetchHighlight,
  fetchHighlights,
} from '@/entities/highlight'
import {useSessionAccess} from '@/features/access'
import {HighlightCard, HighlightUploadForm, HighlightVideoBoard} from '@/features/highlights'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryState} from '@/shared/ui/QueryState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/**
 * @spec SPEC-FR-14.1.1 - Страница Highlight Analysis
 * @spec SPEC-UI-6.3 - Video-board layout
 */
export function HighlightsPage() {
  const queryClient = useQueryClient()
  const {userId, session} = useSessionAccess()
  const authorDisplayName = session?.user.displayName ?? 'Игрок'
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data: highlights = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchHighlights,
  } = useQuery({
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
        authorUserId: userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['highlight', activeId]})
    },
  })

  const commentMutation = useMutation({
    mutationFn: (payload: {tag: 'tip' | 'mistake' | 'good_play'; text: string}) =>
      addHighlightComment(activeId!, {
        ...payload,
        authorUserId: userId,
        authorDisplayName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['highlight', activeId]})
    },
  })

  function selectHighlight(highlight: Highlight) {
    setSelectedId(highlight.id)
  }

  if (listLoading || listError) {
    return (
      <QueryState
        isLoading={listLoading}
        isError={listError}
        loadingLabel="Загружаем моменты…"
        errorTitle="Не удалось загрузить моменты"
        errorCopy="Проверь соединение и попробуй ещё раз."
        onRetry={() => void refetchHighlights()}
        testIdPrefix="highlights"
      />
    )
  }

  return (
    <div className="highlights-page" data-testid={testId('highlights', 'page', 'page')}>
      <PageHeader
        title="Highlight Analysis"
        subtitle="Разбор коротких моментов с игры — mock-загрузка, разметка и комментарии команды."
        testIdPrefix="highlights"
      />

      <div
        className="highlights-page__layout"
        data-testid={testId('highlights', 'page', 'panel', 'layout')}
      >
        <div
          className="highlights-page__catalog"
          data-testid={testId('highlights', 'page', 'panel', 'catalog')}
        >
          <div data-testid={testId('highlights', 'page', 'card', 'upload')}>
            <IceCard padding="m">
              <HighlightUploadForm
                onSubmit={(payload) => uploadMutation.mutate(payload)}
                isPending={uploadMutation.isPending}
              />
            </IceCard>
          </div>

          <div
            className="highlights-page__list"
            data-testid={testId('highlights', 'page', 'list', 'highlights')}
          >
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

        <div
          className="highlights-page__board"
          data-testid={testId('highlights', 'page', 'panel', 'board')}
        >
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
