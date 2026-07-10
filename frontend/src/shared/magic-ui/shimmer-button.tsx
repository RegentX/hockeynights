import type {ButtonHTMLAttributes, ReactNode} from 'react'

import {cn} from '@/shared/lib/cn'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  shimmerColor?: string
  background?: string
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = '#ffffff',
  background = 'rgba(14, 58, 95, 0.9)',
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': '12px',
          '--speed': '3s',
          '--cut': '0.08em',
          '--bg': background,
        } as React.CSSProperties
      }
      className={cn(
        'magic-shimmer-button',
        className,
      )}
      {...props}
    >
      <div className="magic-shimmer-button__shine" aria-hidden />
      <div className="magic-shimmer-button__border" aria-hidden />
      <span className="magic-shimmer-button__label">{children}</span>
    </button>
  )
}
