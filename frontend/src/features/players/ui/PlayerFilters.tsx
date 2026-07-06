/**
 * SPEC-FR-2.3.2
 */

import {Checkbox, Select, TextInput} from '@gravity-ui/uikit'

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {PlayersFilterParams} from '@/entities/profile'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-2.3.2 - Props фильтров игроков */
export interface PlayerFiltersProps {
  /** @spec SPEC-FR-2.3.2 */
  filters: PlayersFilterParams
  /** @spec SPEC-FR-2.3.2 */
  onChange: (filters: PlayersFilterParams) => void
}

const POSITION_OPTIONS = [
  {value: '', content: 'Все амплуа'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

const SKILL_OPTIONS = [
  {value: '', content: 'Все уровни'},
  {value: 'beginner', content: 'Дебютант'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
]

/**
 * @spec SPEC-FR-2.3.2 - Фильтры по амплуа, уровню, району и роли вратаря
 */
export function PlayerFilters({filters, onChange}: PlayerFiltersProps) {
  return (
    <div
      className="hockey-grid hockey-grid--filters"
      data-testid={testId('players', 'player-filters', 'form')}
    >
      <Select
        label="Амплуа"
        value={[filters.position ?? '']}
        onUpdate={(v) =>
          onChange({...filters, position: (v[0] || undefined) as PlayerPosition | undefined})
        }
        options={POSITION_OPTIONS}
        data-testid={testId('players', 'player-filters', 'select', 'position')}
      />
      <Select
        label="Уровень"
        value={[filters.skillLevel ?? '']}
        onUpdate={(v) =>
          onChange({...filters, skillLevel: (v[0] || undefined) as SkillLevel | undefined})
        }
        options={SKILL_OPTIONS}
        data-testid={testId('players', 'player-filters', 'select', 'skill-level')}
      />
      <TextInput
        label="Район"
        value={filters.district ?? ''}
        onUpdate={(v) => onChange({...filters, district: v || undefined})}
        data-testid={testId('players', 'player-filters', 'field', 'district')}
      />
      <Checkbox
        checked={Boolean(filters.goalieOnly)}
        onUpdate={(checked) => onChange({...filters, goalieOnly: checked})}
        content="Только вратари"
        data-testid={testId('players', 'player-filters', 'checkbox', 'goalie-only')}
      />
    </div>
  )
}
