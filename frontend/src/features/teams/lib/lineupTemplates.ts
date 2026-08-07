/**
 * HOCFRONT-25 — шаблоны постановок игроков на уровне команды
 */

import type {TrainingDraftAssignment, TrainingLineupAssignment} from '@/entities/team'

export type TeamLineupTemplateAssignment = Pick<
  TrainingLineupAssignment,
  'userId' | 'position' | 'side' | 'line'
> & {displayName?: string}

export interface TeamLineupTemplate {
  id: string
  name: string
  updatedAt: string
  assignments: TeamLineupTemplateAssignment[]
}

const PREFIX = 'team-lineup-templates:'

function storageKey(teamId: string): string {
  return `${PREFIX}${teamId}`
}

export function loadTeamLineupTemplates(teamId: string): TeamLineupTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(teamId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as TeamLineupTemplate[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTeamLineupTemplates(teamId: string, templates: TeamLineupTemplate[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(teamId), JSON.stringify(templates.slice(0, 20)))
  } catch {
    // noop
  }
}

export function createTeamLineupTemplate(
  name: string,
  assignments: TeamLineupTemplateAssignment[],
): TeamLineupTemplate {
  return {
    id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    updatedAt: new Date().toISOString(),
    assignments,
  }
}

export function draftAssignmentsFromTemplate(
  template: TeamLineupTemplate,
  rosterNames: Map<string, string>,
): TrainingDraftAssignment[] {
  return template.assignments
    .filter((item) => item.side === 'red' || item.side === 'white' || item.side === 'bench')
    .map((item) => ({
      userId: item.userId,
      displayName: item.displayName ?? rosterNames.get(item.userId) ?? item.userId,
      position: item.position,
      side: item.side as TrainingDraftAssignment['side'],
      line: item.line ?? 1,
    }))
}
