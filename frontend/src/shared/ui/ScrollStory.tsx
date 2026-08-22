/**
 * SPEC-UI-7.1 - Scroll-Driven Storytelling using GSAP ScrollTrigger
 */

import {useGSAP} from '@gsap/react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {type ReactNode, useEffect, useRef, useState} from 'react'

import {COLUMN_LAYOUT_QUERY} from '@/shared/config/layout'
import {testId} from '@/shared/testing/testId'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * ScrollTrigger по умолчанию слушает документ. В колоночной раскладке документ
 * зафиксирован по высоте, поэтому без явного скроллера ревилы навсегда
 * застревают в стартовом состоянии (`opacity: 0`) и контент не появляется.
 */
function resolveScroller(node: Element | null): HTMLElement | undefined {
  for (let el: HTMLElement | null = node?.parentElement ?? null; el; el = el.parentElement) {
    const {overflowY} = getComputedStyle(el)
    if (overflowY === 'auto' || overflowY === 'scroll') return el
  }
  return undefined
}

/** Смена раскладки меняет скроллер — триггеры нужно пересобрать. */
function useColumnLayout(): boolean {
  const [isColumnLayout, setIsColumnLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COLUMN_LAYOUT_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(COLUMN_LAYOUT_QUERY)
    const sync = () => setIsColumnLayout(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    return () => {
      mq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return isColumnLayout
}

export function ScrollReveal({
  children,
  direction = 'up',
  'data-testid': dataTestId,
}: {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  'data-testid'?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isColumnLayout = useColumnLayout()

  useGSAP(
    () => {
      const vars = {
        opacity: 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: resolveScroller(containerRef.current),
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }

      gsap.from(containerRef.current, vars)
    },
    {scope: containerRef, dependencies: [direction, isColumnLayout], revertOnUpdate: true},
  )

  return (
    <div ref={containerRef} data-testid={dataTestId ?? testId('shared', 'scroll-reveal', 'panel')}>
      {children}
    </div>
  )
}

export function ScrollParallax({
  children,
  speed = 0.5,
  'data-testid': dataTestId,
}: {
  children: ReactNode
  speed?: number
  'data-testid'?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isColumnLayout = useColumnLayout()

  useGSAP(
    () => {
      const scroller = resolveScroller(containerRef.current)

      gsap.to(containerRef.current, {
        y: () => -ScrollTrigger.maxScroll(scroller ?? window) * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    {scope: containerRef, dependencies: [speed, isColumnLayout], revertOnUpdate: true},
  )

  return (
    <div
      ref={containerRef}
      data-testid={dataTestId ?? testId('shared', 'scroll-parallax', 'panel')}
    >
      {children}
    </div>
  )
}
