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
    return <ScoreboardLoader label="Загрузка кабинета лиги" />
  }

  const form = {...league, ...draft}

  if (!canManage) {
    return (
      <IceCard padding="m">
        <Text>Кабинет доступен только представителю лиги. Выберите роль при входе.</Text>
        <Link to="/" className="hockey-mt-12">
          <HockeyButton view="outlined" size="s">Перейти к входу</HockeyButton>
        </Link>
      </IceCard>
    )
  }

  return (
    <div className="partner-dashboard hockey-stack hockey-stack--gap-16">
      <div className="partner-dashboard__header hockey-row hockey-row--between">
        <div>
          <Text variant="header-1">Кабинет лиги</Text>
          <Text color="secondary">{league.name}</Text>
        </div>
        <EntityProfileBadge kind="league" />
      </div>

      <div className="partner-dashboard__tabs">
        <Button view={tab === 'profile' ? 'action' : 'outlined'} size="s" onClick={() => setTab('profile')}>
          О лиге
        </Button>
        <Button view={tab === 'applications' ? 'action' : 'outlined'} size="s" onClick={() => setTab('applications')}>
          Заявки
        </Button>
        <Button view={tab === 'schedule' ? 'action' : 'outlined'} size="s" onClick={() => setTab('schedule')}>
          Расписание
        </Button>
        <Button view={tab === 'posts' ? 'action' : 'outlined'} size="s" onClick={() => setTab('posts')}>
          Публикации
        </Button>
        <Button view={tab === 'analytics' ? 'action' : 'outlined'} size="s" onClick={() => setTab('analytics')}>
          Аналитика
        </Button>
      </div>

      {tab === 'profile' && (
      <IceCard padding="m">
        <div className="partner-dashboard__form hockey-stack hockey-stack--gap-10">
          <Text variant="subheader-2">Публичный профиль лиги</Text>
          <TextInput
            label="Описание"
            value={form.description ?? ''}
            onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
          />
          <TextInput
            label="Email"
            value={form.contactEmail ?? ''}
            onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
          />
          <TextInput
            label="Телефон"
            value={form.contactPhone ?? ''}
            onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
          />
          <TextInput
            label="Краткие правила"
            value={form.rulesSummary ?? ''}
            onUpdate={(value) => setDraft((prev) => ({...prev, rulesSummary: value}))}
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
          />
          <Text color="secondary">Статус модерации: {form.moderationStatus ?? 'draft'}</Text>
          <Button view="action" loading={saveMutation.isPending} onClick={() => saveMutation.mutate(draft)}>
            Сохранить профиль
          </Button>
          {statusMessage && <Text color="secondary">{statusMessage}</Text>}
        </div>
      </IceCard>
      )}

      {tab === 'applications' && (
        <IceCard padding="m">
          <LeagueApplicationsPanel leagueId={leagueId} />
        </IceCard>
      )}

      {tab === 'schedule' && (
        <IceCard padding="m">
          <LeagueScheduleManager leagueId={leagueId} />
        </IceCard>
      )}

      {tab === 'posts' && (
        <IceCard padding="m">
          <LeaguePostsPanel leagueId={leagueId} />
        </IceCard>
      )}

      {tab === 'analytics' && (
        <IceCard padding="m">
          <LeagueAnalyticsPanel leagueId={leagueId} />
        </IceCard>
      )}

      <Link to="/leagues">
        <HockeyButton view="outlined" size="s">← К списку лиг</HockeyButton>
      </Link>
    </div>
  )
}
