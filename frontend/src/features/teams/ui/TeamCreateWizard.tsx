/**
 * HOCFRONT-25 — пошаговое создание команды (feature)
 */

import {Checkbox, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {type ChangeEvent, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import {fetchArenas} from '@/entities/arena'
import type {SkillLevel} from '@/entities/common'
import {fetchLeagues} from '@/entities/league'
import {fetchPlayers} from '@/entities/profile'
import {createTeam, type CreateTeamPayload} from '@/entities/team'
import {DEFAULT_CITY} from '@/shared/config/geo'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const SKILL_OPTIONS = [
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

type WizardStep = 'basics' | 'look' | 'people' | 'place' | 'chat' | 'done'

const STEPS: Array<{id: WizardStep; label: string}> = [
  {id: 'basics', label: 'Основы'},
  {id: 'look', label: 'Образ'},
  {id: 'people', label: 'Состав'},
  {id: 'place', label: 'Площадка'},
  {id: 'chat', label: 'Мессенджер'},
  {id: 'done', label: 'Готово'},
]

interface TeamCreateDraft extends CreateTeamPayload {
  playerIds: string[]
  coachIds: string[]
  createMessengerChat: boolean
  messengerChatPublic: boolean
}

const EMPTY_DRAFT: TeamCreateDraft = {
  name: '',
  city: DEFAULT_CITY,
  skillLevel: 'amateur',
  description: '',
  shortDescription: '',
  leagueId: undefined,
  homeArenaId: undefined,
  logoUrl: undefined,
  playerIds: [],
  coachIds: [],
  createMessengerChat: true,
  messengerChatPublic: true,
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

/**
 * Мастер создания команды: образ, состав, площадка, чат.
 */
export function TeamCreateWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<WizardStep>('basics')
  const [draft, setDraft] = useState<TeamCreateDraft>(EMPTY_DRAFT)
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null)
  const [logoHint, setLogoHint] = useState<string | null>(null)

  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: fetchLeagues})
  const {data: arenas = []} = useQuery({queryKey: ['arenas'], queryFn: () => fetchArenas()})
  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
  })

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (team) => {
      void queryClient.invalidateQueries({queryKey: ['teams']})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      void queryClient.invalidateQueries({queryKey: ['roster', team.id]})
      setCreatedTeamId(team.id)
      setStep('done')
    },
  })

  const stepIndex = STEPS.findIndex((item) => item.id === step)
  const canContinueBasics = draft.name.trim().length >= 2 && Boolean(draft.city.trim())

  const leagueOptions = [
    {value: '', content: 'Без лиги'},
    ...leagues.map((league) => ({value: league.id, content: league.name})),
  ]
  const arenaOptions = [
    {value: '', content: 'Без домашней арены'},
    ...arenas.map((arena) => ({value: arena.id, content: arena.name})),
  ]

  const handleLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLogoHint('Нужен файл изображения')
      return
    }
    if (file.size > 2_000_000) {
      setLogoHint('Максимум 2 МБ для MVP-превью')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : undefined
      setDraft((prev) => ({...prev, logoUrl: result}))
      setLogoHint(result ? 'Фото прикреплено' : null)
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = () => {
    if (!canContinueBasics) return
    mutation.mutate({
      name: draft.name.trim(),
      city: draft.city.trim(),
      skillLevel: draft.skillLevel,
      description: draft.description?.trim() || undefined,
      shortDescription: draft.shortDescription?.trim() || undefined,
      leagueId: draft.leagueId || undefined,
      homeArenaId: draft.homeArenaId || undefined,
      logoUrl: draft.logoUrl || undefined,
      playerIds: draft.playerIds,
      coachIds: draft.coachIds,
      createMessengerChat: draft.createMessengerChat,
      messengerChatPublic: draft.messengerChatPublic,
    })
  }

  return (
    <div
      className="team-create-wizard hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'create-wizard', 'form')}
    >
      <div
        className="team-create-wizard__steps"
        data-testid={testId('teams', 'create-wizard', 'nav', 'steps')}
      >
        {STEPS.map((item, index) => (
          <div
            key={item.id}
            className={`team-create-wizard__step${
              item.id === step ? ' is-active' : ''
            }${index < stepIndex ? ' is-done' : ''}`}
            data-testid={testId('teams', 'create-wizard', 'badge', 'step', item.id)}
          >
            <span className="team-create-wizard__step-index">{index + 1}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {step === 'basics' && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'basics')}
        >
          <Text
            color="secondary"
            data-testid={testId('teams', 'create-wizard', 'text', 'basics-hint')}
          >
            Название, город и уровень — минимум для появления в каталоге.
          </Text>
          <TextInput
            label="Название команды"
            value={draft.name}
            onUpdate={(name) => setDraft((prev) => ({...prev, name}))}
            data-testid={testId('teams', 'create-wizard', 'field', 'name')}
          />
          <TextInput
            label="Город"
            value={draft.city}
            onUpdate={(city) => setDraft((prev) => ({...prev, city}))}
            data-testid={testId('teams', 'create-wizard', 'field', 'city')}
          />
          <Select
            label="Уровень"
            value={[draft.skillLevel]}
            onUpdate={(v) =>
              setDraft((prev) => ({...prev, skillLevel: (v[0] as SkillLevel) || 'amateur'}))
            }
            options={SKILL_OPTIONS}
            data-testid={testId('teams', 'create-wizard', 'select', 'skill')}
          />
          <HockeyButton
            view="action"
            disabled={!canContinueBasics}
            onClick={() => setStep('look')}
            data-testid={testId('teams', 'create-wizard', 'btn', 'next-basics')}
          >
            Далее
          </HockeyButton>
        </div>
      )}

      {step === 'look' && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'look')}
        >
          <Text
            color="secondary"
            data-testid={testId('teams', 'create-wizard', 'text', 'look-hint')}
          >
            Описание для карточки и логотип / фото команды.
          </Text>
          <TextInput
            label="Краткое описание"
            value={draft.shortDescription ?? ''}
            onUpdate={(shortDescription) => setDraft((prev) => ({...prev, shortDescription}))}
            placeholder="Например: любители · вт / сб"
            data-testid={testId('teams', 'create-wizard', 'field', 'short-description')}
          />
          <div>
            <Text
              color="secondary"
              data-testid={testId('teams', 'create-wizard', 'text', 'description-label')}
            >
              Полное описание
            </Text>
            <TextArea
              value={draft.description ?? ''}
              onUpdate={(description) => setDraft((prev) => ({...prev, description}))}
              minRows={3}
              data-testid={testId('teams', 'create-wizard', 'field', 'description')}
            />
          </div>
          <TextInput
            label="URL логотипа (опционально)"
            value={draft.logoUrl?.startsWith('data:') ? '' : (draft.logoUrl ?? '')}
            onUpdate={(logoUrl) => {
              setDraft((prev) => ({...prev, logoUrl: logoUrl || undefined}))
              setLogoHint(null)
            }}
            placeholder="https://…"
            data-testid={testId('teams', 'create-wizard', 'field', 'logo-url')}
          />
          <div className="hockey-stack hockey-stack--gap-8">
            <Text
              color="secondary"
              data-testid={testId('teams', 'create-wizard', 'text', 'logo-file-label')}
            >
              Или загрузите фото (MVP: локальный preview)
            </Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoFile}
              data-testid={testId('teams', 'create-wizard', 'field', 'logo-file')}
            />
            {logoHint && (
              <Text
                color="secondary"
                data-testid={testId('teams', 'create-wizard', 'text', 'logo-hint')}
              >
                {logoHint}
              </Text>
            )}
            {draft.logoUrl && (
              <img
                src={draft.logoUrl}
                alt=""
                className="team-create-wizard__logo-preview"
                data-testid={testId('teams', 'create-wizard', 'img', 'logo-preview')}
              />
            )}
          </div>
          <div className="hockey-row hockey-row--gap-8">
            <HockeyButton
              view="outlined"
              onClick={() => setStep('basics')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'back-look')}
            >
              Назад
            </HockeyButton>
            <HockeyButton
              view="action"
              onClick={() => setStep('people')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'next-look')}
            >
              Далее
            </HockeyButton>
          </div>
        </div>
      )}

      {step === 'people' && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'people')}
        >
          <Text
            color="secondary"
            data-testid={testId('teams', 'create-wizard', 'text', 'people-hint')}
          >
            Сразу пригласите игроков и тренеров. Их можно добавить позже из кабинета.
          </Text>
          <div
            className="team-create-wizard__people-list"
            data-testid={testId('teams', 'create-wizard', 'list', 'players')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('teams', 'create-wizard', 'text', 'players-title')}
            >
              Игроки
            </Text>
            {players.map((player) => (
              <Checkbox
                key={`player-${player.userId}`}
                checked={draft.playerIds.includes(player.userId)}
                onUpdate={() =>
                  setDraft((prev) => ({
                    ...prev,
                    playerIds: toggleId(prev.playerIds, player.userId),
                    coachIds: prev.coachIds.filter((id) => id !== player.userId),
                  }))
                }
                content={`${player.displayName} · ${player.position}`}
                data-testid={testId('teams', 'create-wizard', 'checkbox', 'player', player.userId)}
              />
            ))}
          </div>
          <div
            className="team-create-wizard__people-list"
            data-testid={testId('teams', 'create-wizard', 'list', 'coaches')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('teams', 'create-wizard', 'text', 'coaches-title')}
            >
              Тренеры / штаб
            </Text>
            {players.map((player) => (
              <Checkbox
                key={`coach-${player.userId}`}
                checked={draft.coachIds.includes(player.userId)}
                onUpdate={() =>
                  setDraft((prev) => ({
                    ...prev,
                    coachIds: toggleId(prev.coachIds, player.userId),
                    playerIds: prev.playerIds.filter((id) => id !== player.userId),
                  }))
                }
                content={`${player.displayName} · ${player.position}`}
                data-testid={testId('teams', 'create-wizard', 'checkbox', 'coach', player.userId)}
              />
            ))}
          </div>
          <div className="hockey-row hockey-row--gap-8">
            <HockeyButton
              view="outlined"
              onClick={() => setStep('look')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'back-people')}
            >
              Назад
            </HockeyButton>
            <HockeyButton
              view="action"
              onClick={() => setStep('place')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'next-people')}
            >
              Далее
            </HockeyButton>
          </div>
        </div>
      )}

      {step === 'place' && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'place')}
        >
          <Text
            color="secondary"
            data-testid={testId('teams', 'create-wizard', 'text', 'place-hint')}
          >
            Привязки необязательны — помогут в фильтрах и на публичной странице.
          </Text>
          <Select
            label="Лига"
            value={[draft.leagueId ?? '']}
            onUpdate={(v) => setDraft((prev) => ({...prev, leagueId: v[0] || undefined}))}
            options={leagueOptions}
            data-testid={testId('teams', 'create-wizard', 'select', 'league')}
          />
          <Select
            label="Домашняя арена"
            value={[draft.homeArenaId ?? '']}
            onUpdate={(v) => setDraft((prev) => ({...prev, homeArenaId: v[0] || undefined}))}
            options={arenaOptions}
            data-testid={testId('teams', 'create-wizard', 'select', 'arena')}
          />
          <div className="hockey-row hockey-row--gap-8">
            <HockeyButton
              view="outlined"
              onClick={() => setStep('people')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'back-place')}
            >
              Назад
            </HockeyButton>
            <HockeyButton
              view="action"
              onClick={() => setStep('chat')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'next-place')}
            >
              Далее
            </HockeyButton>
          </div>
        </div>
      )}

      {step === 'chat' && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'chat')}
        >
          <Text
            color="secondary"
            data-testid={testId('teams', 'create-wizard', 'text', 'chat-hint')}
          >
            Группа в мессенджере — чтобы любой мог найти команду и написать ей.
          </Text>
          <Checkbox
            checked={draft.createMessengerChat}
            onUpdate={(createMessengerChat) => setDraft((prev) => ({...prev, createMessengerChat}))}
            content="Создать группу команды в мессенджере"
            data-testid={testId('teams', 'create-wizard', 'checkbox', 'create-chat')}
          />
          <Checkbox
            checked={draft.messengerChatPublic}
            disabled={!draft.createMessengerChat}
            onUpdate={(messengerChatPublic) => setDraft((prev) => ({...prev, messengerChatPublic}))}
            content="Публичный чат (виден в поиске мессенджера)"
            data-testid={testId('teams', 'create-wizard', 'checkbox', 'public-chat')}
          />
          <div
            className="team-create-wizard__summary hockey-stack hockey-stack--gap-6"
            data-testid={testId('teams', 'create-wizard', 'panel', 'summary')}
          >
            <Text variant="subheader-2">Перед созданием</Text>
            <Text color="secondary">
              «{draft.name.trim() || '—'}» · {draft.city}
            </Text>
            <Text color="secondary">
              Игроков: {draft.playerIds.length} · тренеров: {draft.coachIds.length}
            </Text>
            <Text color="secondary">
              Чат:{' '}
              {!draft.createMessengerChat
                ? 'не создавать'
                : draft.messengerChatPublic
                  ? 'публичный'
                  : 'только для участников'}
            </Text>
          </div>
          <div className="hockey-row hockey-row--gap-8">
            <HockeyButton
              view="outlined"
              onClick={() => setStep('place')}
              data-testid={testId('teams', 'create-wizard', 'btn', 'back-chat')}
            >
              Назад
            </HockeyButton>
            <HockeyButton
              view="action"
              loading={mutation.isPending}
              onClick={handleCreate}
              data-testid={testId('teams', 'create-wizard', 'btn', 'submit')}
            >
              Создать команду
            </HockeyButton>
          </div>
          {mutation.isError && (
            <Text color="danger" data-testid={testId('teams', 'create-wizard', 'error')}>
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Не удалось создать команду'}
            </Text>
          )}
        </div>
      )}

      {step === 'done' && createdTeamId && (
        <div
          className="hockey-stack hockey-stack--gap-12"
          data-testid={testId('teams', 'create-wizard', 'panel', 'done')}
        >
          <Text data-testid={testId('teams', 'create-wizard', 'text', 'success')}>
            Команда «{draft.name.trim()}» создана
            {draft.createMessengerChat ? '. Группа в мессенджере готова.' : '.'}
          </Text>
          <div className="hockey-row hockey-row--gap-8">
            <Link
              to={`/teams/${createdTeamId}`}
              data-testid={testId('teams', 'create-wizard', 'link', 'profile')}
            >
              <HockeyButton
                view="action"
                size="s"
                data-testid={testId('teams', 'create-wizard', 'btn', 'open-profile')}
              >
                Открыть профиль
              </HockeyButton>
            </Link>
            {draft.createMessengerChat && (
              <Link
                to={routes.messenger}
                data-testid={testId('teams', 'create-wizard', 'link', 'messenger')}
              >
                <HockeyButton
                  view="outlined"
                  size="s"
                  data-testid={testId('teams', 'create-wizard', 'btn', 'open-messenger')}
                >
                  Мессенджер
                </HockeyButton>
              </Link>
            )}
            <HockeyButton
              view="flat"
              size="s"
              onClick={() => navigate(routes.teams)}
              data-testid={testId('teams', 'create-wizard', 'btn', 'to-catalog')}
            >
              К каталогу
            </HockeyButton>
          </div>
        </div>
      )}
    </div>
  )
}
