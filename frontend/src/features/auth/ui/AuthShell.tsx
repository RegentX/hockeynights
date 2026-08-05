/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Оболочка экранов входа и регистрации.
 */

import type {ReactNode} from 'react'
import {NavLink} from 'react-router'

import {testId} from '@/shared/testing/testId'

export type AuthShellMode = 'login' | 'register' | 'personas'

export interface AuthShellProps {
  children: ReactNode
  mode?: AuthShellMode
  showModeTabs?: boolean
  wide?: boolean
}

const HERO_COPY: Record<
  Exclude<AuthShellMode, 'personas'>,
  {tagline: string; bullets: string[]}
> = {
  login: {
    tagline: 'Войдите в хоккейное сообщество — команды, лёд и матчи в одном месте.',
    bullets: ['Демо-вход за 10 секунд', 'Локальные аккаунты в браузере', 'Выбор роли после входа'],
  },
  register: {
    tagline: 'Создайте профиль — данные сохранятся локально до подключения backend.',
    bullets: [
      'Имя и email для вашего аккаунта',
      'Пароль хранится только в браузере',
      'После регистрации — выбор демо-роли',
    ],
  },
}

export function AuthShell({
  children,
  mode = 'login',
  showModeTabs = true,
  wide = false,
}: AuthShellProps) {
  const hero = mode !== 'personas' ? HERO_COPY[mode] : null

  return (
    <div
      className={`auth-shell${wide ? ' auth-shell--wide' : ''}`}
      data-testid={testId('auth', 'shell', 'page')}
    >
      <div className="auth-shell__glow" aria-hidden />
      <div className="auth-shell__frame" data-testid={testId('auth', 'shell', 'panel', 'frame')}>
        {!wide && hero && (
          <aside
            className="auth-shell__hero"
            data-testid={testId('auth', 'shell', 'panel', 'hero')}
          >
            <span
              className="auth-shell__hero-badge"
              data-testid={testId('auth', 'shell', 'text', 'hero-badge')}
            >
              Phase 1 · Demo
            </span>
            <h1
              className="auth-shell__hero-title"
              data-testid={testId('auth', 'shell', 'text', 'hero-title')}
            >
              Hockey Nights
            </h1>
            <p
              className="auth-shell__hero-tagline"
              data-testid={testId('auth', 'shell', 'text', 'hero-tagline')}
            >
              {hero.tagline}
            </p>
            <ul
              className="auth-shell__hero-list"
              data-testid={testId('auth', 'shell', 'list', 'hero-features')}
            >
              {hero.bullets.map((item, index) => (
                <li key={item} data-testid={testId('auth', 'shell', 'list-item', 'hero', index)}>
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="auth-shell__panel" data-testid={testId('auth', 'shell', 'panel', 'main')}>
          {!wide && (
            <h1
              className="auth-shell__mobile-brand"
              data-testid={testId('auth', 'shell', 'text', 'mobile-title')}
            >
              Hockey Nights
            </h1>
          )}

          {!wide && (
            <div
              className="auth-shell__notice"
              data-testid={testId('auth', 'shell', 'text', 'demo-banner')}
            >
              <span
                className="auth-shell__notice-title"
                data-testid={testId('auth', 'shell', 'text', 'notice-title')}
              >
                Локальная память
              </span>
              <span data-testid={testId('auth', 'shell', 'text', 'notice-body')}>
                Аккаунты временно хранятся в браузере. После backend этот слой заменим настоящей
                авторизацией.
              </span>
            </div>
          )}

          {showModeTabs && (
            <nav
              className="auth-tabs auth-tabs--pills"
              aria-label="Вход или регистрация"
              data-testid={testId('auth', 'shell', 'nav', 'mode-tabs')}
            >
              <NavLink
                to="/"
                end
                className={({isActive}) =>
                  `auth-tabs__tab${isActive ? ' auth-tabs__tab--active' : ''}`
                }
                data-testid={testId('auth', 'shell', 'tab', 'login')}
              >
                Вход
              </NavLink>
              <NavLink
                to="/register"
                className={({isActive}) =>
                  `auth-tabs__tab${isActive ? ' auth-tabs__tab--active' : ''}`
                }
                data-testid={testId('auth', 'shell', 'tab', 'register')}
              >
                Регистрация
              </NavLink>
            </nav>
          )}

          <div
            className="auth-shell__content"
            data-testid={testId('auth', 'shell', 'panel', 'content')}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
