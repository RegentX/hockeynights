/**
 * HOCFRONT-17 — иконка уведомлений в header (Lottie, без текстовой подписи).
 *
 * Lottie: «Notification Bell Animation» by Tim John (LottieFiles)
 * https://lottiefiles.com/animations/notification-bell-animation-FH1bsbRMdY
 */

import type {LottieRefCurrentProps} from 'lottie-react'
import {useLottie} from 'lottie-react'
import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'

import notificationBellAnimation from '@/shared/assets/lottie/notification-bell.json'
import {testId} from '@/shared/testing/testId'

interface NotificationsBellLinkProps {
  to?: string
  unreadCount: number
  active?: boolean
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function NotificationsBellLink({
  to = '/notifications',
  unreadCount,
  active = false,
}: NotificationsBellLinkProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasUnread = unreadCount > 0
  const animate = hasUnread && !prefersReducedMotion
  const lottieSize = 22

  const {View} = useLottie(
    {
      animationData: notificationBellAnimation,
      loop: animate,
      autoplay: animate,
      lottieRef,
    },
    {width: lottieSize, height: lottieSize},
  )

  const playBellRing = () => {
    if (prefersReducedMotion) return
    const anim = lottieRef.current
    if (!anim) return
    anim.setSpeed(1.15)
    anim.goToAndPlay(0, true)
  }

  const handleBellLeave = () => {
    if (prefersReducedMotion || hasUnread) return
    lottieRef.current?.goToAndStop(0, true)
  }

  useEffect(() => {
    const anim = lottieRef.current
    if (!anim) return
    if (animate) {
      anim.setSpeed(1)
      anim.goToAndPlay(0, true)
      return
    }
    anim.goToAndStop(0, true)
  }, [animate, unreadCount])

  return (
    <Link
      to={to}
      className={`app-shell__notify${active ? ' app-shell__notify--active' : ''}${hasUnread ? ' app-shell__notify--unread' : ''}`}
      aria-label={hasUnread ? `Уведомления, непрочитанных: ${unreadCount}` : 'Уведомления'}
      aria-current={active ? 'page' : undefined}
      data-testid={testId('app', 'shell', 'link', 'notifications')}
      onMouseEnter={playBellRing}
      onMouseLeave={handleBellLeave}
      onFocus={playBellRing}
      onBlur={handleBellLeave}
    >
      <span className="app-shell__notify-lottie" aria-hidden>
        {View}
      </span>
      {hasUnread && (
        <span
          className="app-shell__notify-badge"
          data-testid={testId('app', 'shell', 'badge', 'notifications')}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
