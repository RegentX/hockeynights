/**
 * SPEC-FR-2.1.2, SPEC-FR-25.1.2
 * Выбор демо-роли после входа или регистрации.
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {useNavigate} from 'react-router-dom'
import {selectPersona} from '@/features/auth/api/sessionApi'
import {PERSONA_PRESETS, type PersonaPreset} from '@/features/auth/personaPresets'
import {getPersonaHomePath} from '@/features/access/navigationAccess'
import type {AvailablePersona} from '@/entities/auth/types'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface PersonaSelectionProps {
  isSwitching?: boolean
  onBackToCredentials?: () => void
}

function toPersonaPreset(persona: AvailablePersona): PersonaPreset | undefined {
  return PERSONA_PRESETS.find((preset) => preset.id === persona.id)
}

export function PersonaSelection({isSwitching = false, onBackToCredentials}: PersonaSelectionProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {data: authLogin} = useQuery<{userId: string; availablePersonas: AvailablePersona[]}>({
    queryKey: ['auth-login'],
    enabled: false,
  })

  const personas = authLogin?.availablePersonas ?? PERSONA_PRESETS

  const personaMutation = useMutation({
    mutationFn: (preset: PersonaPreset) => selectPersona({personaId: preset.id}),
    onSuccess: (nextSession) => {
      queryClient.setQueryData(['session'], nextSession)
      void queryClient.invalidateQueries({queryKey: ['session']})
      const homePath = nextSession.homePath ?? getPersonaHomePath(nextSession)
      navigate(homePath, {replace: true})
    },
  })

  function selectPersonaCard(persona: AvailablePersona) {
    const preset = toPersonaPreset(persona)
    if (!preset) {
      console.warn(`[PersonaSelection] Unknown persona id: ${persona.id}`)
      return
    }
    personaMutation.mutate(preset)
  }

  return (
    <section
      className="auth-form auth-form--personas"
      aria-label="Выбор роли"
      data-testid={testId('auth', 'login', 'panel', 'personas')}
    >
      <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'personas-title')}>
        Выберите демо-роль
      </Text>
      <Text color="secondary" data-testid={testId('auth', 'login', 'text', 'personas-hint')}>
        Каждая карточка открывает свой режим интерфейса. Выбор сохранится после обновления страницы.
      </Text>

      <div className="persona-card-grid" data-testid={testId('auth', 'login', 'grid', 'personas')}>
        {personas.map((persona) => {
          const known = Boolean(toPersonaPreset(persona))
          return (
          <button
            key={persona.id}
            type="button"
            className="persona-card"
            aria-label={`${persona.title}. ${persona.description}. ${persona.destination}`}
            disabled={personaMutation.isPending || !known}
            onClick={() => selectPersonaCard(persona)}
            data-testid={testId('auth', 'login', 'btn', persona.id)}
          >
            <span className="persona-card__icon" aria-hidden>
              {persona.icon}
            </span>
            <span className="persona-card__title">{persona.title}</span>
            <span className="persona-card__description">{persona.description}</span>
            <span className="persona-card__destination">→ {persona.destination}</span>
          </button>
          )
        })}
      </div>

      {!isSwitching && onBackToCredentials && (
        <HockeyButton
          view="flat"
          size="s"
          onClick={onBackToCredentials}
          data-testid={testId('auth', 'login', 'btn', 'back-credentials')}
        >
          Назад
        </HockeyButton>
      )}
    </section>
  )
}
