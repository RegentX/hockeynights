/**
 * SPEC-FR-2.1.2, SPEC-FR-25.1.2
 * Выбор демо-роли после входа или регистрации.
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import type {AuthLoginResponse, AvailablePersona} from '@/entities/auth'
import {fetchSession, selectPersona} from '@/entities/auth'
import type {HockeyProfile} from '@/entities/profile'
import {getPersonaHomePath} from '@/features/access'
import {PERSONA_PRESETS, type PersonaPreset} from '@/features/auth/lib/personaPresets'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface PersonaSelectionProps {
  isSwitching?: boolean
  onBackToCredentials?: () => void
}

function toPersonaPreset(persona: AvailablePersona): PersonaPreset | undefined {
  return PERSONA_PRESETS.find((preset) => preset.id === persona.id)
}

export function PersonaSelection({
  isSwitching = false,
  onBackToCredentials,
}: PersonaSelectionProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [pendingPersonaId, setPendingPersonaId] = useState<string | null>(null)
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  const personas = useMemo(() => {
    if (isSwitching) {
      return PERSONA_PRESETS
    }
    const cached = queryClient.getQueryData<AuthLoginResponse>(['auth-login'])?.availablePersonas
    return cached?.length ? cached : PERSONA_PRESETS
  }, [isSwitching, queryClient])

  const personaMutation = useMutation({
    mutationFn: (preset: PersonaPreset) => selectPersona({personaId: preset.id}),
    onSuccess: (nextSession) => {
      setError(null)
      setPendingPersonaId(null)
      queryClient.setQueryData(['session'], nextSession)
      queryClient.setQueryData(['profile'], (prev: HockeyProfile | undefined) =>
        prev
          ? {
              ...prev,
              fullName: nextSession.user.displayName,
              userId: nextSession.user.id,
            }
          : prev,
      )
      void queryClient.invalidateQueries({queryKey: ['profile']})
      void queryClient.invalidateQueries({queryKey: ['profile-settings']})
      const homePath = nextSession.homePath ?? getPersonaHomePath(nextSession)
      navigate(homePath, {replace: true})
    },
    onError: (err: Error) => {
      setPendingPersonaId(null)
      setError(err.message || 'Не удалось сохранить выбранную роль')
    },
  })

  function selectPersonaCard(persona: AvailablePersona) {
    const preset = toPersonaPreset(persona)
    if (!preset) {
      setError(`Неизвестная роль: ${persona.title}`)
      return
    }
    setError(null)
    setPendingPersonaId(persona.id)
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
          const isCurrent = session?.personaId === persona.id
          const isPending = pendingPersonaId === persona.id
          return (
            <button
              key={persona.id}
              type="button"
              className={[
                'persona-card',
                isCurrent ? 'persona-card--current' : '',
                isPending ? 'persona-card--pending' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${persona.title}. ${persona.description}. ${persona.destination}`}
              aria-busy={isPending}
              disabled={personaMutation.isPending}
              onClick={() => selectPersonaCard(persona)}
              data-testid={testId('auth', 'persona', 'btn', persona.id)}
            >
              {isCurrent && (
                <span
                  className="persona-card__badge"
                  data-testid={testId('auth', 'persona', 'badge', 'current')}
                >
                  Текущая
                </span>
              )}
              <span className="persona-card__icon" aria-hidden>
                {persona.icon}
              </span>
              <span className="persona-card__title">{persona.title}</span>
              <span className="persona-card__description">{persona.description}</span>
              <span className="persona-card__destination">
                {isPending ? 'Переключаем…' : `→ ${persona.destination}`}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          className="auth-alert auth-alert--error"
          data-testid={testId('auth', 'login', 'text', 'personas-error')}
        >
          {error}
        </div>
      )}

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
