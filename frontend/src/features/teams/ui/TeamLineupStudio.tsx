/**
 * HOCFRONT-25 — студия постановок: разные схемы состава + сохранение в шаблоны
 */

import {Select, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {PlayerPosition} from '@/entities/common'
import {fetchTeamRoster, type TrainingDraftAssignment} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {
  createTeamLineupTemplate,
  loadTeamLineupTemplates,
  saveTeamLineupTemplates,
  type TeamLineupTemplate,
} from '../lib/lineupTemplates'
import {LineupRinkPreview} from './LineupRinkPreview'

export interface TeamLineupStudioProps {
  teamId: string
  canEdit: boolean
}

function buildDefaultAssignments(
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  return roster.map((member, index) => ({
    userId: member.userId,
    displayName: member.displayName,
    position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
    side: index < 3 ? 'red' : index < 6 ? 'white' : 'bench',
    line: ((index % 3) + 1) as number,
  }))
}

function mergeAssignmentsWithRoster(
  prev: TrainingDraftAssignment[],
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  if (roster.length === 0) return []
  if (prev.length === 0) return buildDefaultAssignments(roster)
  const byUser = new Map(prev.map((item) => [item.userId, item]))
  return roster.map((member) => {
    const existing = byUser.get(member.userId)
    if (existing) {
      return {...existing, displayName: member.displayName}
    }
    return {
      userId: member.userId,
      displayName: member.displayName,
      position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
      side: 'bench' as const,
      line: 1,
    }
  })
}

export function TeamLineupStudio({teamId, canEdit}: TeamLineupStudioProps) {
  const [templates, setTemplates] = useState<TeamLineupTemplate[]>(() =>
    loadTeamLineupTemplates(teamId),
  )
  const [templateName, setTemplateName] = useState('')
  const [assignments, setAssignments] = useState<TrainingDraftAssignment[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [syncedTeamId, setSyncedTeamId] = useState(teamId)
  const [syncedRosterKey, setSyncedRosterKey] = useState('')

  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const activeRoster = useMemo(
    () => roster.filter((member) => member.rosterStatus !== 'removed'),
    [roster],
  )
  const rosterKey = `${teamId}:${activeRoster.map((member) => member.userId).join('|')}`

  if (teamId !== syncedTeamId) {
    setSyncedTeamId(teamId)
    setTemplates(loadTeamLineupTemplates(teamId))
    setAssignments([])
    setSyncedRosterKey('')
    setStatusMessage(null)
  }

  if (!isLoading && rosterKey !== syncedRosterKey) {
    setSyncedRosterKey(rosterKey)
    setAssignments((prev) => mergeAssignmentsWithRoster(prev, activeRoster))
  }

  function persistTemplates(next: TeamLineupTemplate[]) {
    setTemplates(next)
    saveTeamLineupTemplates(teamId, next)
  }

  function updatePlayer(
    userId: string,
    patch: Partial<Pick<TrainingDraftAssignment, 'side' | 'position' | 'line'>>,
  ) {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.userId !== userId) {
          if (
            patch.side &&
            patch.side !== 'bench' &&
            patch.position &&
            patch.line &&
            item.side === patch.side &&
            item.position === patch.position &&
            (item.line ?? 1) === patch.line
          ) {
            return {...item, side: 'bench'}
          }
          return item
        }
        return {...item, ...patch}
      }),
    )
  }

  function saveTemplate() {
    const name = templateName.trim()
    if (!name || !canEdit) return
    const template = createTeamLineupTemplate(
      name,
      assignments.map((item) => ({
        userId: item.userId,
        displayName: item.displayName,
        position: item.position,
        side: item.side,
        line: item.line,
      })),
    )
    persistTemplates([template, ...templates])
    setTemplateName('')
    setStatusMessage(`Шаблон «${template.name}» сохранён`)
  }

  function loadTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const byUser = new Map(template.assignments.map((item) => [item.userId, item]))
    setAssignments(
      activeRoster.map((member) => {
        const fromTpl = byUser.get(member.userId)
        if (
          !fromTpl ||
          (fromTpl.side !== 'red' && fromTpl.side !== 'white' && fromTpl.side !== 'bench')
        ) {
          return {
            userId: member.userId,
            displayName: member.displayName,
            position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
            side: 'bench' as const,
            line: 1,
          }
        }
        return {
          userId: member.userId,
          displayName: member.displayName,
          position: fromTpl.position,
          side: fromTpl.side,
          line: fromTpl.line ?? 1,
        }
      }),
    )
    setStatusMessage(`Загружен шаблон «${template.name}»`)
  }

  function deleteTemplate(templateId: string) {
    persistTemplates(templates.filter((item) => item.id !== templateId))
    setStatusMessage('Шаблон удалён')
  }

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка студии состава"
        data-testid={testId('teams', 'lineup-studio', 'loader', teamId)}
      />
    )
  }

  return (
    <IceCard padding="m" data-testid={testId('teams', 'lineup-studio', 'card', teamId)}>
      <div className="hockey-stack hockey-stack--gap-16">
        <div className="hockey-stack hockey-stack--gap-8">
          <Text
            variant="header-2"
            className="variable-font-header"
            data-testid={testId('teams', 'lineup-studio', 'text', 'title', teamId)}
          >
            Постановки и шаблоны
          </Text>
          <Text
            color="secondary"
            data-testid={testId('teams', 'lineup-studio', 'text', 'hint', teamId)}
          >
            Собирайте разные схемы (красные/белые/запас), сохраняйте шаблоны и подставляйте их при
            создании тренировки
          </Text>
        </div>

        <div
          className="lineup-board__presets"
          data-testid={testId('teams', 'lineup-studio', 'panel', 'templates', teamId)}
        >
          <input
            className="lineup-board__preset-input"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            placeholder="Название шаблона"
            disabled={!canEdit}
            data-testid={testId('teams', 'lineup-studio', 'field', 'template-name', teamId)}
          />
          <HockeyButton
            size="s"
            disabled={!canEdit || !templateName.trim()}
            onClick={saveTemplate}
            data-testid={testId('teams', 'lineup-studio', 'btn', 'save-template', teamId)}
          >
            Сохранить шаблон
          </HockeyButton>
          <Select
            size="s"
            value={[]}
            placeholder="Загрузить шаблон"
            options={templates.map((item) => ({
              value: item.id,
              content: `${item.name} · ${new Date(item.updatedAt).toLocaleDateString('ru-RU')}`,
            }))}
            onUpdate={(value) => {
              if (value[0]) loadTemplate(String(value[0]))
            }}
            data-testid={testId('teams', 'lineup-studio', 'select', 'load-template', teamId)}
          />
        </div>

        {templates.length > 0 && (
          <div
            className="hockey-row hockey-row--gap-8 hockey-row--wrap"
            data-testid={testId('teams', 'lineup-studio', 'list', 'templates', teamId)}
          >
            {templates.map((item) => (
              <div
                key={item.id}
                className="hockey-row hockey-row--gap-6"
                data-testid={testId('teams', 'lineup-studio', 'row', 'template', item.id)}
              >
                <HockeyButton
                  size="s"
                  view="outlined"
                  onClick={() => loadTemplate(item.id)}
                  data-testid={testId('teams', 'lineup-studio', 'btn', 'apply', item.id)}
                >
                  {item.name}
                </HockeyButton>
                {canEdit && (
                  <HockeyButton
                    size="s"
                    view="flat"
                    onClick={() => deleteTemplate(item.id)}
                    data-testid={testId('teams', 'lineup-studio', 'btn', 'delete', item.id)}
                  >
                    ✕
                  </HockeyButton>
                )}
              </div>
            ))}
          </div>
        )}

        <LineupRinkPreview
          assignments={assignments}
          canEdit={canEdit}
          testIdPrefix="lineup-studio"
          onDropToBench={(userId) => updatePlayer(userId, {side: 'bench'})}
          onDropToSlot={(userId, slot) =>
            updatePlayer(userId, {
              side: slot.side,
              position: slot.position,
              line: slot.line,
            })
          }
        />

        {statusMessage && (
          <Text
            color="secondary"
            data-testid={testId('teams', 'lineup-studio', 'text', 'status', teamId)}
          >
            {statusMessage}
          </Text>
        )}
      </div>
    </IceCard>
  )
}
