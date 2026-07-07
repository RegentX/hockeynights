/**
 * SPEC-FR-3.1.2, SPEC-FR-21.1.1, SPEC-FR-21.1.2
 */

import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import {fetchPlayers} from '@/entities/profile'
import {
  addTeamMember,
  fetchTeamInvites,
  fetchTeamRoster,
  inviteTeamMemberByEmail,
} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-3.1.2 - Props добавления игрока */
export interface AddTeamMemberProps {
  /** @spec SPEC-FR-3.1.2 */
  teamId: string
}

/**
 * @spec SPEC-FR-3.1.2 - Добавление игрока в состав из mock-пользователей
 */
export function AddTeamMember({teamId}: AddTeamMemberProps) {
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: players = []} = useQuery({queryKey: ['players'], queryFn: () => fetchPlayers()})
  const {data: roster = []} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })
  const {data: invites = []} = useQuery({
    queryKey: ['team-invites', teamId],
    queryFn: () => fetchTeamInvites(teamId),
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => addTeamMember(teamId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['roster', teamId]})
      setSelectedUserId(null)
      setStatusMessage('Игрок добавлен в состав как приглашенный.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось добавить игрока')
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteTeamMemberByEmail(teamId, email),
    onSuccess: (invite) => {
      void queryClient.invalidateQueries({queryKey: ['team-invites', teamId]})
      setInviteEmail('')
      setStatusMessage(`Приглашение отправлено на ${invite.email}`)
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось отправить приглашение')
    },
  })

  const rosterUserIds = new Set(roster.map((member) => member.userId))
  const options = players
    .filter((p) => !rosterUserIds.has(p.userId))
    .map((p) => ({value: p.userId, content: `${p.displayName} (${p.position})`}))

  return (
    <div
      className="hockey-stack hockey-stack--gap-10"
      data-testid={testId('teams', 'add-team-member', 'form', teamId)}
    >
      <Text
        color="secondary"
        data-testid={testId('teams', 'add-team-member', 'text', 'hint', teamId)}
      >
        В команду можно добавить только зарегистрированных пользователей.
      </Text>
      <div className="hockey-row hockey-row--gap-8 hockey-row--end">
        <Select
          label="Добавить зарегистрированного игрока"
          options={options}
          value={selectedUserId ? [selectedUserId] : []}
          onUpdate={(v) => setSelectedUserId(v[0] ?? null)}
          placeholder={options.length ? 'Выберите игрока' : 'Все игроки уже в составе'}
          width={320}
          data-testid={testId('teams', 'add-team-member', 'select', 'player', teamId)}
        />
        <Button
          view="action"
          loading={addMemberMutation.isPending}
          disabled={!selectedUserId}
          onClick={() => {
            if (selectedUserId) addMemberMutation.mutate(selectedUserId)
          }}
          data-testid={testId('teams', 'add-team-member', 'btn', 'add', teamId)}
        >
          Добавить
        </Button>
      </div>

      <Text
        color="secondary"
        data-testid={testId('teams', 'add-team-member', 'text', 'invite-hint', teamId)}
      >
        Если игрок не зарегистрирован, отправь ему приглашение на email.
      </Text>
      <div className="hockey-row hockey-row--gap-8 hockey-row--end">
        <TextInput
          label="Email приглашения"
          value={inviteEmail}
          placeholder="player@example.com"
          onUpdate={setInviteEmail}
          data-testid={testId('teams', 'add-team-member', 'field', 'invite-email', teamId)}
        />
        <Button
          view="outlined"
          loading={inviteMutation.isPending}
          disabled={!inviteEmail.trim()}
          onClick={() => inviteMutation.mutate(inviteEmail)}
          data-testid={testId('teams', 'add-team-member', 'btn', 'invite', teamId)}
        >
          Отправить приглашение
        </Button>
      </div>
      {invites.length > 0 && (
        <div
          className="hockey-stack hockey-stack--gap-6"
          data-testid={testId('teams', 'add-team-member', 'list', 'invites', teamId)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('teams', 'add-team-member', 'text', 'invites-title', teamId)}
          >
            Последние email-приглашения
          </Text>
          {invites.slice(0, 3).map((invite) => (
            <Text
              key={invite.id}
              color="secondary"
              data-testid={testId('teams', 'add-team-member', 'item', 'invite', invite.id)}
            >
              {invite.email} · {invite.status} ·{' '}
              {new Date(invite.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          ))}
        </div>
      )}
      {statusMessage && (
        <Text
          color="secondary"
          data-testid={testId('teams', 'add-team-member', 'text', 'status', teamId)}
        >
          {statusMessage}
        </Text>
      )}
    </div>
  )
}
