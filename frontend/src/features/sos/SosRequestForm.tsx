/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3
 * SPEC-UI-1.2
 */

import {Checkbox, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {PlayerPosition, SkillLevel} from '@/entities/common/types'
import {fetchEvents} from '@/features/events/api/eventsApi'
import {createRecruitmentRequest} from '@/features/sos/api/recruitmentApi'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const POSITION_OPTIONS = [
  {value: 'goalie', content: 'Вратарь'},
  {value: 'defense', content: 'Защитник'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'any', content: 'Любое'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
]

/**
 * @spec SPEC-UI-1.2 - SOS с красной лампой
 * @spec SPEC-FR-5.1.1 - Форма Goalkeeper SOS
 */
export function SosRequestForm() {
  const queryClient = useQueryClient()
  const {data: events = []} = useQuery({queryKey: ['events'], queryFn: fetchEvents})

  const [eventId, setEventId] = useState('')
  const resolvedEventId = eventId || events[0]?.id || ''
  const [requestedPosition, setRequestedPosition] = useState<PlayerPosition>('goalie')
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('amateur')
  const [isGoalkeeperSos, setIsGoalkeeperSos] = useState(true)
  const [district, setDistrict] = useState('САО')
  const [price, setPrice] = useState('0')
  const [comment, setComment] = useState('')

  const mutation = useMutation({
    mutationFn: createRecruitmentRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['recruitment-requests']})
      setComment('')
    },
  })

  const eventOptions = events.map((e) => ({value: e.id, content: e.title}))

  function handleSubmit() {
    if (!resolvedEventId) return
    mutation.mutate({
      eventId: resolvedEventId,
      requestedPosition,
      skillLevel,
      isGoalkeeperSos,
      district: district || undefined,
      price: Number(price) || undefined,
      comment: comment || undefined,
    })
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('sos', 'request-form', 'form')}
    >
      <Text variant="subheader-2" data-testid={testId('sos', 'request-form', 'text', 'title')}>
        Запустить добор / Goalkeeper SOS
      </Text>
      <Select
        label="Событие"
        value={resolvedEventId ? [resolvedEventId] : []}
        onUpdate={(v) => setEventId(v[0] ?? '')}
        options={eventOptions}
        data-testid={testId('sos', 'request-form', 'select', 'event')}
      />
      <Select
        label="Амплуа"
        value={[requestedPosition]}
        onUpdate={(v) => setRequestedPosition(v[0] as PlayerPosition)}
        options={POSITION_OPTIONS}
        data-testid={testId('sos', 'request-form', 'select', 'position')}
      />
      <Select
        label="Уровень"
        value={[skillLevel]}
        onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
        options={SKILL_OPTIONS}
        data-testid={testId('sos', 'request-form', 'select', 'skill')}
      />
      <TextInput
        label="Район"
        value={district}
        onUpdate={setDistrict}
        data-testid={testId('sos', 'request-form', 'field', 'district')}
      />
      <TextInput
        label="Цена участия (RUB)"
        value={price}
        onUpdate={setPrice}
        data-testid={testId('sos', 'request-form', 'field', 'price')}
      />
      <div data-testid={testId('sos', 'request-form', 'field', 'comment')}>
        <Text
          color="secondary"
          data-testid={testId('sos', 'request-form', 'text', 'comment-label')}
        >
          Комментарий
        </Text>
        <TextArea
          value={comment}
          onUpdate={setComment}
          minRows={2}
          data-testid={testId('sos', 'request-form', 'field', 'comment-input')}
        />
      </div>
      <Checkbox
        checked={isGoalkeeperSos}
        onUpdate={setIsGoalkeeperSos}
        content="Goalkeeper SOS"
        data-testid={testId('sos', 'request-form', 'checkbox', 'goalkeeper-sos')}
      />
      <HockeyButton
        variant="sos"
        loading={mutation.isPending}
        onClick={handleSubmit}
        data-testid={testId('sos', 'request-form', 'btn', 'submit')}
      >
        Опубликовать запрос
      </HockeyButton>
    </div>
  )
}
