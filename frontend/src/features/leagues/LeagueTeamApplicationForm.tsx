/**
 * SPEC-FR-24.5.4
 */

import {useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import type {League} from '@/entities/league/types'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {
  fetchLeagueDivisions,
  fetchLeagueSeasons,
  fetchTeamLeagueApplication,
  submitLeagueApplication,
} from '@/features/leagues/api/leaguesApi'
import {fetchTeams} from '@/features/teams/api/teamsApi'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const STATUS_LABELS: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  waitlist: 'Лист ожидания',
}

export interface LeagueTeamApplicationFormProps {
  league: League
}

/** @spec SPEC-FR-24.5.4 - Подача заявки капитаном команды */
export function LeagueTeamApplicationForm({league}: LeagueTeamApplicationFormProps) {
  const queryClient = useQueryClient()
  const [contactEmail, setContactEmail] = useState('captain@example.com')
  const [divisionId, setDivisionId] = useState<string | undefined>()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: fetchTeams})
  const {data: seasons = []} = useQuery({
    queryKey: ['league-seasons', league.id],
    queryFn: () => fetchLeagueSeasons(league.id),
  })

  const activeSeason = seasons.find((s) => s.status === 'active') ?? seasons[0]

  const {data: divisions = []} = useQuery({
    queryKey: ['league-divisions', league.id, activeSeason?.id],
    queryFn: () => fetchLeagueDivisions(league.id, activeSeason?.id),
    enabled: Boolean(activeSeason),
  })

  const captainTeams = useMemo(() => {
    const userId = session?.user.id
    if (!userId) return []
    return teams.filter((team) => team.captainUserId === userId || team.ownerUserId === userId)
  }, [session?.user.id, teams])

  const [teamId, setTeamId] = useState<string | undefined>(captainTeams[0]?.id)
  const selectedTeam = captainTeams.find((team) => team.id === teamId) ?? captainTeams[0]

  const {data: existingApps = []} = useQuery({
    queryKey: ['team-league-application', league.id, selectedTeam?.id],
    queryFn: () => fetchTeamLeagueApplication(league.id, selectedTeam!.id),
    enabled: Boolean(selectedTeam?.id),
  })

  const existing = existingApps[0]
  const isCaptain =
    session?.user.roles.includes('captain') ||
    session?.user.roles.includes('organizer') ||
    captainTeams.length > 0

  const submitMutation = useMutation({
    mutationFn: () =>
      submitLeagueApplication(league.id, {
        seasonId: activeSeason!.id,
        divisionId,
        teamId: selectedTeam!.id,
        teamName: selectedTeam!.name,
        captainName: session!.user.displayName,
        contactEmail,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['team-league-application', league.id, selectedTeam?.id]})
      setStatusMessage('Заявка отправлена. Лига рассмотрит её в кабинете партнёра.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку')
    },
  })

  if (league.recruitingStatus === 'closed') {
    return <Text color="secondary">Набор команд в эту лигу закрыт.</Text>
  }

  if (!isCaptain) {
    return (
      <div className="league-profile__application hockey-stack hockey-stack--gap-8">
        <Text color="secondary">Подать заявку может капитан или владелец команды.</Text>
        <Link to="/">
          <HockeyButton view="outlined" size="s">Войти как капитан</HockeyButton>
        </Link>
      </div>
    )
  }

  if (!selectedTeam || !activeSeason) {
    return <Text color="secondary">Создайте команду, чтобы подать заявку в лигу.</Text>
  }

  if (existing && existing.status !== 'rejected') {
    return (
      <div className="league-profile__application hockey-stack hockey-stack--gap-8">
        <Text variant="subheader-2">Заявка команды {selectedTeam.name}</Text>
        <Text>
          Статус: {STATUS_LABELS[existing.status] ?? existing.status}
          {existing.reviewComment ? ` · ${existing.reviewComment}` : ''}
        </Text>
        <Text color="secondary">
          Сезон {activeSeason.name} · подана{' '}
          {new Date(existing.createdAt).toLocaleString('ru-RU')}
        </Text>
      </div>
    )
  }

  const divisionOptions = divisions.map((d) => ({value: d.id, content: d.name}))

  return (
    <div className="league-profile__application partner-dashboard__form hockey-stack hockey-stack--gap-10">
      <Text variant="subheader-2">Подать заявку в лигу</Text>
      <Text color="secondary">
        Команда: {selectedTeam.name} · сезон: {activeSeason.name}
      </Text>

      {captainTeams.length > 1 && (
        <Select
          label="Команда"
          value={[selectedTeam.id]}
          options={captainTeams.map((team) => ({value: team.id, content: team.name}))}
          onUpdate={(value) => setTeamId(value[0])}
        />
      )}

      {divisionOptions.length > 0 && (
        <Select
          label="Дивизион"
          value={divisionId ? [divisionId] : []}
          options={divisionOptions}
          onUpdate={(value) => setDivisionId(value[0])}
        />
      )}

      <TextInput label="Email для связи" value={contactEmail} onUpdate={setContactEmail} />

      <Button
        view="action"
        size="s"
        disabled={!contactEmail.trim()}
        loading={submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
      >
        Отправить заявку
      </Button>

      {statusMessage && <Text color="secondary">{statusMessage}</Text>}
    </div>
  )
}
