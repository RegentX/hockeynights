/**
 * SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * HOCFRONT-28 / TASK-05-07, TASK-05-09, TASK-05-10 — форма создания тренировки/игры
 */

import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import {fetchArenas} from '@/entities/arena'
import {sendGoalieRequestsForEvent} from '@/entities/calendar'
import type {EventType, SkillLevel} from '@/entities/common'
import {createEvent, type GameEvent} from '@/entities/event'
import {fetchProfileSettings} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

const TYPE_OPTIONS = [
  {value: 'training', content: 'Тренировка'},
  {value: 'game', content: 'Игра'},
  {value: 'open_ice', content: 'Открытый лёд'},
]

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

const ACCESS_OPTIONS = [
  {value: 'public_open', content: 'Публичная открытая'},
  {value: 'private_club', content: 'Только для клуба'},
  {value: 'limited', content: 'По приглашению'},
]

const FORMAT_OPTIONS = [
  {value: 'training', content: 'Тренировка'},
  {value: 'two_way', content: 'Двухсторонка'},
  {value: 'training_two_way', content: 'Тренировка + двухсторонка'},
]

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultStart(): string {
  const d = new Date(Date.now() + 86400000)
  d.setMinutes(0, 0, 0)
  d.setHours(20)
  return toLocalInputValue(d)
}

/**
 * @spec SPEC-FR-4.1.1 - Форма создания игры/тренировки
 * @spec TASK-05-07 - поля даты, доступа, мест
 * @spec TASK-05-09 - gate подписки для public_open
 */
