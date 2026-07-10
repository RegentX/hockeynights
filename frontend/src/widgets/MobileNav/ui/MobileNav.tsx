/**
 * SPEC-UI-5.2, SPEC-FR-1.2.1, SPEC-FR-13.1.1, SPEC-FR-16.1.1
 */

import {useQuery} from '@tanstack/react-query'
import {
  Bell,
  ClipboardList,
  MessageCircle,
  Settings,
  Shield,
  ShoppingBag,
  Snowflake,
  Store,
  Trophy,
  UserRound,
} from 'lucide-react'
import {Link, useLocation} from 'react-router-dom'

import {fetchSession} from '@/entities/auth'
import {fetchChats, getTotalUnreadCount} from '@/entities/messenger'
import {resolveMobileNavItems, shouldUsePartnerWorkspace} from '@/features/access'
import {routeToTestSlug, testId} from '@/shared/testing/testId'

function formatUnreadBadge(count: number): string {
  return count > 99 ? '99+' : String(count)
}

function renderMobileNavIcon(icon: string) {
  switch (icon) {
    case '🏒':
    case '🏆':
      return <Trophy size={18} aria-hidden />
    case '👤':
      return <UserRound size={18} aria-hidden />
    case '🛡':
      return <Shield size={18} aria-hidden />
    case '💬':
      return <MessageCircle size={18} aria-hidden />
    case '🧊':
      return <Snowflake size={18} aria-hidden />
    case '🛍':
      return <ShoppingBag size={18} aria-hidden />
    case '⚙':
      return <Settings size={18} aria-hidden />
    case '🏪':
      return <Store size={18} aria-hidden />
    case '📋':
      return <ClipboardList size={18} aria-hidden />
    case '🔔':
      return <Bell size={18} aria-hidden />
    default:
      return null
  }
}

/**
 * @spec SPEC-UI-5.2 - Bottom navigation для mobile
 */
export function MobileNav() {
  const location = useLocation()
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const partnerMembership = session?.user.partnerMemberships?.[0]
  const partnerCount = session?.user.partnerMemberships?.length ?? 0
  const showLegacyPartnerLink =
    partnerMembership && !shouldUsePartnerWorkspace(session) && partnerCount > 1
  const mobileNav = resolveMobileNavItems(session)
  const {data: chats = []} = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })
  const unreadChatCount = getTotalUnreadCount(chats)

  return (
    <nav
      className="mobile-nav"
      aria-label="Основная навигация"
      data-testid={testId('app', 'mobile-nav', 'nav')}
    >
      {showLegacyPartnerLink && (
        <Link
          to="/partner"
          className={`mobile-nav__link${
            location.pathname.startsWith('/partner') ? ' mobile-nav__link--active' : ''
          }`}
          data-testid={testId('app', 'mobile-nav', 'link', routeToTestSlug('/partner'))}
        >
          <span
            className="mobile-nav__icon"
            aria-hidden
            data-testid={testId('app', 'mobile-nav', 'icon', 'partner')}
          >
            {renderMobileNavIcon('🏪')}
          </span>
          <span
            className="mobile-nav__label"
            data-testid={testId('app', 'mobile-nav', 'text', 'partner')}
          >
            Партнёр
          </span>
        </Link>
      )}
      {mobileNav.map((item) => {
        const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
        const showUnreadBadge = item.to === '/messenger' && unreadChatCount > 0
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-nav__link${active ? ' mobile-nav__link--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            data-testid={testId('app', 'mobile-nav', 'link', routeToTestSlug(item.to))}
          >
            <span className="mobile-nav__icon-wrap">
              <span
                className="mobile-nav__icon"
                aria-hidden
                data-testid={testId('app', 'mobile-nav', 'icon', routeToTestSlug(item.to))}
              >
                {renderMobileNavIcon(item.icon)}
              </span>
              {showUnreadBadge && (
                <span
                  className="mobile-nav__badge"
                  aria-label={`${unreadChatCount} непрочитанных`}
                  data-testid={testId('app', 'mobile-nav', 'badge', routeToTestSlug(item.to))}
                >
                  {formatUnreadBadge(unreadChatCount)}
                </span>
              )}
            </span>
            <span
              className="mobile-nav__label"
              data-testid={testId('app', 'mobile-nav', 'text', routeToTestSlug(item.to))}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
