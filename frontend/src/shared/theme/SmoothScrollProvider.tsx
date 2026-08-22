/**
 * SPEC-UI-7.4 - Smooth Scroll implementation using Lenis
 */

import Lenis from 'lenis'
import {type ReactNode, useEffect} from 'react'

import {COLUMN_LAYOUT_QUERY} from '@/shared/config/layout'

export function SmoothScrollProvider({children}: {children: ReactNode}) {
  useEffect(() => {
    const mq = window.matchMedia(COLUMN_LAYOUT_QUERY)
    let lenis: Lenis | null = null
    let rafId = 0

    function start() {
      if (lenis) return
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      })

      const raf = (time: number) => {
        lenis?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    function stop() {
      cancelAnimationFrame(rafId)
      rafId = 0
      lenis?.destroy()
      lenis = null
    }

    /**
     * Lenis перехватывает wheel/touch на документе и прокручивает его сам.
     * В колоночной раскладке документ зафиксирован по высоте, а скроллятся
     * сами колонки — перехват там просто съедал бы колесо и тачпад.
     */
    function sync() {
      if (mq.matches) stop()
      else start()
    }

    sync()
    mq.addEventListener('change', sync)
    /* Резерв: не во всех окружениях `change` у media query долетает при ресайзе. */
    window.addEventListener('resize', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
      stop()
    }
  }, [])

  return <>{children}</>
}
