'use client'

import { type ReactNode } from 'react'

type Variant = 'nominal' | 'warning' | 'critical' | 'offline' | 'info' | 'dim'

const VARIANT_CLASSES: Record<Variant, string> = {
  nominal:  'border-gcs-green  text-gcs-green  bg-gcs-green/10',
  warning:  'border-gcs-yellow text-gcs-yellow bg-gcs-yellow/10',
  critical: 'border-gcs-red    text-gcs-red    bg-gcs-red/10 animate-alert-pulse',
  offline:  'border-gcs-muted  text-gcs-muted  bg-gcs-muted/10',
  info:     'border-gcs-cyan   text-gcs-cyan   bg-gcs-cyan/10',
  dim:      'border-gcs-border text-gcs-dim    bg-transparent',
}

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'info', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border px-1.5 py-0.5
        text-[9px] font-bold tracking-widest uppercase
        ${VARIANT_CLASSES[variant]} ${className}
      `}
    >
      {dot && (
        <span
          className={`
            inline-block w-1.5 h-1.5 rounded-full flex-shrink-0
            ${variant === 'nominal'  ? 'bg-gcs-green'  : ''}
            ${variant === 'warning'  ? 'bg-gcs-yellow' : ''}
            ${variant === 'critical' ? 'bg-gcs-red animate-pulse' : ''}
            ${variant === 'offline'  ? 'bg-gcs-muted'  : ''}
            ${variant === 'info'     ? 'bg-gcs-cyan'   : ''}
            ${variant === 'dim'      ? 'bg-gcs-dim'    : ''}
          `}
        />
      )}
      {children}
    </span>
  )
}
