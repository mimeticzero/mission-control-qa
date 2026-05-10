'use client'

type State = 'nominal' | 'warning' | 'critical' | 'offline' | 'unknown'

const DOT: Record<State, string> = {
  nominal:  'bg-gcs-green',
  warning:  'bg-gcs-yellow animate-pulse',
  critical: 'bg-gcs-red    animate-pulse',
  offline:  'bg-gcs-muted',
  unknown:  'bg-gcs-dim',
}

const LABEL: Record<State, string> = {
  nominal:  'text-gcs-green',
  warning:  'text-gcs-yellow',
  critical: 'text-gcs-red',
  offline:  'text-gcs-muted',
  unknown:  'text-gcs-dim',
}

interface StatusIndicatorProps {
  state: State
  label?: string
  size?: 'sm' | 'md'
}

export function StatusIndicator({ state, label, size = 'md' }: StatusIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`rounded-full flex-shrink-0 ${dotSize} ${DOT[state]}`} />
      {label && (
        <span className={`text-[10px] font-bold tracking-wider uppercase ${LABEL[state]}`}>
          {label}
        </span>
      )}
    </span>
  )
}
