/**
 * SPEC-FR-21.1.6, SPEC-FR-21.1.7
 * SPEC-FR-24.3.2
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Select, Text} from '@gravity-ui/uikit'
import {type DragEvent, useState} from 'react'
import type {TrainingLineupAssignment} from '@/entities/team/types'
import type {ClubSquad} from '@/entities/club/types'
import type {PlayerPosition} from '@/entities/common/types'
import {
  fetchTeamRoster,
  fetchTrainingLineup,
  updateTrainingLineup,
  fetchTeamTrainingEvents,
} from '@/features/teams/api/teamsApi'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const POSITION_OPTIONS = [
  {value: 'goalie', content: 'Вратарь'},
  {value: 'defense', content: 'Защитник'},
  {value: 'forward', content: 'Нападающий'},
]

const LINE_OPTIONS = [
  {value: '1', content: 'Звено 1'},
  {value: '2', content: 'Звено 2'},
  {value: '3', content: 'Звено 3'},
]

const TEAM_SIDES = ['red', 'white'] as const

const FORMATION_SLOTS: Array<{position: PlayerPosition; label: string; slots: number}> = [
  {position: 'goalie', label: 'Вратари', slots: 1},
  {position: 'defense', label: 'Защитники', slots: 2},
  {position: 'forward', label: 'Нападающие', slots: 3},
]

type BoardSlot = {
  id: string
  side: (typeof TEAM_SIDES)[number]
  position: PlayerPosition
  line: number
  x: number
  y: number
  label: string
}

type DropTarget = {
  side: TrainingLineupAssignment['side']
  position?: PlayerPosition
  line?: number
}

type FormationTemplateId = 'balanced' | 'red_pressing' | 'white_counter'

type SavedLineupPreset = {
  id: string
  name: string
  updatedAt: string
  assignments: TrainingLineupAssignment[]
}

const BOARD_SLOTS: BoardSlot[] = [
  {id: 'red-goalie-1', side: 'red', position: 'goalie', line: 1, x: 10, y: 50, label: 'G'},
  {id: 'red-defense-1', side: 'red', position: 'defense', line: 1, x: 28, y: 32, label: 'D1'},
  {id: 'red-defense-2', side: 'red', position: 'defense', line: 2, x: 28, y: 68, label: 'D2'},
  {id: 'red-forward-1', side: 'red', position: 'forward', line: 1, x: 46, y: 25, label: 'F1'},
  {id: 'red-forward-2', side: 'red', position: 'forward', line: 2, x: 46, y: 50, label: 'F2'},
  {id: 'red-forward-3', side: 'red', position: 'forward', line: 3, x: 46, y: 75, label: 'F3'},
  {id: 'white-goalie-1', side: 'white', position: 'goalie', line: 1, x: 90, y: 50, label: 'G'},
  {id: 'white-defense-1', side: 'white', position: 'defense', line: 1, x: 72, y: 32, label: 'D1'},
  {id: 'white-defense-2', side: 'white', position: 'defense', line: 2, x: 72, y: 68, label: 'D2'},
  {id: 'white-forward-1', side: 'white', position: 'forward', line: 1, x: 54, y: 25, label: 'F1'},
  {id: 'white-forward-2', side: 'white', position: 'forward', line: 2, x: 54, y: 50, label: 'F2'},
  {id: 'white-forward-3', side: 'white', position: 'forward', line: 3, x: 54, y: 75, label: 'F3'},
]

const FORMATION_TEMPLATES: Record<
  FormationTemplateId,
  {label: string; slotOrder: string[]}
> = {
  balanced: {
    label: 'Шаблон: баланс',
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
    label: 'Шаблон: прессинг красных',
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
    label: 'Шаблон: контратаки белых',
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

/**
 * @spec SPEC-FR-24.3.2 - Раскладка тренировки: позиции и красные/белые
 */
