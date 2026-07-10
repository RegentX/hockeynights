import {motion, useMotionTemplate, useMotionValue} from 'framer-motion'
import type {HTMLAttributes, MouseEvent, ReactNode} from 'react'

import {cn} from '@/shared/lib/cn'

interface MagicCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = '#38bdf8',
  gradientOpacity = 0.12,
  ...props
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const {left, top} = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - left)
    mouseY.set(event.clientY - top)
  }

  function handleMouseLeave() {
    mouseX.set(-gradientSize)
    mouseY.set(-gradientSize)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('magic-card', className)}
      {...props}
    >
      <div className="magic-card__bg" />
      <motion.div
        className="magic-card__glow"
        style={{
          ['--magic-glow-opacity' as string]: gradientOpacity,
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)
          `,
        }}
      />
      <div className="magic-card__content">{children}</div>
    </div>
  )
}
