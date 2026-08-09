/**
 * SPEC-NFR-10 — приложение не должно падать в белый экран
 */

import {Component, type ErrorInfo, type ReactNode} from 'react'

import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

/**
 * Ловит ошибки рендера и показывает экран восстановления вместо
 * пустой белой страницы (React размонтирует всё дерево при исключении).
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {error: null}

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {error}
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[app] Необработанная ошибка рендера:', error, info.componentStack)
  }

  render() {
    const {error} = this.state
    if (!error) return this.props.children

    return (
      <div
        className="hockey-stack hockey-stack--gap-12"
        data-testid={testId('app', 'error-boundary', 'panel')}
      >
        <EmptyNetState
          title="Что-то сломалось"
          copy={error.message || 'Непредвиденная ошибка интерфейса.'}
          action={
            <HockeyButton
              view="outlined"
              size="s"
              onClick={() => window.location.reload()}
              data-testid={testId('app', 'error-boundary', 'btn', 'reload')}
            >
              Перезагрузить
            </HockeyButton>
          }
        />
      </div>
    )
  }
}
