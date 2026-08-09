/**
 * SPEC-FR-4.1.1, SPEC-FR-4.1.2
 * HOCFRONT-28G / ORG-4 — пошаговое создание: draft, paywall, private_club, goalie
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useSearchParams} from 'react-router'

import {fetchArenas} from '@/entities/arena'
import {sendGoalieRequestsForEvent} from '@/entities/calendar'
import type {EventType, SkillLevel} from '@/entities/common'
import {createEvent, type GameEvent} from '@/entities/event'
import {fetchProfileSettings} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

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
  {value: 'public_open', content: 'Открытая для всех'},
  {value: 'private_club', content: 'Только для клуба'},
  {value: 'limited', content: 'По приглашению'},
]

const FORMAT_OPTIONS = [
  {value: 'training', content: 'Тренировка'},
  {value: 'two_way', content: 'Двухсторонка'},
  {value: 'training_two_way', content: 'Тренировка + двухсторонка'},
]

type WizardStep = 'basics' | 'place' | 'format' | 'access' | 'publish'

const STEPS: {id: WizardStep; label: string}[] = [
  {id: 'basics', label: 'Основное'},
  {id: 'place', label: 'Место'},
  {id: 'format', label: 'Формат'},
  {id: 'access', label: 'Доступ'},
  {id: 'publish', label: 'Публикация'},
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

function initialAccessFromSearch(raw: string | null): NonNullable<GameEvent['accessScope']> {
  if (raw === 'private_club' || raw === 'limited' || raw === 'public_open') return raw
  return 'public_open'
}

/**
 * @spec SPEC-FR-4.1.1 - Форма создания игры/тренировки
 * @spec TASK-05-07 / 05-09 / 05-10 / HOCFRONT-28G
 */
