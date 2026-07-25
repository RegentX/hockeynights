/**
 * SPEC-UI-2.3
 */

import {Text} from '@gravity-ui/uikit'

import {testId} from '@/shared/testing/testId'

/** @spec SPEC-UI-2.3 - Props шеврона команды */
export interface TeamCrestProps {
  /** @spec SPEC-FR-3.1.1 */
  name: string
  /** @spec SPEC-FR-3.1.1 */
  city?: string
  /** @spec SPEC-FR-3.1.1 */
  skillLevel?: string
  teamId?: string
  /** HOCFRONT-25 — логотип вместо шеврона */
  logoUrl?: string
}

/**
 * @spec SPEC-UI-2.3 - Шеврон команды в стиле раздевалки
 */
export function TeamCrest({name, city, skillLevel, teamId, logoUrl}: TeamCrestProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const crestId = teamId ?? name

  return (
    <div className="team-crest" data-testid={testId('teams', 'team-crest', 'card', crestId)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="team-crest__logo"
          data-testid={testId('teams', 'team-crest', 'img', 'logo', crestId)}
        />
      ) : (
        <div
          className="team-crest__chevron"
          aria-hidden
          data-testid={testId('teams', 'team-crest', 'icon', crestId)}
        >
          {initial}
        </div>
      )}
      <div>
        <Text
          variant="subheader-2"
          data-testid={testId('teams', 'team-crest', 'text', 'name', crestId)}
        >
          {name}
        </Text>
        {(city || skillLevel) && (
          <Text
            color="secondary"
            data-testid={testId('teams', 'team-crest', 'text', 'meta', crestId)}
          >
            {[city, skillLevel].filter(Boolean).join(' · ')}
          </Text>
        )}
      </div>
    </div>
  )
}
