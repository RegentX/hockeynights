import type {ReactNode} from 'react'

import {cn} from '@/shared/lib/cn'

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedGradientText({children, className}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn('magic-animated-gradient-text', className)}
      style={{'--bg-size': '300%'} as React.CSSProperties}
    >
      {children}
    </span>
  )
}
