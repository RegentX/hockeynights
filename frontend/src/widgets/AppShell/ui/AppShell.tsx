/**
 * SPEC-FR-1.2.1, SPEC-FR-1.2.4
 * SPEC-UI-4.3, SPEC-UI-5.1, SPEC-UI-5.2, SPEC-UI-5.5, SPEC-UI-5.6, SPEC-UI-6.1
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect, useRef, useState} from 'react'
import {Link, Outlet, useLocation, useNavigate} from 'react-router'

import {fetchSession, logoutSession} from '@/entities/auth'
import {fetchChats, getTotalUnreadCount} from '@/entities/messenger'
import {fetchNotifications} from '@/entities/notification'
import {resolveNavItems, shouldUsePartnerWorkspace, splitNavItemsByTier} from '@/features/access'
import {LAUNCH_REGION} from '@/shared/config/geo'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import {routeToTestSlug, testId} from '@/shared/testing/testId'
import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {MobileNav} from '@/widgets/MobileNav'
import {SideBoard} from '@/widgets/SideBoard'

function formatPeriodClock(): string {
  const now = new Date()
  const period = now.getHours() < 12 ? '1-й' : now.getHours() < 18 ? '2-й' : '3-й'
  return `${period} · ${now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`
}

/**
 * @spec SPEC-FR-1.2.1 - Базовый layout приложения
 * @spec SPEC-UI-5.1 - Desktop 3-col layout
 * @spec SPEC-UI-5.2 - Mobile bottom nav
 * HOCFRONT-15: SOS FAB скрыт из MVP-навигации
 */
