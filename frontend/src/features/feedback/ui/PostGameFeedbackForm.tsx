/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2
 */

import {Select, Text, TextArea} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {CreateFeedbackPayload} from '@/entities/feedback'
import {submitFeedback} from '@/entities/feedback'
import {fetchPlayers} from '@/entities/profile'
import {useSessionAccess} from '@/features/access'
import {useFeedbackEligibleEvents} from '@/features/feedback/lib/useFeedbackEligibility'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

const ATTENDANCE_OPTIONS = [
  {value: 'confirmed', content: 'Пришёл вовремя'},
  {value: 'late', content: 'Опоздал'},
  {value: 'no_show', content: 'Не пришёл'},
]

const SKILL_OPTIONS = [
  {value: 'too_low', content: 'Уровень ниже заявленного'},
  {value: 'matched', content: 'Уровень совпал'},
  {value: 'too_high', content: 'Уровень выше заявленного'},
]

const BEHAVIOR_OPTIONS = [
  {value: 'positive', content: 'Позитивное'},
  {value: 'neutral', content: 'Нейтральное'},
  {value: 'negative', content: 'Негативное'},
]

/**
 * @spec SPEC-FR-8.1.1 - Форма post-game feedback
 * @spec SPEC-FR-8.1.2 - Только для участников события
 */
export function PostGameFeedbackForm() {
  const queryClient = useQueryClient()
  const {userId} = useSessionAccess()
  const {data: events = []} = useFeedbackEligibleEvents()
  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const [eventId, setEventId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [attendanceRating, setAttendanceRating] =
    useState<CreateFeedbackPayload['attendanceRating']>('confirmed')
  const [skillMatchRating, setSkillMatchRating] =
    useState<CreateFeedbackPayload['skillMatchRating']>('matched')
  const [behaviorRating, setBehaviorRating] =
    useState<CreateFeedbackPayload['behaviorRating']>('positive')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      setError(null)
      setComment('')
      void queryClient.invalidateQueries({queryKey: ['players']})
      void queryClient.invalidateQueries({queryKey: ['profile']})
    },
    onError: (err: Error) => setError(err.message),
  })

  const selectedEvent = events.find((e) => e.id === eventId)
  const participantOptions = selectedEvent
    ? selectedEvent.participation
        .filter((p) => p.userId !== userId)
        .map((p) => ({value: p.userId, content: p.displayName}))
    : players.map((p) => ({value: p.userId, content: p.displayName}))

  function handleSubmit() {
    if (!eventId || !toUserId) {
      setError('Выберите событие и игрока')
      return
    }
    mutation.mutate({
      eventId,
      toUserId,
      attendanceRating,
      skillMatchRating,
      behaviorRating,
      comment: comment || undefined,
    })
  }

  if (events.length === 0) {
    return (
      <EmptyNetState
        title="Нет событий для feedback"
        copy="Feedback доступен только после участия в событии со статусом «иду»."
        testIdPrefix="feedback"
        data-testid={testId('feedback', 'form', 'empty')}
      />
    )
  }

  return (
    <IceCard
      padding="m"
      className="hockey-form-shell hockey-form-shell--560"
      data-testid={testId('feedback', 'form', 'form')}
    >
      <div className="hockey-stack hockey-stack--gap-12">
        <Text variant="subheader-2" data-testid={testId('feedback', 'form', 'text', 'title')}>
          Post-game feedback
        </Text>

        <Select
          label="Событие"
          value={[eventId]}
          onUpdate={(v) => setEventId(v[0] ?? '')}
          options={events.map((e) => ({value: e.id, content: e.title}))}
          data-testid={testId('feedback', 'form', 'select', 'event')}
        />
        <Select
          label="Игрок"
          value={[toUserId]}
          onUpdate={(v) => setToUserId(v[0] ?? '')}
          options={participantOptions}
          data-testid={testId('feedback', 'form', 'select', 'player')}
        />
        <Select
          label="Явка"
          value={[attendanceRating]}
          onUpdate={(v) => setAttendanceRating(v[0] as CreateFeedbackPayload['attendanceRating'])}
          options={ATTENDANCE_OPTIONS}
          data-testid={testId('feedback', 'form', 'select', 'attendance')}
        />
        <Select
          label="Уровень"
          value={[skillMatchRating]}
          onUpdate={(v) => setSkillMatchRating(v[0] as CreateFeedbackPayload['skillMatchRating'])}
          options={SKILL_OPTIONS}
          data-testid={testId('feedback', 'form', 'select', 'skill')}
        />
        <Select
          label="Поведение"
          value={[behaviorRating]}
          onUpdate={(v) => setBehaviorRating(v[0] as CreateFeedbackPayload['behaviorRating'])}
          options={BEHAVIOR_OPTIONS}
          data-testid={testId('feedback', 'form', 'select', 'behavior')}
        />
        <div data-testid={testId('feedback', 'form', 'field', 'comment')}>
          <Text color="secondary" data-testid={testId('feedback', 'form', 'text', 'comment-label')}>
            Комментарий
          </Text>
          <TextArea
            value={comment}
            onUpdate={setComment}
            minRows={3}
            data-testid={testId('feedback', 'form', 'field', 'comment-input')}
          />
        </div>

        {error && (
          <Text color="danger" data-testid={testId('feedback', 'form', 'text', 'error')}>
            {error}
          </Text>
        )}
        {mutation.isSuccess && (
          <Text color="positive" data-testid={testId('feedback', 'form', 'text', 'success')}>
            Feedback отправлен
          </Text>
        )}

        <HockeyButton
          loading={mutation.isPending}
          onClick={handleSubmit}
          data-testid={testId('feedback', 'form', 'btn', 'submit')}
        >
          Отправить feedback
        </HockeyButton>
      </div>
    </IceCard>
  )
}
