/**
 * HOCFRONT-10 / HOCFRONT-25 — NHL-style табло расстановки (downstize)
 * SPEC-FR-21.1.6, SPEC-FR-21.1.7, SPEC-FR-24.3.2
 */

import {Button, Select, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {type DragEvent, useRef, useState} from 'react'

import type {ClubSquad} from '@/entities/club'
import type {PlayerPosition} from '@/entities/common'
import type {TrainingLineupAssignment} from '@/entities/team'
import {
  fetchTeamRoster,
  fetchTeamTrainingEvents,
  fetchTrainingLineup,
  updateTrainingLineup,
} from '@/entities/team'
import {FifaPlayerCardModal} from '@/features/teams/ui/FifaPlayerCardModal'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

type TeamSide = 'red' | 'white'

type FormationTemplateId = 'balanced' | 'red_pressing' | 'white_counter'

type SavedLineupPreset = {
  id: string
  name: string
  updatedAt: string
  assignments: TrainingLineupAssignment[]
}

let nextPresetSequence = 1

function createSavedLineupPreset(
  name: string,
  assignments: TrainingLineupAssignment[],
): SavedLineupPreset {
  return {
    id: `preset-${nextPresetSequence++}`,
    name,
    updatedAt: new Date().toISOString(),
    assignments,
  }
}

type RinkSlot = {
  id: string
  side: TeamSide
  position: PlayerPosition
  line: number
  x: number
  y: number
  label: string
}

/** Слоты как на NHL-табло: G / LD·RD / LW·C·RW */
const RINK_SLOTS: RinkSlot[] = [
  {id: 'red-goalie-1', side: 'red', position: 'goalie', line: 1, x: 8, y: 50, label: 'G'},
  {id: 'red-defense-1', side: 'red', position: 'defense', line: 1, x: 24, y: 30, label: 'LD'},
  {id: 'red-defense-2', side: 'red', position: 'defense', line: 2, x: 24, y: 70, label: 'RD'},
  {id: 'red-forward-1', side: 'red', position: 'forward', line: 1, x: 40, y: 25, label: 'LW'},
  {id: 'red-forward-2', side: 'red', position: 'forward', line: 2, x: 40, y: 50, label: 'C'},
  {id: 'red-forward-3', side: 'red', position: 'forward', line: 3, x: 40, y: 75, label: 'RW'},
  {id: 'white-goalie-1', side: 'white', position: 'goalie', line: 1, x: 92, y: 50, label: 'G'},
  {id: 'white-defense-1', side: 'white', position: 'defense', line: 1, x: 76, y: 30, label: 'LD'},
  {id: 'white-defense-2', side: 'white', position: 'defense', line: 2, x: 76, y: 70, label: 'RD'},
  {id: 'white-forward-1', side: 'white', position: 'forward', line: 1, x: 60, y: 25, label: 'LW'},
  {id: 'white-forward-2', side: 'white', position: 'forward', line: 2, x: 60, y: 50, label: 'C'},
  {id: 'white-forward-3', side: 'white', position: 'forward', line: 3, x: 60, y: 75, label: 'RW'},
]

const FORMATION_TEMPLATES: Record<FormationTemplateId, {label: string; slotOrder: string[]}> = {
  balanced: {
    label: 'Баланс',
    slotOrder: [
      'red-goalie-1',
      'white-goalie-1',
      'red-defense-1',
      'white-defense-1',
      'red-defense-2',
      'white-defense-2',
      'red-forward-1',
      'white-forward-1',
      'red-forward-2',
      'white-forward-2',
      'red-forward-3',
      'white-forward-3',
    ],
  },
  red_pressing: {
    label: 'Прессинг красных',
    slotOrder: [
      'red-goalie-1',
      'red-defense-1',
      'red-defense-2',
      'red-forward-1',
      'red-forward-2',
      'red-forward-3',
      'white-goalie-1',
      'white-defense-1',
      'white-defense-2',
      'white-forward-1',
      'white-forward-2',
      'white-forward-3',
    ],
  },
  white_counter: {
    label: 'Контратаки белых',
    slotOrder: [
      'white-goalie-1',
      'white-defense-1',
      'white-defense-2',
      'white-forward-1',
      'white-forward-2',
      'white-forward-3',
      'red-goalie-1',
      'red-defense-1',
      'red-defense-2',
      'red-forward-1',
      'red-forward-2',
      'red-forward-3',
    ],
  },
}

export interface TrainingLineupBoardProps {
  teamId: string
  canEdit: boolean
  activeSquad?: ClubSquad | null
}

export function TrainingLineupBoard({teamId, canEdit, activeSquad}: TrainingLineupBoardProps) {
  const queryClient = useQueryClient()
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [presetName, setPresetName] = useState('')
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null)
  const rinkRef = useRef<HTMLDivElement>(null)

  const {data: trainingEvents = [], isLoading: eventsLoading} = useQuery({
    queryKey: ['team-training-events', teamId],
    queryFn: () => fetchTeamTrainingEvents(teamId),
  })

  const eventId = trainingEvents[0]?.id

  const storageKey = `training-lineup-presets:${teamId}:${eventId ?? 'none'}:${activeSquad?.id ?? 'team'}`
  const [savedPresets, setSavedPresets] = useState<SavedLineupPreset[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw) as SavedLineupPreset[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const {data: roster = []} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const {data: lineup = [], isLoading: lineupLoading} = useQuery({
    queryKey: ['training-lineup', teamId, eventId],
    queryFn: () => fetchTrainingLineup(teamId, eventId!),
    enabled: Boolean(eventId),
  })

  const saveMutation = useMutation({
    mutationFn: (assignments: TrainingLineupAssignment[]) =>
      updateTrainingLineup(teamId, eventId!, assignments),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['training-lineup', teamId, eventId]})
    },
  })

  if (eventsLoading || lineupLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка раскладки"
        testIdPrefix="teams"
        data-testid={testId('teams', 'training-lineup-board', 'loader', teamId)}
      />
    )
  }

  if (!eventId) {
    return (
      <IceCard
        padding="m"
        data-testid={testId('teams', 'training-lineup-board', 'card', 'empty', teamId)}
      >
        <Text
          color="secondary"
          data-testid={testId('teams', 'training-lineup-board', 'text', 'no-events', teamId)}
        >
          Нет предстоящих тренировок для раскладки.
        </Text>
      </IceCard>
    )
  }

  const activeRoster = roster.filter((m) => m.rosterStatus !== 'removed')
  const lineupEditableForSquad = !activeSquad?.teamId || activeSquad.teamId === teamId

  function getAssignment(userId: string): TrainingLineupAssignment {
    return (
      lineup.find((a) => a.userId === userId) ?? {
        eventId,
        userId,
        position: activeRoster.find((m) => m.userId === userId)?.position ?? 'forward',
        side: 'backlog',
        line: 1,
      }
    )
  }

  const composedAssignments = activeRoster.map((member) => getAssignment(member.userId))

  function saveAssignments(next: TrainingLineupAssignment[]) {
    saveMutation.mutate(next)
  }

  function persistPresets(next: SavedLineupPreset[]) {
    setSavedPresets(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // noop
    }
  }

  function updateAssignment(userId: string, patch: Partial<TrainingLineupAssignment>) {
    const next = composedAssignments.map((current) => {
      if (current.userId !== userId) return current
      return {...current, ...patch, eventId, userId}
    })
    saveAssignments(next)
  }

  function assignToTeam(userId: string, side: TeamSide) {
    const current = getAssignment(userId)
    updateAssignment(userId, {side, line: current.line ?? 1})
  }

  function applyTemplate(templateId: FormationTemplateId) {
    if (!canEdit || !lineupEditableForSquad) return
    const template = FORMATION_TEMPLATES[templateId]
    const slotById = new Map(RINK_SLOTS.map((slot) => [slot.id, slot]))
    const playersPool = [...activeRoster]
    const usedUserIds = new Set<string>()
    const nextAssignments: TrainingLineupAssignment[] = []

    function pickPlayer(position: PlayerPosition): string | null {
      const exact = playersPool.find(
        (player) => !usedUserIds.has(player.userId) && player.position === position,
      )
      if (exact) return exact.userId
      const fallback = playersPool.find((player) => !usedUserIds.has(player.userId))
      return fallback?.userId ?? null
    }

    for (const slotId of template.slotOrder) {
      const slot = slotById.get(slotId)
      if (!slot) continue
      const userId = pickPlayer(slot.position)
      if (!userId) continue
      usedUserIds.add(userId)
      nextAssignments.push({
        eventId,
        userId,
        side: slot.side,
        position: slot.position,
        line: slot.line,
      })
    }

    for (const player of playersPool) {
      if (usedUserIds.has(player.userId)) continue
      nextAssignments.push({
        eventId,
        userId: player.userId,
        side: 'bench',
        position: player.position,
        line: 1,
      })
    }
    saveAssignments(nextAssignments)
  }

  function savePreset() {
    if (!canEdit || !lineupEditableForSquad) return
    const normalizedName = presetName.trim()
    if (!normalizedName) return
    const preset = createSavedLineupPreset(normalizedName, composedAssignments)
    persistPresets([preset, ...savedPresets].slice(0, 12))
    setPresetName('')
  }

  function loadPreset(presetId: string) {
    const preset = savedPresets.find((item) => item.id === presetId)
    if (!preset) return
    const byUserId = new Map(preset.assignments.map((a) => [a.userId, a]))
    const next = activeRoster.map((player) => {
      const fromPreset = byUserId.get(player.userId)
      if (fromPreset) return {...fromPreset, eventId, userId: player.userId}
      return {
        eventId,
        userId: player.userId,
        side: 'backlog' as const,
        position: player.position,
        line: 1,
      }
    })
    saveAssignments(next)
  }

  function onDragStart(userId: string, event: DragEvent<HTMLElement>) {
    if (!canEdit || !lineupEditableForSquad) return
    setDraggedPlayerId(userId)
    event.dataTransfer.setData('text/user-id', userId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function onDragEnd() {
    setDraggedPlayerId(null)
    setActiveDropZone(null)
  }

  function applyDrop(
    target: {side: TrainingLineupAssignment['side']; position?: PlayerPosition; line?: number},
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault()
    setActiveDropZone(null)
    setDraggedPlayerId(null)
    if (!canEdit || !lineupEditableForSquad) return
    const userId = event.dataTransfer.getData('text/user-id')
    if (!userId) return

    const current = getAssignment(userId)
    updateAssignment(userId, {
      side: target.side,
      position: target.position ?? current.position,
      line: target.line ?? current.line ?? 1,
    })
  }

  const rosterWithAssignments = activeRoster.map((member) => {
    const assignment = getAssignment(member.userId)
    return {member, assignment}
  })

  const backlogPlayers = rosterWithAssignments.filter((item) => item.assignment.side === 'backlog')
  const benchPlayers = rosterWithAssignments.filter((item) => item.assignment.side === 'bench')

  function playerForRinkSlot(slot: RinkSlot) {
    return rosterWithAssignments.find(
      ({assignment}) =>
        assignment.side === slot.side &&
        assignment.position === slot.position &&
        (assignment.line ?? 1) === slot.line,
    )
  }

  const selectedPlayer = selectedPlayerId
    ? rosterWithAssignments.find((item) => item.member.userId === selectedPlayerId)
    : null

  const trainingTitle = trainingEvents[0]?.title ?? 'Тренировка'

  return (
    <IceCard padding="m" data-testid={testId('teams', 'training-lineup-board', 'card', teamId)}>
      <div className="lineup-board hockey-stack hockey-stack--gap-12">
        <div className="lineup-board__header">
          <div className="lineup-board__title-row">
            <Text
              variant="header-2"
              data-testid={testId('teams', 'training-lineup-board', 'text', 'title', teamId)}
            >
              Табло состава
            </Text>
            <Text
              color="secondary"
              data-testid={testId('teams', 'training-lineup-board', 'text', 'event', teamId)}
            >
              {trainingTitle} · перетащите карточки
            </Text>
          </div>
          {activeSquad && (
            <Text
              color="secondary"
              data-testid={testId('teams', 'training-lineup-board', 'text', 'squad', teamId)}
            >
              Состав: {activeSquad.name}
            </Text>
          )}
        </div>

        <div
          className="lineup-board__templates"
          data-testid={testId('teams', 'training-lineup-board', 'panel', 'templates', teamId)}
        >
          <Text
            color="secondary"
            data-testid={testId(
              'teams',
              'training-lineup-board',
              'text',
              'templates-label',
              teamId,
            )}
          >
            Шаблоны:
          </Text>
          {(['balanced', 'red_pressing', 'white_counter'] as const).map((templateId) => (
            <Button
              key={templateId}
              size="s"
              view="outlined"
              disabled={!canEdit || !lineupEditableForSquad}
              onClick={() => applyTemplate(templateId)}
              data-testid={testId(
                'teams',
                'training-lineup-board',
                'btn',
                'template',
                templateId,
                teamId,
              )}
            >
              {FORMATION_TEMPLATES[templateId].label}
            </Button>
          ))}
        </div>

        <div
          className="lineup-board__presets"
          data-testid={testId('teams', 'training-lineup-board', 'panel', 'presets', teamId)}
        >
          <input
            className="lineup-board__preset-input"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="Название пресета"
            data-testid={testId('teams', 'training-lineup-board', 'field', 'preset-name', teamId)}
          />
          <Button
            size="s"
            view="outlined"
            disabled={!canEdit || !lineupEditableForSquad || !presetName.trim()}
            onClick={savePreset}
            data-testid={testId('teams', 'training-lineup-board', 'btn', 'save-preset', teamId)}
          >
            Сохранить
          </Button>
          <Select
            size="s"
            value={[]}
            placeholder="Загрузить пресет"
            options={savedPresets.map((preset) => ({
              value: preset.id,
              content: `${preset.name} · ${new Date(preset.updatedAt).toLocaleDateString('ru-RU')}`,
            }))}
            onUpdate={(value) => {
              if (!value[0]) return
              loadPreset(String(value[0]))
            }}
            data-testid={testId('teams', 'training-lineup-board', 'select', 'load-preset', teamId)}
          />
        </div>

        <div
          className="lineup-board__rink-wrap"
          data-testid={testId('teams', 'training-lineup-board', 'panel', 'rink', teamId)}
        >
          <div
            className="lineup-board__rink"
            ref={rinkRef}
            data-testid={testId('teams', 'training-lineup-board', 'map', teamId)}
          >
            <div className="lineup-board__rink-center-line" />
            <div className="lineup-board__rink-zone lineup-board__rink-zone--red" />
            <div className="lineup-board__rink-zone lineup-board__rink-zone--white" />

            {RINK_SLOTS.map((slot) => {
              const slotPlayer = playerForRinkSlot(slot)
              const zoneId = `rink-${slot.id}`
              const isDropActive = activeDropZone === zoneId
              const isSelected = selectedPlayerId === slotPlayer?.member.userId
              const isDragged = draggedPlayerId === slotPlayer?.member.userId

              return (
                <div
                  key={slot.id}
                  className={`lineup-board__rink-slot ${isDropActive ? 'is-drop-active' : ''}`}
                  style={{left: `${slot.x}%`, top: `${slot.y}%`}}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnter={() => setActiveDropZone(zoneId)}
                  onDragLeave={() => setActiveDropZone((prev) => (prev === zoneId ? null : prev))}
                  onDrop={(event) =>
                    applyDrop({side: slot.side, position: slot.position, line: slot.line}, event)
                  }
                  data-testid={testId(
                    'teams',
                    'training-lineup-board',
                    'cell',
                    'rink-slot',
                    slot.id,
                  )}
                >
                  {slotPlayer ? (
                    <div
                      role="button"
                      tabIndex={0}
                      draggable={canEdit && lineupEditableForSquad}
                      onDragStart={(event) => onDragStart(slotPlayer.member.userId, event)}
                      onDragEnd={onDragEnd}
                      onClick={() => setSelectedPlayerId(slotPlayer.member.userId)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedPlayerId(slotPlayer.member.userId)
                        }
                      }}
                      className={`lineup-board__player-card lineup-board__player-card--${slot.side} ${isSelected ? 'is-selected' : ''} ${isDragged ? 'is-dragged' : ''}`}
                      data-testid={testId(
                        'teams',
                        'training-lineup-board',
                        'item',
                        'player-card',
                        slotPlayer.member.userId,
                      )}
                    >
                      <div className="lineup-board__player-number">
                        {slotPlayer.member.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="lineup-board__player-info">
                        <span
                          className="lineup-board__player-name"
                          data-testid={testId(
                            'teams',
                            'training-lineup-board',
                            'text',
                            'player-name',
                            slotPlayer.member.userId,
                          )}
                        >
                          {slotPlayer.member.displayName.split(' ').pop() ??
                            slotPlayer.member.displayName}
                        </span>
                        <span className="lineup-board__player-position">{slot.label}</span>
                      </div>
                      {slotPlayer.member.teamRole === 'captain' && (
                        <span className="lineup-board__player-captain">C</span>
                      )}
                    </div>
                  ) : (
                    <div
                      className="lineup-board__rink-empty"
                      data-testid={testId(
                        'teams',
                        'training-lineup-board',
                        'empty',
                        'rink-slot',
                        slot.id,
                      )}
                    >
                      <span className="lineup-board__rink-empty-label">{slot.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="lineup-board__legend">
            <div className="lineup-board__legend-item">
              <span className="lineup-board__legend-dot lineup-board__legend-dot--red" />
              <Text color="secondary">Красные</Text>
            </div>
            <div className="lineup-board__legend-item">
              <span className="lineup-board__legend-dot lineup-board__legend-dot--white" />
              <Text color="secondary">Белые</Text>
            </div>
          </div>
        </div>

        {selectedPlayer && canEdit && lineupEditableForSquad && (
          <div
            className="lineup-board__player-detail-actions hockey-row hockey-row--gap-8"
            data-testid={testId(
              'teams',
              'training-lineup-board',
              'panel',
              'player-actions',
              selectedPlayer.member.userId,
            )}
          >
            <Text color="secondary">{selectedPlayer.member.displayName}:</Text>
            <Button
              size="s"
              view="outlined"
              onClick={() => assignToTeam(selectedPlayer.member.userId, 'red')}
              data-testid={testId(
                'teams',
                'training-lineup-board',
                'btn',
                'detail-red',
                selectedPlayer.member.userId,
              )}
            >
              В красные
            </Button>
            <Button
              size="s"
              view="outlined"
              onClick={() => assignToTeam(selectedPlayer.member.userId, 'white')}
              data-testid={testId(
                'teams',
                'training-lineup-board',
                'btn',
                'detail-white',
                selectedPlayer.member.userId,
              )}
            >
              В белые
            </Button>
            <Button
              size="s"
              view="outlined"
              onClick={() => updateAssignment(selectedPlayer.member.userId, {side: 'bench'})}
              data-testid={testId(
                'teams',
                'training-lineup-board',
                'btn',
                'detail-bench',
                selectedPlayer.member.userId,
              )}
            >
              На скамейку
            </Button>
          </div>
        )}

        <FifaPlayerCardModal
          open={Boolean(selectedPlayerId)}
          userId={selectedPlayerId}
          displayNameFallback={selectedPlayer?.member.displayName}
          positionFallback={selectedPlayer?.member.position}
          onClose={() => setSelectedPlayerId(null)}
        />

        <div
          className="lineup-board__utility"
          data-testid={testId('teams', 'training-lineup-board', 'panel', 'utility', teamId)}
        >
          <div className="lineup-board__utility-section">
            <Text
              variant="subheader-2"
              data-testid={testId('teams', 'training-lineup-board', 'text', 'bench-title', teamId)}
            >
              Запасные / скамейка ({benchPlayers.length})
            </Text>
            <ul
              className={`lineup-board__list ${activeDropZone === 'bench' ? 'is-drop-active' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setActiveDropZone('bench')}
              onDragLeave={() => setActiveDropZone((prev) => (prev === 'bench' ? null : prev))}
              onDrop={(event) => applyDrop({side: 'bench'}, event)}
              data-testid={testId('teams', 'training-lineup-board', 'list', 'bench', teamId)}
            >
              {benchPlayers.length === 0 && (
                <li className="lineup-board__list-empty">
                  <Text color="secondary">Пусто</Text>
                </li>
              )}
              {benchPlayers.map(({member}) => (
                <li
                  key={member.userId}
                  className="lineup-board__list-item"
                  draggable={canEdit && lineupEditableForSquad}
                  onDragStart={(event) => onDragStart(member.userId, event)}
                  onDragEnd={onDragEnd}
                  data-testid={testId(
                    'teams',
                    'training-lineup-board',
                    'row',
                    'bench',
                    member.userId,
                  )}
                >
                  <Text>{member.displayName}</Text>
                  <Text color="secondary">{member.position}</Text>
                </li>
              ))}
            </ul>
          </div>

          <div className="lineup-board__utility-section">
            <Text
              variant="subheader-2"
              data-testid={testId(
                'teams',
                'training-lineup-board',
                'text',
                'backlog-title',
                teamId,
              )}
            >
              Без назначения ({backlogPlayers.length})
            </Text>
            <ul
              className={`lineup-board__list ${activeDropZone === 'backlog' ? 'is-drop-active' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setActiveDropZone('backlog')}
              onDragLeave={() => setActiveDropZone((prev) => (prev === 'backlog' ? null : prev))}
              onDrop={(event) => applyDrop({side: 'backlog'}, event)}
              data-testid={testId('teams', 'training-lineup-board', 'list', 'backlog', teamId)}
            >
              {backlogPlayers.length === 0 && (
                <li className="lineup-board__list-empty">
                  <Text color="secondary">Пусто</Text>
                </li>
              )}
              {backlogPlayers.map(({member}) => (
                <li
                  key={member.userId}
                  className="lineup-board__list-item"
                  draggable={canEdit && lineupEditableForSquad}
                  onDragStart={(event) => onDragStart(member.userId, event)}
                  onDragEnd={onDragEnd}
                  data-testid={testId(
                    'teams',
                    'training-lineup-board',
                    'row',
                    'backlog',
                    member.userId,
                  )}
                >
                  <Text>{member.displayName}</Text>
                  <Text color="secondary">{member.position}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {canEdit && lineupEditableForSquad && (
          <Button
            view="action"
            loading={saveMutation.isPending}
            onClick={() => saveAssignments(composedAssignments)}
            data-testid={testId('teams', 'training-lineup-board', 'btn', 'save', teamId)}
          >
            Сохранить расстановку
          </Button>
        )}
      </div>
    </IceCard>
  )
}