export function EventCreateForm() {
  const queryClient = useQueryClient()
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})
  const {data: settings} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  const [type, setType] = useState<EventType>('training')
  const [title, setTitle] = useState('')
  const [startsLocal, setStartsLocal] = useState(defaultStart)
  const [arenaIdOverride, setArenaIdOverride] = useState<string | null>(null)
  const resolvedArenaId = arenaIdOverride ?? arenas[0]?.id ?? ''
  const [teamId, setTeamId] = useState<string | undefined>(teams[0]?.id)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('amateur')
  const [pricePerPlayer, setPricePerPlayer] = useState('1500')
  const [slotsTotal, setSlotsTotal] = useState('12')
  const [accessScope, setAccessScope] =
    useState<NonNullable<GameEvent['accessScope']>>('public_open')
  const [trainingFormat, setTrainingFormat] =
    useState<NonNullable<GameEvent['trainingFormat']>>('training')
  const [goalieRequestSent, setGoalieRequestSent] = useState(false)
  const [pendingGoalieNotify, setPendingGoalieNotify] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [gateError, setGateError] = useState<string | null>(null)
  const [goalieNotifyCount, setGoalieNotifyCount] = useState<number | null>(null)

  const hasPaidSubscription = useMemo(() => {
    const plan = settings?.subscription.planId
    return plan === 'player_plus' || plan === 'team_pro'
  }, [settings?.subscription.planId])

  const goalieMutation = useMutation({
    mutationFn: sendGoalieRequestsForEvent,
    onSuccess: (result) => {
      setGoalieRequestSent(true)
      setGoalieNotifyCount(result.created)
      void queryClient.invalidateQueries({queryKey: ['goalie-requests']})
      void queryClient.invalidateQueries({queryKey: ['notifications']})
    },
  })

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
      setTitle('')
      setGateError(null)
      setCreatedEventId(event.id)
      const shouldNotifyGoalies = pendingGoalieNotify && event.type === 'training'
      setPendingGoalieNotify(false)
      if (shouldNotifyGoalies) {
        goalieMutation.mutate(event.id)
      } else {
        setGoalieRequestSent(false)
        setGoalieNotifyCount(null)
      }
    },
  })

  function handleSubmit() {
    if (!title.trim() || !resolvedArenaId) return

    if (type === 'training' && accessScope === 'public_open' && !hasPaidSubscription) {
      setGateError(
        'Публичная тренировка доступна только с активной подпиской. Оформите Player Plus / Team Pro или выберите «Только для клуба».',
      )
      return
    }

    const startsAt = new Date(startsLocal)
    if (Number.isNaN(startsAt.getTime())) return
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000)
    const total = Math.max(1, Number(slotsTotal) || 12)
    const goalieCount = Math.min(2, Math.max(1, Math.floor(total / 8)))
    const defenseCount = Math.floor((total - goalieCount) / 2)
    const forwardCount = total - goalieCount - defenseCount

    mutation.mutate({
      type,
      title: title.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      arenaId: resolvedArenaId,
      teamId,
      requiredSkillLevel: skillLevel,
      requiredSlots: [
        {position: 'goalie', count: goalieCount, filledCount: 0},
        {position: 'defense', count: defenseCount, filledCount: 0},
        {position: 'forward', count: forwardCount, filledCount: 0},
      ],
      pricePerPlayer:
        accessScope === 'private_club' && type === 'training'
          ? 0
          : Number(pricePerPlayer) || undefined,
      accessScope: type === 'training' ? accessScope : 'public',
      clubId: type === 'training' && accessScope === 'private_club' ? 'club-001' : undefined,
      trainingFormat: type === 'training' ? trainingFormat : undefined,
    })
  }

  const arenaOptions = arenas.map((a) => ({value: a.id, content: a.name}))
  const teamOptions = teams.map((t) => ({value: t.id, content: t.name}))

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('events', 'create-form', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('events', 'create-form', 'text', 'title')}>
        Создать игру или тренировку
      </Text>
      <TextInput
        label="Название"
        value={title}
        onUpdate={(value) => {
          setTitle(value)
          if (createdEventId) setCreatedEventId(null)
        }}
        data-testid={testId('events', 'create-form', 'field', 'title')}
      />
      <Select
        label="Тип"
        value={[type]}
        onUpdate={(v) => {
          const next = v[0] as EventType
          setType(next)
          if (next !== 'training') setPendingGoalieNotify(false)
          if (createdEventId) setCreatedEventId(null)
        }}
        options={TYPE_OPTIONS}
        data-testid={testId('events', 'create-form', 'select', 'type')}
      />
      <div className="hockey-stack hockey-stack--gap-4">
        <Text
          variant="body-2"
          data-testid={testId('events', 'create-form', 'text', 'starts-at-label')}
        >
          Дата и время старта
        </Text>
        <input
          type="datetime-local"
          className="g-text-input__control"
          value={startsLocal}
          onChange={(event) => setStartsLocal(event.target.value)}
          data-testid={testId('events', 'create-form', 'field', 'starts-at')}
        />
      </div>
      <Select
        label="Арена"
        value={resolvedArenaId ? [resolvedArenaId] : []}
        onUpdate={(v) => setArenaIdOverride(v[0])}
        options={arenaOptions}
        data-testid={testId('events', 'create-form', 'select', 'arena')}
      />
      {teamOptions.length > 0 && (
        <Select
          label="Команда"
          value={teamId ? [teamId] : []}
          onUpdate={(v) => setTeamId(v[0] || undefined)}
          options={teamOptions}
          data-testid={testId('events', 'create-form', 'select', 'team')}
        />
      )}
      <Select
        label="Уровень"
        value={[skillLevel]}
        onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
        options={SKILL_OPTIONS}
        data-testid={testId('events', 'create-form', 'select', 'skill')}
      />
      {type === 'training' && (
        <>
          <Select
            label="Формат"
            value={[trainingFormat]}
            onUpdate={(v) => setTrainingFormat(v[0] as NonNullable<GameEvent['trainingFormat']>)}
            options={FORMAT_OPTIONS}
            data-testid={testId('events', 'create-form', 'select', 'format')}
          />
          <Select
            label="Тип доступа"
            value={[accessScope]}
            onUpdate={(v) => {
              setAccessScope(v[0] as NonNullable<GameEvent['accessScope']>)
              setGateError(null)
            }}
            options={ACCESS_OPTIONS}
            data-testid={testId('events', 'create-form', 'select', 'access')}
          />
        </>
      )}
      <TextInput
        label="Количество мест"
        value={slotsTotal}
        onUpdate={setSlotsTotal}
        data-testid={testId('events', 'create-form', 'field', 'slots')}
      />
      <TextInput
        label="Цена за игрока (RUB)"
        value={accessScope === 'private_club' && type === 'training' ? '0' : pricePerPlayer}
        onUpdate={setPricePerPlayer}
        disabled={accessScope === 'private_club' && type === 'training'}
        data-testid={testId('events', 'create-form', 'field', 'price')}
      />

      {type === 'training' && accessScope === 'public_open' && !hasPaidSubscription && (
        <Text color="warning" data-testid={testId('events', 'create-form', 'text', 'paywall')}>
          Публикация `public_open` требует подписку (mock gate). Сейчас план:{' '}
          {settings?.subscription.planId ?? 'free'}.
        </Text>
      )}

      {gateError && (
        <Text color="danger" data-testid={testId('events', 'create-form', 'error', 'gate')}>
          {gateError}
        </Text>
      )}

      {pendingGoalieNotify && !goalieRequestSent && (
        <Text
          color="secondary"
          data-testid={testId('events', 'create-form', 'text', 'goalie-pending')}
        >
          После создания тренировки уйдёт запрос вратарям по окнам возможностей.
        </Text>
      )}

      {goalieRequestSent && (
        <Text color="positive" data-testid={testId('events', 'create-form', 'text', 'goalie-sent')}>
          Запрос вратарям отправлен
          {goalieNotifyCount != null ? `: ${goalieNotifyCount}` : ''} (mock).
        </Text>
      )}

      <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
        <Button
          view="action"
          loading={mutation.isPending}
          onClick={handleSubmit}
          data-testid={testId('events', 'create-form', 'btn', 'submit')}
        >
          Создать
        </Button>
        {type === 'training' && (
          <Button
            view="outlined"
            loading={goalieMutation.isPending}
            onClick={() => {
              // После create title очищается — старый createdEventId не трогаем.
              // Кнопка с непустым title + id = «дослать» на только что созданное.
              if (createdEventId && title.trim()) {
                goalieMutation.mutate(createdEventId)
                return
              }
              setCreatedEventId(null)
              setPendingGoalieNotify(true)
            }}
            data-testid={testId('events', 'create-form', 'btn', 'goalie-request')}
          >
            Отправить запрос вратарям
          </Button>
        )}
      </div>
    </div>
  )
}