export function EventCreateForm() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})
  const {data: settings} = useQuery({
    queryKey: ['profile-settings'],
    queryFn: fetchProfileSettings,
  })

  const [step, setStep] = useState<WizardStep>('basics')
  const [type, setType] = useState<EventType>('training')
  const [title, setTitle] = useState('')
  const [startsLocal, setStartsLocal] = useState(defaultStart)
  const [arenaIdOverride, setArenaIdOverride] = useState<string | null>(null)
  const resolvedArenaId = arenaIdOverride ?? arenas[0]?.id ?? ''
  const [teamId, setTeamId] = useState<string | undefined>(teams[0]?.id)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('amateur')
  const [pricePerPlayer, setPricePerPlayer] = useState('1500')
  const [slotsTotal, setSlotsTotal] = useState('12')
  const [accessScope, setAccessScope] = useState<NonNullable<GameEvent['accessScope']>>(() =>
    initialAccessFromSearch(searchParams.get('access')),
  )
  const [trainingFormat, setTrainingFormat] =
    useState<NonNullable<GameEvent['trainingFormat']>>('training')
  const [goalieRequestSent, setGoalieRequestSent] = useState(false)
  const [pendingGoalieNotify, setPendingGoalieNotify] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [createdAccessScope, setCreatedAccessScope] = useState<GameEvent['accessScope']>()
  const [createdLifecycle, setCreatedLifecycle] = useState<GameEvent['lifecycleStatus']>()
  const [gateError, setGateError] = useState<string | null>(null)
  const [goalieNotifyCount, setGoalieNotifyCount] = useState<number | null>(null)

  const hasPaidSubscription = useMemo(() => {
    const plan = settings?.subscription.planId
    return plan === 'player_plus' || plan === 'team_pro'
  }, [settings?.subscription.planId])

  const stepIndex = STEPS.findIndex((item) => item.id === step)

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
      setGateError(null)
      setCreatedEventId(event.id)
      setCreatedAccessScope(event.accessScope)
      setCreatedLifecycle(event.lifecycleStatus)
      setTitle('')
      setStep('publish')
      const shouldNotifyGoalies =
        pendingGoalieNotify && event.type === 'training' && event.lifecycleStatus !== 'draft'
      setPendingGoalieNotify(false)
      if (shouldNotifyGoalies) {
        goalieMutation.mutate(event.id)
      } else {
        setGoalieRequestSent(false)
        setGoalieNotifyCount(null)
      }
    },
  })

  function buildPayload(lifecycleStatus: NonNullable<GameEvent['lifecycleStatus']>) {
    const startsAt = new Date(startsLocal)
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000)
    const total = Math.max(1, Number(slotsTotal) || 12)
    const goalieCount = Math.min(2, Math.max(1, Math.floor(total / 8)))
    const defenseCount = Math.floor((total - goalieCount) / 2)
    const forwardCount = total - goalieCount - defenseCount

    return {
      type,
      title: title.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      arenaId: resolvedArenaId,
      teamId,
      requiredSkillLevel: skillLevel,
      requiredSlots: [
        {position: 'goalie' as const, count: goalieCount, filledCount: 0},
        {position: 'defense' as const, count: defenseCount, filledCount: 0},
        {position: 'forward' as const, count: forwardCount, filledCount: 0},
      ],
      pricePerPlayer:
        accessScope === 'private_club' && type === 'training'
          ? 0
          : Number(pricePerPlayer) || undefined,
      accessScope: type === 'training' ? accessScope : ('public' as const),
      clubId: type === 'training' && accessScope === 'private_club' ? 'club-001' : undefined,
      trainingFormat: type === 'training' ? trainingFormat : undefined,
      lifecycleStatus,
    }
  }

  function canProceedFrom(current: WizardStep): boolean {
    if (current === 'basics') {
      return Boolean(title.trim()) && !Number.isNaN(new Date(startsLocal).getTime())
    }
    if (current === 'place') return Boolean(resolvedArenaId)
    return true
  }

  function goNext() {
    if (!canProceedFrom(step)) return
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next.id)
  }

  function goBack() {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev.id)
  }

  function handlePublish() {
    if (!title.trim() || !resolvedArenaId) {
      setStep('basics')
      return
    }
    if (Number.isNaN(new Date(startsLocal).getTime())) {
      setStep('basics')
      return
    }

    if (type === 'training' && accessScope === 'public_open' && !hasPaidSubscription) {
      setGateError(
        'Открытая публикация для всех пока недоступна на текущем тарифе. Сохраните черновик или выберите «Только для клуба».',
      )
      setStep('publish')
      return
    }

    setGateError(null)
    mutation.mutate(buildPayload('published'))
  }

  function handleSaveDraft() {
    if (!title.trim() || !resolvedArenaId) {
      setStep('basics')
      return
    }
    if (Number.isNaN(new Date(startsLocal).getTime())) {
      setStep('basics')
      return
    }
    setGateError(null)
    mutation.mutate(buildPayload('draft'))
  }

  const arenaOptions = arenas.map((a) => ({value: a.id, content: a.name}))
  const teamOptions = teams.map((t) => ({value: t.id, content: t.name}))
  const isPrivateClub = type === 'training' && accessScope === 'private_club'
  const showPaywallHint =
    type === 'training' && accessScope === 'public_open' && !hasPaidSubscription

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('events', 'create-form', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('events', 'create-form', 'text', 'title')}>
        Создание: шаг {stepIndex + 1} из {STEPS.length} — {STEPS[stepIndex]?.label}
      </Text>

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('events', 'create-form', 'panel', 'steps')}
      >
        {STEPS.map((item, index) => (
          <HockeyButton
            key={item.id}
            view={step === item.id ? 'action' : 'outlined'}
            size="s"
            onClick={() => {
              if (index <= stepIndex || canProceedFrom(step)) setStep(item.id)
            }}
            data-testid={testId('events', 'create-form', 'btn', 'step', item.id)}
          >
            {index + 1}. {item.label}
          </HockeyButton>
        ))}
      </div>

      {step === 'basics' ? (
        <>
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
        </>
      ) : null}

      {step === 'place' ? (
        <>
          <Select
            label="Арена"
            value={resolvedArenaId ? [resolvedArenaId] : []}
            onUpdate={(v) => setArenaIdOverride(v[0])}
            options={arenaOptions}
            data-testid={testId('events', 'create-form', 'select', 'arena')}
          />
          {teamOptions.length > 0 ? (
            <Select
              label="Команда"
              value={teamId ? [teamId] : []}
              onUpdate={(v) => setTeamId(v[0] || undefined)}
              options={teamOptions}
              data-testid={testId('events', 'create-form', 'select', 'team')}
            />
          ) : null}
        </>
      ) : null}

      {step === 'format' ? (
        <>
          <Select
            label="Уровень"
            value={[skillLevel]}
            onUpdate={(v) => setSkillLevel(v[0] as SkillLevel)}
            options={SKILL_OPTIONS}
            data-testid={testId('events', 'create-form', 'select', 'skill')}
          />
          {type === 'training' ? (
            <Select
              label="Формат"
              value={[trainingFormat]}
              onUpdate={(v) => setTrainingFormat(v[0] as NonNullable<GameEvent['trainingFormat']>)}
              options={FORMAT_OPTIONS}
              data-testid={testId('events', 'create-form', 'select', 'format')}
            />
          ) : null}
          <TextInput
            label="Количество мест"
            value={slotsTotal}
            onUpdate={setSlotsTotal}
            data-testid={testId('events', 'create-form', 'field', 'slots')}
          />
        </>
      ) : null}

      {step === 'access' ? (
        <>
          {type === 'training' ? (
            <Select
              label="Кто увидит тренировку"
              value={[accessScope]}
              onUpdate={(v) => {
                setAccessScope(v[0] as NonNullable<GameEvent['accessScope']>)
                setGateError(null)
              }}
              options={ACCESS_OPTIONS}
              data-testid={testId('events', 'create-form', 'select', 'access')}
            />
          ) : (
            <Text
              color="secondary"
              data-testid={testId('events', 'create-form', 'text', 'access-game')}
            >
              Игры публикуются в общем каталоге.
            </Text>
          )}
          {isPrivateClub ? (
            <Text
              color="positive"
              data-testid={testId('events', 'create-form', 'text', 'private-badge')}
            >
              Бейдж: Только для клуба — в общем поиске не показывается, для членов клуба бесплатно.
            </Text>
          ) : null}
          <TextInput
            label="Цена за игрока (₽)"
            value={isPrivateClub ? '0' : pricePerPlayer}
            onUpdate={setPricePerPlayer}
            disabled={isPrivateClub}
            data-testid={testId('events', 'create-form', 'field', 'price')}
          />
        </>
      ) : null}

      {step === 'publish' ? (
        <>
          {showPaywallHint ? (
            <Text color="warning" data-testid={testId('events', 'create-form', 'text', 'paywall')}>
              Чтобы опубликовать открытую тренировку для всех, нужна активная подписка. Можно
              сохранить черновик или сделать тренировку только для клуба.
            </Text>
          ) : null}

          {gateError ? (
            <Text color="danger" data-testid={testId('events', 'create-form', 'error', 'gate')}>
              {gateError}
            </Text>
          ) : null}

          {type === 'training' ? (
            <div className="hockey-stack hockey-stack--gap-8">
              <HockeyButton
                view={pendingGoalieNotify ? 'action' : 'outlined'}
                size="s"
                loading={goalieMutation.isPending}
                onClick={() => {
                  if (createdEventId && title.trim()) {
                    goalieMutation.mutate(createdEventId)
                    return
                  }
                  setCreatedEventId(null)
                  setPendingGoalieNotify((prev) => !prev)
                }}
                data-testid={testId('events', 'create-form', 'btn', 'goalie-request')}
              >
                {pendingGoalieNotify ? 'Запрос вратарям: включён' : 'Опционально: запрос вратарям'}
              </HockeyButton>
              {pendingGoalieNotify && !goalieRequestSent ? (
                <Text
                  color="secondary"
                  data-testid={testId('events', 'create-form', 'text', 'goalie-pending')}
                >
                  После публикации уйдёт запрос вратарям по окнам возможностей.
                </Text>
              ) : null}
              {goalieRequestSent ? (
                <Text
                  color="positive"
                  data-testid={testId('events', 'create-form', 'text', 'goalie-sent')}
                >
                  Запрос вратарям отправлен
                  {goalieNotifyCount != null ? `: ${goalieNotifyCount}` : ''} (демо).
                </Text>
              ) : null}
            </div>
          ) : null}

          {createdEventId ? (
            <div
              className="hockey-stack hockey-stack--gap-8"
              data-testid={testId('events', 'create-form', 'panel', 'success')}
            >
              <Text
                color="positive"
                data-testid={testId('events', 'create-form', 'text', 'success')}
              >
                {createdLifecycle === 'draft'
                  ? 'Черновик сохранён в кабинете организатора.'
                  : 'Событие опубликовано.'}
                {createdAccessScope === 'private_club' ? ' Бейдж: Только для клуба.' : ''}
              </Text>
              <Link
                to={routes.eventsOrganizer}
                data-testid={testId('events', 'create-form', 'link', 'cabinet')}
              >
                <HockeyButton
                  view="outlined"
                  size="s"
                  data-testid={testId('events', 'create-form', 'btn', 'cabinet')}
                >
                  В кабинет организатора
                </HockeyButton>
              </Link>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
        {stepIndex > 0 ? (
          <HockeyButton
            view="flat"
            size="m"
            onClick={goBack}
            data-testid={testId('events', 'create-form', 'btn', 'back')}
          >
            Назад
          </HockeyButton>
        ) : null}
        {step !== 'publish' ? (
          <HockeyButton
            view="action"
            size="m"
            onClick={goNext}
            disabled={!canProceedFrom(step)}
            data-testid={testId('events', 'create-form', 'btn', 'next')}
          >
            Далее
          </HockeyButton>
        ) : (
          <>
            <HockeyButton
              view="action"
              size="m"
              loading={mutation.isPending}
              onClick={handlePublish}
              data-testid={testId('events', 'create-form', 'btn', 'submit')}
            >
              Опубликовать
            </HockeyButton>
            <HockeyButton
              view="outlined"
              size="m"
              loading={mutation.isPending}
              onClick={handleSaveDraft}
              data-testid={testId('events', 'create-form', 'btn', 'draft')}
            >
              Сохранить черновик
            </HockeyButton>
          </>
        )}
      </div>
    </div>
  )
}