export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {themeId, toggleTheme} = useHockeyTheme()
  const navRef = useRef<HTMLDivElement>(null)
  const [puckTop, setPuckTop] = useState(0)
  const [periodClock, setPeriodClock] = useState(formatPeriodClock)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)

  const {data: session} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })
  const partnerMemberships = session?.user.partnerMemberships ?? []
  const hasPartnerAccess = partnerMemberships.length > 0 && !shouldUsePartnerWorkspace(session)
  const partnerWorkspace = shouldUsePartnerWorkspace(session)
  const navItems = resolveNavItems(session)
  const {active: activeNavItems, incubating: incubatingNavItems} = splitNavItemsByTier(navItems)

  const {data: notifications = []} = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })
  const {data: chats = []} = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })
  const unreadCount = notifications.filter((n) => !n.readAt).length
  const unreadChatCount = getTotalUnreadCount(chats)
  const isMessengerRoute = location.pathname === '/messenger'
  const isFocusMode = isLeftCollapsed && isRightCollapsed

  const logoutMutation = useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      void queryClient.clear()
      navigate('/')
    },
  })

  function isNavActive(path: string): boolean {
    if (path === '/partner') return location.pathname === '/partner'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const bodyClasses = [
    'app-shell__body',
    'app-shell__body--grid',
    isLeftCollapsed ? 'app-shell__body--left-collapsed' : '',
    isRightCollapsed ? 'app-shell__body--right-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>('[data-active="true"]')
    if (active) {
      setPuckTop(active.offsetTop + active.offsetHeight / 2 - 4)
    }
  }, [location.pathname])

  useEffect(() => {
    const timer = window.setInterval(() => setPeriodClock(formatPeriodClock()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="app-shell" data-testid={testId('app', 'shell', 'page')}>
      <header className="app-shell__header" data-testid={testId('app', 'shell', 'header')}>
        <div className="app-shell__brand" data-testid={testId('app', 'shell', 'brand')}>
          <div
            className="app-shell__crest"
            aria-hidden
            data-testid={testId('app', 'shell', 'icon', 'crest')}
          >
            <span className="app-shell__crest-icon">🏒</span>
          </div>
          <div className="app-shell__brand-text">
            <span
              className="app-shell__title"
              data-testid={testId('app', 'shell', 'text', 'title')}
            >
              Hockey Nights
            </span>
            <span
              className="app-shell__region"
              data-testid={testId('app', 'shell', 'text', 'region')}
            >
              {LAUNCH_REGION}
            </span>
          </div>
        </div>

        <div
          className="app-shell__header-actions"
          data-testid={testId('app', 'shell', 'header-actions')}
        >
          <span
            className="app-shell__period"
            aria-live="polite"
            data-testid={testId('app', 'shell', 'text', 'period-clock')}
          >
            {periodClock}
          </span>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            data-testid={testId('app', 'shell', 'btn', 'toggle-theme')}
          >
            {themeId === 'locker' ? '🧊 Лёд' : '🏒 Раздевалка'}
          </HockeyButton>
          <HockeyButton
            view="outlined"
            size="s"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            data-testid={testId('app', 'shell', 'btn', 'logout')}
          >
            Выйти
          </HockeyButton>
          <Link to="/" data-testid={testId('app', 'shell', 'link', 'switch-role')}>
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('app', 'shell', 'btn', 'switch-role')}
            >
              Сменить роль
            </HockeyButton>
          </Link>
          <div
            className="app-shell__panel-controls"
            aria-label="Управление панелями"
            data-testid={testId('app', 'shell', 'panel-controls')}
          >
            <HockeyButton
              view={isLeftCollapsed ? 'action' : 'outlined'}
              size="s"
              onClick={() => setIsLeftCollapsed((prev) => !prev)}
              aria-label={isLeftCollapsed ? 'Показать левую панель' : 'Свернуть левую панель'}
              data-testid={testId('app', 'shell', 'btn', 'toggle-left-panel')}
            >
              {isLeftCollapsed ? 'Показать меню' : 'Свернуть меню'}
            </HockeyButton>
            <HockeyButton
              view={isRightCollapsed ? 'action' : 'outlined'}
              size="s"
              onClick={() => setIsRightCollapsed((prev) => !prev)}
              aria-label={isRightCollapsed ? 'Показать правую панель' : 'Свернуть правую панель'}
              data-testid={testId('app', 'shell', 'btn', 'toggle-right-panel')}
            >
              {isRightCollapsed ? 'Показать борт' : 'Свернуть борт'}
            </HockeyButton>
            {isMessengerRoute && (
              <HockeyButton
                view="outlined"
                size="s"
                onClick={() => {
                  if (isFocusMode) {
                    setIsLeftCollapsed(false)
                    setIsRightCollapsed(false)
                    return
                  }
                  setIsLeftCollapsed(true)
                  setIsRightCollapsed(true)
                }}
                aria-label={isFocusMode ? 'Выйти из фокус-режима' : 'Включить фокус-режим'}
                data-testid={testId('app', 'shell', 'btn', 'toggle-focus-mode')}
              >
                {isFocusMode ? 'Обычный режим' : 'Фокус на чат'}
              </HockeyButton>
            )}
          </div>
        </div>
      </header>

      <div className={bodyClasses} data-testid={testId('app', 'shell', 'body')}>
        <nav
          className="app-shell__nav-col"
          aria-label="Основная навигация"
          data-testid={testId('app', 'nav', 'nav')}
        >
          <div className="hockey-nav" ref={navRef}>
            <span
              className="hockey-nav__puck hockey-nav-puck"
              style={{['--hockey-puck-top' as string]: `${puckTop}px`}}
              aria-hidden
            />
            {activeNavItems.map((item) => {
              const active = isNavActive(item.to)
              const badge =
                item.to === '/notifications' && unreadCount > 0
                  ? unreadCount
                  : item.to === '/messenger' && unreadChatCount > 0
                    ? unreadChatCount > 99
                      ? '99+'
                      : unreadChatCount
                    : null
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`hockey-nav__link${active ? ' hockey-nav__link--active' : ''}`}
                  data-active={active ? 'true' : undefined}
                  aria-current={active ? 'page' : undefined}
                  data-testid={testId('app', 'nav', 'link', routeToTestSlug(item.to))}
                >
                  {item.label}
                  {badge !== null && (
                    <span
                      className="hockey-nav__badge"
                      data-testid={testId('app', 'nav', 'badge', routeToTestSlug(item.to))}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
            {incubatingNavItems.length > 0 && (
              <>
                <div
                  className="hockey-nav__tier-divider"
                  data-testid={testId('app', 'nav', 'divider', 'incubating')}
                >
                  <span className="hockey-nav__tier-label">Требует доработки</span>
                </div>
                {incubatingNavItems.map((item) => {
                  const active = isNavActive(item.to)
                  const badge =
                    item.to === '/notifications' && unreadCount > 0
                      ? unreadCount
                      : item.to === '/messenger' && unreadChatCount > 0
                        ? unreadChatCount > 99
                          ? '99+'
                          : unreadChatCount
                        : null
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`hockey-nav__link hockey-nav__link--incubating${active ? ' hockey-nav__link--active' : ''}`}
                      data-active={active ? 'true' : undefined}
                      aria-current={active ? 'page' : undefined}
                      data-testid={testId('app', 'nav', 'link', routeToTestSlug(item.to))}
                    >
                      {item.label}
                      {badge !== null && (
                        <span
                          className="hockey-nav__badge"
                          data-testid={testId('app', 'nav', 'badge', routeToTestSlug(item.to))}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </>
            )}
            {hasPartnerAccess && (
              <>
                <div
                  className="hockey-nav__section-label"
                  data-testid={testId('app', 'nav', 'text', 'partner-section')}
                >
                  Партнёр
                </div>
                <Link
                  to="/partner"
                  className={`hockey-nav__link${isNavActive('/partner') ? ' hockey-nav__link--active' : ''}`}
                  data-active={isNavActive('/partner') ? 'true' : undefined}
                  data-testid={testId('app', 'nav', 'link', routeToTestSlug('/partner'))}
                >
                  Все кабинеты
                </Link>
                {partnerMemberships.map((membership) => {
                  const path = partnerCabinetPath(membership)
                  const active = location.pathname === path
                  return (
                    <Link
                      key={`${membership.kind}-${membership.entityId}`}
                      to={path}
                      className={`hockey-nav__link${active ? ' hockey-nav__link--active' : ''}`}
                      data-active={active ? 'true' : undefined}
                      title={membership.entityName}
                      data-testid={testId('app', 'nav', 'link', routeToTestSlug(path))}
                    >
                      {partnerCabinetLabel(membership)}
                    </Link>
                  )
                })}
              </>
            )}
          </div>
        </nav>

        <main className="app-shell__main-col" data-testid={testId('app', 'shell', 'main')}>
          <Outlet />
        </main>

        <div className="app-shell__board-col" data-testid={testId('app', 'shell', 'board-col')}>
          {!isRightCollapsed && !partnerWorkspace && <SideBoard />}
        </div>
      </div>

      <MobileNav />
      {/* HOCFRONT-15: SosFab скрыт из MVP — маршрут /sos сохранён */}
    </div>
  )
}