export function TrainingLineupBoard({teamId, canEdit, activeSquad}: TrainingLineupBoardProps) {
  const queryClient = useQueryClient()
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [presetName, setPresetName] = useState('')

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
    return <ScoreboardLoader label="Загрузка раскладки" />
  }

  if (!eventId) {
    return (
      <IceCard padding="m">
        <Text color="secondary">Нет предстоящих тренировок для раскладки.</Text>
      </IceCard>
    )
  }

  const activeRoster = roster.filter((m) => m.rosterStatus !== 'removed')
  const lineupEditableForSquad =
    !activeSquad?.teamId || activeSquad.teamId === teamId

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

  const lineupWarnings: string[] = []
  for (const side of TEAM_SIDES) {
    for (const slot of FORMATION_SLOTS) {
      const sidePlayers = composedAssignments.filter(
        (a) => a.side === side && a.position === slot.position,
      )
      if (sidePlayers.length > slot.slots) {
        lineupWarnings.push(
          `${side === 'red' ? 'Красные' : 'Белые'}: позиция «${slot.label}» переполнена (${sidePlayers.length}/${slot.slots}).`,
        )
      }
    }
  }
  const occupancy = new Map<string, number>()
  for (const assignment of composedAssignments) {
    if (assignment.side !== 'red' && assignment.side !== 'white') continue
    const key = `${assignment.side}:${assignment.position}:${assignment.line ?? 1}`
    occupancy.set(key, (occupancy.get(key) ?? 0) + 1)
  }
  for (const [key, count] of occupancy.entries()) {
    if (count <= 1) continue
    const [side, position, line] = key.split(':')
    lineupWarnings.push(
      `${side === 'red' ? 'Красные' : 'Белые'}: коллизия в слоте ${position} / звено ${line} (${count} игроков).`,
    )
  }

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

  function assignToTeam(userId: string, side: (typeof TEAM_SIDES)[number]) {
    const current = getAssignment(userId)
    updateAssignment(userId, {side, line: current.line ?? 1})
  }

  function applyTemplate(templateId: FormationTemplateId) {
    if (!canEdit || !lineupEditableForSquad) return
    const template = FORMATION_TEMPLATES[templateId]
    const slotById = new Map(BOARD_SLOTS.map((slot) => [slot.id, slot]))
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
    const preset: SavedLineupPreset = {
      id: `preset-${Date.now()}`,
      name: normalizedName,
      updatedAt: new Date().toISOString(),
      assignments: composedAssignments,
    }
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
    event.dataTransfer.setData('text/user-id', userId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function applyDrop(target: DropTarget, event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setActiveDropZone(null)
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

  function playersForSideAndPosition(
    side: (typeof TEAM_SIDES)[number],
    position: PlayerPosition,
  ) {
    return rosterWithAssignments
      .filter((item) => item.assignment.side === side && item.assignment.position === position)
      .sort((a, b) => (a.assignment.line ?? 1) - (b.assignment.line ?? 1))
  }

  function playerForBoardSlot(slot: BoardSlot) {
    return rosterWithAssignments.find(
      ({assignment}) =>
        assignment.side === slot.side &&
        assignment.position === slot.position &&
        (assignment.line ?? 1) === slot.line,
    )
  }

  const trainingTitle = trainingEvents[0]?.title ?? 'Тренировка'

  return (
    <IceCard padding="m">
      <div className="training-lineup hockey-stack hockey-stack--gap-12">
        <div className="training-lineup__header">
          <Text variant="subheader-2">Раскладка: {trainingTitle}</Text>
          <span className="coach-profile__badge">Тренер</span>
        </div>

        <Text color="secondary">
          {canEdit && lineupEditableForSquad
            ? 'План состава: расставь игроков по позициям, раздели на красных/белых, вынеси в бэклог или на скамейку.'
            : 'Только просмотр. Редактирование доступно тренеру и админам.'}
        </Text>
        {activeSquad && (
          <Text color="secondary">
            Состав: {activeSquad.name}
            {activeSquad.teamId && activeSquad.teamId !== teamId ? ' (не привязан к текущей команде)' : ''}
          </Text>
        )}

        <div className="training-lineup__template-row">
          {(['balanced', 'red_pressing', 'white_counter'] as const).map((templateId) => (
            <Button
              key={templateId}
              size="s"
              view="outlined"
              disabled={!canEdit || !lineupEditableForSquad}
              onClick={() => applyTemplate(templateId)}
            >
              {FORMATION_TEMPLATES[templateId].label}
            </Button>
          ))}
        </div>

        <div className="training-lineup__preset-row">
          <input
            className="training-lineup__preset-input"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="Название пресета (например: 2-3-1)"
          />
          <Button
            size="s"
            view="outlined"
            disabled={!canEdit || !lineupEditableForSquad || !presetName.trim()}
            onClick={savePreset}
          >
            Сохранить пресет
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
          />
        </div>

        {lineupWarnings.length > 0 && (
          <div className="training-lineup__warnings">
            <Text variant="subheader-2">Предупреждения по расстановке</Text>
            <ul className="training-lineup__warning-list">
              {lineupWarnings.map((warning) => (
                <li key={warning}>
                  <Text color="danger">{warning}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="training-lineup__board-wrap">
          <Text variant="subheader-2">Тактическая доска (FIFA-style)</Text>
          <div className="training-lineup__board">
            {BOARD_SLOTS.map((slot) => {
              const slotPlayer = playerForBoardSlot(slot)
              const zoneId = `board-${slot.id}`
              return (
                <div
                  key={slot.id}
                  className={`training-lineup__board-slot ${
                    activeDropZone === zoneId ? 'is-drop-active' : ''
                  }`}
                  style={{left: `${slot.x}%`, top: `${slot.y}%`}}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnter={() => setActiveDropZone(zoneId)}
                  onDragLeave={() => setActiveDropZone((prev) => (prev === zoneId ? null : prev))}
                  onDrop={(event) =>
                    applyDrop(
                      {side: slot.side, position: slot.position, line: slot.line},
                      event,
                    )
                  }
                >
                  {slotPlayer ? (
                    <div
                      draggable={canEdit && lineupEditableForSquad}
                      onDragStart={(event) => onDragStart(slotPlayer.member.userId, event)}
                      className={`training-lineup__board-player training-lineup__board-player--${slot.side}`}
                    >
                      <span>{slotPlayer.member.displayName}</span>
                      <small>{slot.label}</small>
                    </div>
                  ) : (
                    <div className="training-lineup__board-empty">{slot.label}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="training-lineup__sides">
          {TEAM_SIDES.map((side) => (
            <div key={side} className={`training-lineup__side training-lineup__side--${side}`}>
              <Text variant="subheader-2">{side === 'red' ? 'Красные (красные майки)' : 'Белые (белые майки)'}</Text>
              <div className="training-lineup__formation hockey-stack hockey-stack--gap-8">
                {FORMATION_SLOTS.map((slot) => {
                  const players = playersForSideAndPosition(side, slot.position)
                  const missing = Math.max(slot.slots - players.length, 0)
                  return (
                    <div key={`${side}-${slot.position}`} className="training-lineup__formation-slot">
                      <Text color="secondary">
                        {slot.label} · {players.length}/{slot.slots}
                      </Text>
                      <ul className="training-lineup__list">
                        {players.map(({member, assignment}) => (
                          <li key={member.userId} className="training-lineup__row">
                            <Text
                              draggable={canEdit && lineupEditableForSquad}
                              onDragStart={(event) => onDragStart(member.userId, event)}
                              className={canEdit && lineupEditableForSquad ? 'training-lineup__draggable' : undefined}
                            >
                              {member.displayName}
                            </Text>
                            {canEdit && lineupEditableForSquad ? (
                              <div className="training-lineup__controls">
                                <Select
                                  size="s"
                                  value={[String(assignment.line ?? 1)]}
                                  options={LINE_OPTIONS}
                                  onUpdate={(v) =>
                                    updateAssignment(member.userId, {
                                      line: Number(v[0]),
                                    })
                                  }
                                />
                                <Button size="s" view="outlined" onClick={() => updateAssignment(member.userId, {side: 'bench'})}>
                                  Скамейка
                                </Button>
                              </div>
                            ) : (
                              <Text color="secondary">Звено {assignment.line ?? 1}</Text>
                            )}
                          </li>
                        ))}
                        {missing > 0 &&
                          Array.from({length: missing}).map((_, idx) => (
                            <li
                              key={`${slot.position}-empty-${idx}`}
                              className={`training-lineup__row training-lineup__row--empty ${
                                activeDropZone === `${side}-${slot.position}-${idx}` ? 'is-drop-active' : ''
                              }`}
                              onDragOver={(event) => event.preventDefault()}
                              onDragEnter={() => setActiveDropZone(`${side}-${slot.position}-${idx}`)}
                              onDragLeave={() => setActiveDropZone((prev) => (prev === `${side}-${slot.position}-${idx}` ? null : prev))}
                              onDrop={(event) =>
                                applyDrop(
                                  {
                                    side,
                                    position: slot.position,
                                    line: Math.min(slot.slots, idx + 1),
                                  },
                                  event,
                                )
                              }
                            >
                              <Text color="secondary">Свободный слот</Text>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="training-lineup__utility-grid">
          <div className="training-lineup__utility-panel">
            <Text variant="subheader-2">Бэклог игроков</Text>
            <Text color="secondary">Игроки без назначения на красных/белых.</Text>
            <ul
              className={`training-lineup__list ${activeDropZone === 'backlog' ? 'is-drop-active' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setActiveDropZone('backlog')}
              onDragLeave={() => setActiveDropZone((prev) => (prev === 'backlog' ? null : prev))}
              onDrop={(event) => applyDrop({side: 'backlog'}, event)}
            >
              {backlogPlayers.length === 0 && (
                <li className="training-lineup__row training-lineup__row--empty">
                  <Text color="secondary">Бэклог пуст</Text>
                </li>
              )}
              {backlogPlayers.map(({member, assignment}) => (
                <li key={member.userId} className="training-lineup__row">
                  <div
                    draggable={canEdit && lineupEditableForSquad}
                    onDragStart={(event) => onDragStart(member.userId, event)}
                    className={canEdit && lineupEditableForSquad ? 'training-lineup__draggable' : undefined}
                  >
                    <Text>{member.displayName}</Text>
                    <Text color="secondary">{member.position}</Text>
                  </div>
                  {canEdit && lineupEditableForSquad && (
                    <div className="training-lineup__controls">
                      <Select
                        size="s"
                        value={[assignment.position]}
                        options={POSITION_OPTIONS}
                        onUpdate={(v) => updateAssignment(member.userId, {position: v[0] as PlayerPosition})}
                      />
                      <Button size="s" view="outlined" onClick={() => assignToTeam(member.userId, 'red')}>
                        В красные
                      </Button>
                      <Button size="s" view="outlined" onClick={() => assignToTeam(member.userId, 'white')}>
                        В белые
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="training-lineup__utility-panel">
            <Text variant="subheader-2">Скамейка запасных</Text>
            <Text color="secondary">Резерв игроков на тренировку.</Text>
            <ul
              className={`training-lineup__list ${activeDropZone === 'bench' ? 'is-drop-active' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setActiveDropZone('bench')}
              onDragLeave={() => setActiveDropZone((prev) => (prev === 'bench' ? null : prev))}
              onDrop={(event) => applyDrop({side: 'bench'}, event)}
            >
              {benchPlayers.length === 0 && (
                <li className="training-lineup__row training-lineup__row--empty">
                  <Text color="secondary">Скамейка пуста</Text>
                </li>
              )}
              {benchPlayers.map(({member, assignment}) => (
                <li key={member.userId} className="training-lineup__row">
                  <Text
                    draggable={canEdit && lineupEditableForSquad}
                    onDragStart={(event) => onDragStart(member.userId, event)}
                    className={canEdit && lineupEditableForSquad ? 'training-lineup__draggable' : undefined}
                  >
                    {member.displayName}
                  </Text>
                  {canEdit && lineupEditableForSquad ? (
                    <div className="training-lineup__controls">
                      <Button size="s" view="outlined" onClick={() => assignToTeam(member.userId, 'red')}>
                        В красные
                      </Button>
                      <Button size="s" view="outlined" onClick={() => assignToTeam(member.userId, 'white')}>
                        В белые
                      </Button>
                      <Button size="s" view="outlined" onClick={() => updateAssignment(member.userId, {side: 'backlog'})}>
                        В бэклог
                      </Button>
                      <Select
                        size="s"
                        value={[assignment.position]}
                        options={POSITION_OPTIONS}
                        onUpdate={(v) => updateAssignment(member.userId, {position: v[0] as PlayerPosition})}
                      />
                    </div>
                  ) : (
                    <Text color="secondary">{assignment.position}</Text>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {canEdit && lineupEditableForSquad && (
          <Button view="action" loading={saveMutation.isPending} onClick={() => saveAssignments(composedAssignments)}>
            Сохранить план тренировки
          </Button>
        )}
      </div>
    </IceCard>
  )
}
