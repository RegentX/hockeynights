/**
 * SPEC-FR-24.5.3
 */

import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import type {League} from '@/entities/league/types'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {fetchLeagues, updateLeaguePartnerProfile} from '@/features/leagues/api/leaguesApi'
import {LeagueApplicationsPanel} from '@/features/leagues/LeagueApplicationsPanel'
import {LeaguePostsPanel} from '@/features/leagues/LeaguePostsPanel'
import {LeagueAnalyticsPanel} from '@/features/leagues/LeagueAnalyticsPanel'
import {LeagueScheduleManager} from '@/features/leagues/LeagueScheduleManager'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {testId} from '@/shared/testing/testId'

const RECRUITING_OPTIONS = [
  {value: 'open', content: 'Набор открыт'},
  {value: 'waitlist', content: 'Лист ожидания'},
  {value: 'closed', content: 'Набор закрыт'},
]

type PartnerTab = 'profile' | 'applications' | 'schedule' | 'posts' | 'analytics'

/** @spec SPEC-FR-24.5.3 - Кабинет партнёра лиги */
export function LeaguePartnerDashboard() {
  const {leagueId = ''} = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PartnerTab>('applications')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const {data: leagues = [], isLoading} = useQuery({queryKey: ['leagues'], queryFn: fetchLeagues})
  const league = leagues.find((item) => item.id === leagueId)
  const [draft, setDraft] = useState<Partial<League>>({})

  const canManage =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'league' && m.entityId === leagueId)

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<League>) => updateLeaguePartnerProfile(leagueId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      setStatusMessage('Профиль лиги обновлён и отправлен на модерацию.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  if (isLoading || !league) {
    return (
      <div data-testid={testId('leagues', 'partner', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета лиги" />
      </div>
    )
  }

  const form = {...league, ...draft}

  if (!canManage) {
    return (
      <div data-testid={testId('leagues', 'partner', 'panel', 'denied')}>
        <IceCard padding="m">
          <Text data-testid={testId('leagues', 'partner', 'text', 'denied')}>
            Кабинет доступен только представителю лиги. Выберите роль при входе.
          </Text>
          <Link to="/" className="hockey-mt-12" data-testid={testId('leagues', 'partner', 'link', 'login')}>
            <HockeyButton view="outlined" size="s" data-testid={testId('leagues', 'partner', 'btn', 'login')}>
              Перейти к входу
            </HockeyButton>
          </Link>
        </IceCard>
      </div>
    )
  }

  return (
    <div className="partner-dashboard hockey-stack hockey-stack--gap-16" data-testid={testId('leagues', 'partner', 'page', leagueId)}>
      <div className="partner-dashboard__header hockey-row hockey-row--between">
        <div>
          <Text variant="header-1" data-testid={testId('leagues', 'partner', 'text', 'title', leagueId)}>
            Кабинет лиги
          </Text>
          <Text color="secondary" data-testid={testId('leagues', 'partner', 'text', 'subtitle', leagueId)}>
            {league.name}
          </Text>
        </div>
        <div data-testid={testId('leagues', 'partner', 'badge', 'profile', leagueId)}>
          <EntityProfileBadge kind="league" />
        </div>
      </div>

      <div className="partner-dashboard__tabs" data-testid={testId('leagues', 'partner', 'nav', leagueId)}>
        <Button
          view={tab === 'profile' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('profile')}
          data-testid={testId('leagues', 'partner', 'tab', 'profile', leagueId)}
        >
          О лиге
        </Button>
        <Button
          view={tab === 'applications' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('applications')}
          data-testid={testId('leagues', 'partner', 'tab', 'applications', leagueId)}
        >
          Заявки
        </Button>
        <Button
          view={tab === 'schedule' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('schedule')}
          data-testid={testId('leagues', 'partner', 'tab', 'schedule', leagueId)}
        >
          Расписание
        </Button>
        <Button
          view={tab === 'posts' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('posts')}
          data-testid={testId('leagues', 'partner', 'tab', 'posts', leagueId)}
        >
          Публикации
        </Button>
        <Button
          view={tab === 'analytics' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('analytics')}
          data-testid={testId('leagues', 'partner', 'tab', 'analytics', leagueId)}
        >
          Аналитика
        </Button>
      </div>

      {tab === 'profile' && (
        <div data-testid={testId('leagues', 'partner', 'panel', 'profile', leagueId)}>
          <IceCard padding="m">
            <div className="partner-dashboard__form hockey-stack hockey-stack--gap-10">
              <Text variant="subheader-2" data-testid={testId('leagues', 'partner', 'text', 'profile-title', leagueId)}>
                Публичный профиль лиги
              </Text>
              <TextInput
                label="Описание"
                value={form.description ?? ''}
                onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
                data-testid={testId('leagues', 'partner', 'field', 'description', leagueId)}
              />
              <TextInput
                label="Email"
                value={form.contactEmail ?? ''}
                onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
                data-testid={testId('leagues', 'partner', 'field', 'email', leagueId)}
              />
              <TextInput
                label="Телефон"
                value={form.contactPhone ?? ''}
                onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
                data-testid={testId('leagues', 'partner', 'field', 'phone', leagueId)}
              />
              <TextInput
                label="Краткие правила"
                value={form.rulesSummary ?? ''}
                onUpdate={(value) => setDraft((prev) => ({...prev, rulesSummary: value}))}
                data-testid={testId('leagues', 'partner', 'field', 'rules', leagueId)}
              />
              <Select
                label="Статус набора команд"
                value={[form.recruitingStatus ?? 'open']}
                options={RECRUITING_OPTIONS}
                onUpdate={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    recruitingStatus: value[0] as League['recruitingStatus'],
                  }))
                }
                data-testid={testId('leagues', 'partner', 'select', 'recruiting', leagueId)}
              />
              <Text color="secondary" data-testid={testId('leagues', 'partner', 'text', 'moderation', leagueId)}>
                Статус модерации: {form.moderationStatus ?? 'draft'}
              </Text>
              <Button
                view="action"
                loading={saveMutation.isPending}
                onClick={() => saveMutation.mutate(draft)}
                data-testid={testId('leagues', 'partner', 'btn', 'save', leagueId)}
              >
                Сохранить профиль
              </Button>
              {statusMessage && (
                <Text color="secondary" data-testid={testId('leagues', 'partner', 'text', 'status', leagueId)}>
                  {statusMessage}
                </Text>
              )}
            </div>
          </IceCard>
        </div>
      )}

      {tab === 'applications' && (
        <div data-testid={testId('leagues', 'partner', 'panel', 'applications', leagueId)}>
          <IceCard padding="m">
            <LeagueApplicationsPanel leagueId={leagueId} />
          </IceCard>
        </div>
      )}

      {tab === 'schedule' && (
        <div data-testid={testId('leagues', 'partner', 'panel', 'schedule', leagueId)}>
          <IceCard padding="m">
            <LeagueScheduleManager leagueId={leagueId} />
          </IceCard>
        </div>
      )}

      {tab === 'posts' && (
        <div data-testid={testId('leagues', 'partner', 'panel', 'posts', leagueId)}>
          <IceCard padding="m">
            <LeaguePostsPanel leagueId={leagueId} />
          </IceCard>
        </div>
      )}

      {tab === 'analytics' && (
        <div data-testid={testId('leagues', 'partner', 'panel', 'analytics', leagueId)}>
          <IceCard padding="m">
            <LeagueAnalyticsPanel leagueId={leagueId} />
          </IceCard>
        </div>
      )}

      <Link to="/leagues" data-testid={testId('leagues', 'partner', 'link', 'back', leagueId)}>
        <HockeyButton view="outlined" size="s" data-testid={testId('leagues', 'partner', 'btn', 'back', leagueId)}>
          ← К списку лиг
        </HockeyButton>
      </Link>
    </div>
  )
}
