import { useState, useEffect, useRef } from 'react'

const NOTIFS = [
  { id: 1, type: 'danger', read: false, title: 'USB-C Hub 7-in-1 is out of stock',    time: '12 min ago' },
  { id: 2, type: 'ok',     read: false, title: 'Order #4821 was shipped',              time: '8 min ago'  },
  { id: 3, type: 'ok',     read: false, title: 'Order #4820 is now processing',        time: '45 min ago' },
  { id: 4, type: 'info',   read: true,  title: 'New customer Karan Mehta registered',  time: '1 hour ago' },
  { id: 5, type: 'warn',   read: true,  title: 'Wireless Keyboard stock is low (6)',   time: '2 hours ago'},
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFS)
  const ref = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })))

  const typeIcon = type => {
    if (type === 'danger') return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
    if (type === 'ok') return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ok">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    )
    if (type === 'warn') return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warn">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      </svg>
    )
  }

  const typeBg = type => ({
    danger: 'bg-danger-soft',
    ok:     'bg-ok-soft',
    warn:   'bg-warn-soft',
    info:   'bg-sunken',
  }[type] || 'bg-sunken')

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-sunken text-ink-muted transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-surface border border-line rounded-xl shadow-soft-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <span className="text-[13px] font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11.5px] font-medium text-accent hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-line">
            {notifs.map(n => (
              <div key={n.id}
                className={`px-4 py-3 flex gap-3 hover:bg-sunken cursor-pointer transition-colors ${n.read ? 'opacity-60' : ''}`}>
                <div className={`w-7 h-7 rounded-full ${typeBg(n.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] leading-snug text-ink">{n.title}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{n.time}</p>
                </div>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-line">
            <button className="text-[12px] font-medium text-accent hover:underline">
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
