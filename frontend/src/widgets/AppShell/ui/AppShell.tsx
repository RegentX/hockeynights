/**
 * SPEC-FR-1.2.1, SPEC-FR-1.2.4
 * SPEC-UI-4.3, SPEC-UI-5.1, SPEC-UI-5.2, SPEC-UI-5.5, SPEC-UI-5.6, SPEC-UI-6.1
 * HOCFRONT-17: компактный top bar — icon toggles + меню сессии
 */

import {
  ArrowRightFromSquare,
  DisplayPulse,
  LayoutSideContentLeft,
  LayoutSideContentRight,
  Persons,
} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Link, Outlet, useLocation, useNavigate} from 'react-router'

import {logoutSession} from '@/entities/auth'
import {fetchChats, getTotalUnreadCount} from '@/entities/messenger'
import {fetchNotifications} from '@/entities/notification'
import {
  resolveNavItems,
  shouldUsePartnerWorkspace,
  splitNavItemsByTier,
  useSessionAccess,
} from '@/features/access'
import {LAUNCH_REGION} from '@/shared/config/geo'
import {partnerCabinetLabel, partnerCabinetPath} from '@/shared/const/partnerRoutes'
import {routeToTestSlug, testId} from '@/shared/testing/testId'
import {useHockeyTheme} from '@/shared/theme/HockeyThemeProvider'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {NotificationsBellLink} from '@/shared/ui/NotificationsBellLink'
import {HeaderProfile} from '@/widgets/HeaderProfile'
import {MobileNav} from '@/widgets/MobileNav'
import {SideBoard} from '@/widgets/SideBoard'

/**
 * @spec SPEC-FR-1.2.1 - Базовый layout приложения
 * @spec SPEC-UI-5.1 - Desktop 3-col layout
 * @spec SPEC-UI-5.2 - Mobile bottom nav
 * HOCFRONT-15/17: уведомления в header; SOS FAB скрыт из MVP
 */
export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {themeId, toggleTheme} = useHockeyTheme()
  const navRef = useRef<HTMLDivElement>(null)
  const [puckTop, setPuckTop] = useState(0)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)

  const {session} = useSessionAccess()
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
  /** overflow:hidden только в мессенджере — на других страницах обе панели могут быть свёрнуты без «пустого» профиля. */
  const isMessengerFocus = isMessengerRoute && isFocusMode

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
    isMessengerFocus ? 'app-shell__body--messenger-focus' : '',
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

  const sessionMenuItems = useMemo(
    () => [
      {
        text: 'Сменить роль',
        iconStart: <Icon data={Persons} size={16} />,
        action: () => navigate('/'),
        qa: testId('app', 'shell', 'btn', 'switch-role'),
      },
      ...(isMessengerRoute
        ? [
            {
              text: isFocusMode ? 'Обычный режим' : 'Фокус на чат',
              iconStart: <Icon data={DisplayPulse} size={16} />,
              action: () => {
                if (isFocusMode) {
                  setIsLeftCollapsed(false)
                  setIsRightCollapsed(false)
                  return
                }
                setIsLeftCollapsed(true)
                setIsRightCollapsed(true)
              },
              qa: testId('app', 'shell', 'btn', 'toggle-focus-mode'),
            },
          ]
        : []),
      [
        {
          text: logoutMutation.isPending ? 'Выход…' : 'Выйти',
          theme: 'danger' as const,
          disabled: logoutMutation.isPending,
          iconStart: <Icon data={ArrowRightFromSquare} size={16} />,
          action: () => logoutMutation.mutate(),
          qa: testId('app', 'shell', 'btn', 'logout'),
        },
      ],
    ],
    [isFocusMode, isMessengerRoute, logoutMutation, navigate],
  )

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
          <NotificationsBellLink unreadCount={unreadCount} active={isNavActive('/notifications')} />
          <HockeyButton
            className="app-shell__icon-btn"
            view="outlined"
            size="s"
            onClick={toggleTheme}
            aria-label={
              themeId === 'locker' ? 'Переключить на тему Лёд' : 'Переключить на тему Раздевалка'
            }
            title={themeId === 'locker' ? 'Тема: Раздевалка → Лёд' : 'Тема: Лёд → Раздевалка'}
            data-testid={testId('app', 'shell', 'btn', 'toggle-theme')}
          >
            <span aria-hidden>{themeId === 'locker' ? '🧊' : '🏒'}</span>
          </HockeyButton>
          <div
            className="app-shell__panel-controls"
            aria-label="Управление панелями"
            data-testid={testId('app', 'shell', 'panel-controls')}
          >
            <HockeyButton
              className="app-shell__icon-btn"
              view={isLeftCollapsed ? 'action' : 'outlined'}
              size="s"
              onClick={() => setIsLeftCollapsed((prev) => !prev)}
              aria-label={isLeftCollapsed ? 'Показать меню' : 'Свернуть меню'}
              title={isLeftCollapsed ? 'Показать меню' : 'Свернуть меню'}
              data-testid={testId('app', 'shell', 'btn', 'toggle-left-panel')}
            >
              <Icon data={LayoutSideContentLeft} size={16} />
            </HockeyButton>
            <HockeyButton
              className="app-shell__icon-btn"
              view={isRightCollapsed ? 'action' : 'outlined'}
              size="s"
              onClick={() => setIsRightCollapsed((prev) => !prev)}
              aria-label={isRightCollapsed ? 'Показать борт' : 'Свернуть борт'}
              title={isRightCollapsed ? 'Показать борт' : 'Свернуть борт'}
              data-testid={testId('app', 'shell', 'btn', 'toggle-right-panel')}
            >
              <Icon data={LayoutSideContentRight} size={16} />
            </HockeyButton>
          </div>
          <HeaderProfile sessionMenuItems={sessionMenuItems} />
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
                item.to === '/messenger' && unreadChatCount > 0
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
      {/* HOCFRONT-15/17: SosFab скрыт из MVP — маршрут /sos сохранён */}
    </div>
  )
}
