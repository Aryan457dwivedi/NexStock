// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ variant = 'neutral', children, className = '' }) {
  const v = {
    ok:      'bg-ok-soft text-ok',
    warn:    'bg-warn-soft text-warn',
    danger:  'bg-danger-soft text-danger',
    accent:  'bg-accent-soft text-accent',
    neutral: 'bg-sunken text-ink-muted',
  }[variant] || 'bg-sunken text-ink-muted'

  const dot = variant !== 'neutral'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border border-transparent ${v} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        variant === 'ok' ? 'bg-ok' : variant === 'warn' ? 'bg-warn' : variant === 'danger' ? 'bg-danger' : 'bg-accent'
      }`} />}
      {children}
    </span>
  )
}

// ─── Status badge shorthand ───────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    'In stock':     'ok',
    'Low stock':    'warn',
    'Out of stock': 'danger',
    shipped:   'ok',
    processing:'accent',
    pending:   'warn',
    delivered: 'neutral',
    cancelled: 'danger',
  }
  const label = typeof status === 'string'
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status
  return <Badge variant={map[status] || map[label] || 'neutral'}>{label}</Badge>
}

// ─── Code badge (SKU / Order #) ───────────────────────────────────────────────
export function CodeBadge({ children }) {
  return (
    <span className="font-mono text-[11.5px] bg-sunken border border-line px-1.5 py-0.5 rounded text-ink-muted">
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ variant = 'secondary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]'
  const sizes = { sm: 'h-7 px-2.5 text-[12px]', md: 'h-9 px-3.5 text-[13px]', lg: 'h-10 px-4 text-[13.5px]' }
  const variants = {
    primary:   'bg-accent text-white border-transparent hover:opacity-90',
    secondary: 'bg-surface text-ink border-line hover:bg-sunken',
    ghost:     'bg-transparent text-ink-muted border-transparent hover:bg-sunken hover:text-ink',
    danger:    'bg-transparent text-danger border-line hover:bg-danger-soft hover:border-danger/30',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin text-accent" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-sunken border border-line flex items-center justify-center mb-4 text-ink-muted">
        {icon}
      </div>
      <p className="text-[14px] font-semibold text-ink mb-1">{title}</p>
      {description && <p className="text-[12.5px] text-ink-muted mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 'sm' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'md' ? 'w-8 h-8 text-[11px]' : 'w-11 h-11 text-[13px]'
  return (
    <div className={`${sz} rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-sunken rounded ${className}`} />
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-3.5 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
