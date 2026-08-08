/**
 * SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * HOCFRONT-28 / TASK-05-07, TASK-05-09, TASK-05-10 — форма создания/редактирования
 */

import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import {fetchArenas} from '@/entities/arena'
import {sendGoalieRequestsForEvent} from '@/entities/calendar'
import type {EventType, SkillLevel} from '@/entities/common'
import {createEvent, type CreateEventPayload, type GameEvent, updateEvent} from '@/entities/event'
import {fetchProfileSettings} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {useSessionAccess} from '@/features/access'
import {hasOrganizerPublishAccess} from '@/features/events/lib/organizerSubscription'
import {routes} from '@/shared/const/appRoutes'
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

function slotsFromEvent(event: GameEvent): string {
  const total = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  return String(total || 12)
}

export interface EventCreateFormProps {
  mode?: 'create' | 'edit'
  initialEvent?: GameEvent
  onSuccess?: (event: GameEvent) => void
}

/**
 * @spec SPEC-FR-4.1.1 - Форма создания/редактирования игры/тренировки
 * @spec TASK-05-07 - поля даты, доступа, мест
 * @spec TASK-05-09 - gate подписки для публичной тренировки
 */
export function EventCreateForm({mode = 'create', initialEvent, onSuccess}: EventCreateFormProps) {
  const queryClient = useQueryClient()
  const {session} = useSessionAccess()
  const isEdit = mode === 'edit' && Boolean(initialEvent)
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})
  const {data: settings} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  const [type, setType] = useState<EventType>(initialEvent?.type ?? 'training')
  const [title, setTitle] = useState(initialEvent?.title ?? '')
  const [startsLocal, setStartsLocal] = useState(() =>
    initialEvent ? toLocalInputValue(new Date(initialEvent.startsAt)) : defaultStart(),
  )
  const [arenaIdOverride, setArenaIdOverride] = useState<string | null>(
    initialEvent?.arenaId ?? null,
  )
  const resolvedArenaId = arenaIdOverride ?? arenas[0]?.id ?? ''
  const [teamId, setTeamId] = useState<string | undefined>(initialEvent?.teamId ?? teams[0]?.id)
  const [clubId, setClubId] = useState<string | undefined>(initialEvent?.clubId)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    initialEvent?.requiredSkillLevel ?? 'amateur',
  )
  const [pricePerPlayer, setPricePerPlayer] = useState(String(initialEvent?.pricePerPlayer ?? 1500))
  const [slotsTotal, setSlotsTotal] = useState(() =>
    initialEvent ? slotsFromEvent(initialEvent) : '12',
  )
  const [accessScope, setAccessScope] = useState<NonNullable<GameEvent['accessScope']>>(
    initialEvent?.accessScope === 'club_only'
      ? 'private_club'
      : (initialEvent?.accessScope ?? 'public_open'),
  )
  const [trainingFormat, setTrainingFormat] = useState<NonNullable<GameEvent['trainingFormat']>>(
    initialEvent?.trainingFormat ?? 'training',
  )
  const [goalieRequestSent, setGoalieRequestSent] = useState(false)
  const [pendingGoalieNotify, setPendingGoalieNotify] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(initialEvent?.id ?? null)
  const [gateError, setGateError] = useState<string | null>(null)
  const [goalieNotifyCount, setGoalieNotifyCount] = useState<number | null>(null)
  const [savedEventId, setSavedEventId] = useState<string | null>(null)

  const hasPaidSubscription = useMemo(
    () => hasOrganizerPublishAccess(settings?.subscription.planId),
    [settings?.subscription.planId],
  )

  const clubOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const membership of session?.user.partnerMemberships ?? []) {
      if (membership.kind === 'club') {
        map.set(membership.entityId, membership.entityName)
      }
    }
    for (const team of teams) {
      if (team.clubId && !map.has(team.clubId)) {
        map.set(team.clubId, `Клуб команды «${team.name}»`)
      }
    }
    if (!map.has('club-001')) {
      map.set('club-001', 'ХК Медведи')
    }
    return [...map.entries()].map(([value, content]) => ({value, content}))
  }, [session?.user.partnerMemberships, teams])

  const resolvedClubId = clubId ?? clubOptions[0]?.value

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
    mutationFn: async (payload: CreateEventPayload) => {
      if (isEdit && initialEvent) {
        return updateEvent(initialEvent.id, payload)
      }
      return createEvent(payload)
    },
    onSuccess: (event) => {
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['event', event.id]})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
      setGateError(null)
      setCreatedEventId(event.id)
      setSavedEventId(event.id)
      if (!isEdit) setTitle('')
      const shouldNotifyGoalies = pendingGoalieNotify && event.type === 'training'
      setPendingGoalieNotify(false)
      if (shouldNotifyGoalies) {
        goalieMutation.mutate(event.id)
      } else if (!isEdit) {
        setGoalieRequestSent(false)
        setGoalieNotifyCount(null)
      }
      onSuccess?.(event)
    },
  })

  function buildPayload(): CreateEventPayload | null {
    if (!title.trim() || !resolvedArenaId) return null
    if (type === 'training' && accessScope === 'private_club' && !resolvedClubId) {
      setGateError('Выберите клуб-организатор для тренировки «Только для клуба».')
      return null
    }

    if (type === 'training' && accessScope === 'public_open' && !hasPaidSubscription) {
      setGateError(
        'Публичная тренировка доступна только с активной подпиской. Оформите Player Plus / Team Pro или выберите «Только для клуба».',
      )
      return null
    }

    const startsAt = new Date(startsLocal)
    if (Number.isNaN(startsAt.getTime())) return null
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000)
    const total = Math.max(1, Number(slotsTotal) || 12)
    const goalieCount = Math.min(2, Math.max(1, Math.floor(total / 8)))
    const defenseCount = Math.floor((total - goalieCount) / 2)
    const forwardCount = total - goalieCount - defenseCount
    const isPrivate = accessScope === 'private_club' && type === 'training'

    return {
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
      pricePerPlayer: isPrivate ? 0 : Number(pricePerPlayer) || undefined,
      accessScope: type === 'training' ? accessScope : 'public',
      clubId: isPrivate ? resolvedClubId : undefined,
      trainingFormat: type === 'training' ? trainingFormat : undefined,
    }
  }

  function handleSubmit() {
    const payload = buildPayload()
    if (!payload) return
    mutation.mutate(payload)
  }

  const arenaOptions = arenas.map((a) => ({value: a.id, content: a.name}))
  const teamOptions = teams.map((t) => ({value: t.id, content: t.name}))

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('events', 'create-form', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('events', 'create-form', 'text', 'title')}>
        {isEdit ? 'Редактировать тренировку' : 'Создать игру или тренировку'}
      </Text>
      <TextInput
        label="Название"
        value={title}
        onUpdate={(value) => {
          setTitle(value)
          if (createdEventId && !isEdit) setCreatedEventId(null)
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
          if (createdEventId && !isEdit) setCreatedEventId(null)
        }}
        options={TYPE_OPTIONS}
        disabled={isEdit}
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
          onUpdate={(v) => {
            const nextTeamId = v[0] || undefined
            setTeamId(nextTeamId)
            const teamClubId = teams.find((team) => team.id === nextTeamId)?.clubId
            if (teamClubId) setClubId(teamClubId)
          }}
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
          {accessScope === 'private_club' && (
            <Select
              label="Клуб-организатор"
              value={resolvedClubId ? [resolvedClubId] : []}
              onUpdate={(v) => setClubId(v[0])}
              options={clubOptions}
              data-testid={testId('events', 'create-form', 'select', 'club')}
            />
          )}
        </>
      )}
      <TextInput
        label="Количество мест"
        value={slotsTotal}
        onUpdate={setSlotsTotal}
        data-testid={testId('events', 'create-form', 'field', 'slots')}
      />
      <TextInput
        label="Цена за игрока (₽)"
        value={accessScope === 'private_club' && type === 'training' ? '0' : pricePerPlayer}
        onUpdate={setPricePerPlayer}
        disabled={accessScope === 'private_club' && type === 'training'}
        data-testid={testId('events', 'create-form', 'field', 'price')}
      />
      {accessScope === 'private_club' && type === 'training' && (
        <Text
          color="secondary"
          data-testid={testId('events', 'create-form', 'text', 'private-hint')}
        >
          Тренировка с бейджем «Только для клуба»: видна членам клуба и штабу, не попадает в общий
          поиск, бесплатна по тарифу клуба.
        </Text>
      )}

      {type === 'training' && accessScope === 'public_open' && !hasPaidSubscription && (
        <Text color="warning" data-testid={testId('events', 'create-form', 'text', 'paywall')}>
          Публикация открытой тренировки доступна с подпиской Player Plus или Team Pro. Оформите
          тариф в профиле или выберите «Только для клуба».
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
          После сохранения тренировки уйдёт запрос вратарям по окнам доступности.
        </Text>
      )}

      {goalieRequestSent && (
        <Text color="positive" data-testid={testId('events', 'create-form', 'text', 'goalie-sent')}>
          Запрос вратарям отправлен
          {goalieNotifyCount != null ? `: ${goalieNotifyCount}` : ''}.
        </Text>
      )}

      {savedEventId && !isEdit && (
        <Text color="positive" data-testid={testId('events', 'create-form', 'text', 'created')}>
          Тренировка создана.{' '}
          <Link
            to={`/events/trainings/${savedEventId}`}
            data-testid={testId('events', 'create-form', 'link', 'created')}
          >
            Открыть
          </Link>
        </Text>
      )}

      <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
        <Button
          view="action"
          loading={mutation.isPending}
          onClick={handleSubmit}
          data-testid={testId('events', 'create-form', 'btn', 'submit')}
        >
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
        {type === 'training' && (
          <Button
            view="outlined"
            loading={goalieMutation.isPending}
            onClick={() => {
              if (createdEventId && (isEdit || title.trim())) {
                goalieMutation.mutate(createdEventId)
                return
              }
              if (isEdit) return
              setPendingGoalieNotify(true)
            }}
            data-testid={testId('events', 'create-form', 'btn', 'goalie-request')}
          >
            Отправить запрос вратарям
          </Button>
        )}
        {isEdit && initialEvent && (
          <Link
            to={`/events/trainings/${initialEvent.id}`}
            data-testid={testId('events', 'create-form', 'link', 'back-details')}
          >
            <Button
              view="flat"
              data-testid={testId('events', 'create-form', 'btn', 'back-details')}
            >
              К карточке
            </Button>
          </Link>
        )}
        {!isEdit && (
          <Link
            to={routes.profile}
            data-testid={testId('events', 'create-form', 'link', 'upgrade')}
          >
            <Button view="flat" data-testid={testId('events', 'create-form', 'btn', 'upgrade')}>
              Тарифы в профиле
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
