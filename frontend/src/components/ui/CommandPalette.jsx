import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const COMMANDS = [
  // Navigation
  { id: 'nav-dash',      group: 'Navigate', label: 'Dashboard',         icon: 'grid',  to: '/',         match: 'dashboard home overview' },
  { id: 'nav-products',  group: 'Navigate', label: 'Products',          icon: 'box',   to: '/products', match: 'products inventory sku' },
  { id: 'nav-orders',    group: 'Navigate', label: 'Orders',            icon: 'cart',  to: '/orders',   match: 'orders shipments fulfillment' },
  { id: 'nav-customers', group: 'Navigate', label: 'Customers',         icon: 'users', to: '/customers',match: 'customers clients buyers' },
  // Quick actions
  { id: 'act-product',   group: 'Actions',  label: 'Add new product',   icon: 'plus',  to: '/products', match: 'add new product create sku', action: 'add-product' },
  { id: 'act-order',     group: 'Actions',  label: 'Create new order',  icon: 'plus',  to: '/orders',   match: 'new order create sale',      action: 'add-order' },
  { id: 'act-customer',  group: 'Actions',  label: 'Add customer',      icon: 'plus',  to: '/customers',match: 'add customer new buyer',      action: 'add-customer' },
]

export function CommandPalette({ open, onClose, onAction }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.match.includes(query.toLowerCase())
      )
    : COMMANDS

  useEffect(() => { if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => { setCursor(0) }, [query])

  const select = useCallback((cmd) => {
    onClose()
    if (cmd.action) onAction?.(cmd.action)
    navigate(cmd.to)
  }, [navigate, onClose, onAction])

  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && filtered[cursor]) select(filtered[cursor])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, cursor, filtered, select, onClose])

  if (!open) return null

  const groups = [...new Set(filtered.map(c => c.group))]

  const Icon = ({ name }) => {
    const icons = {
      grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
      box:  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
      cart: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
      users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
      plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    }
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icons[name]}</svg>
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[12vh] px-4"
         onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-xl bg-surface border border-line rounded-xl shadow-soft-lg overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-line">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-ink-muted flex-shrink-0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, orders, customers…"
            className="flex-1 h-12 bg-transparent text-[14px] focus:outline-none placeholder:text-ink-muted text-ink"
          />
          <kbd className="px-1.5 py-0.5 rounded border border-line text-[11px] text-ink-muted font-mono flex-shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-ink-muted">No results for "{query}"</div>
          ) : (
            groups.map(group => (
              <div key={group}>
                <div className="px-4 py-1.5 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wide">{group}</div>
                {filtered.filter(c => c.group === group).map(cmd => {
                  const idx = filtered.indexOf(cmd)
                  return (
                    <button key={cmd.id} onMouseDown={() => select(cmd)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-left transition-colors cursor-pointer
                        ${idx === cursor ? 'bg-sunken text-ink' : 'text-ink-muted hover:bg-sunken hover:text-ink'}`}
                      style={{width: 'calc(100% - 16px)'}}>
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
                        ${idx === cursor ? 'bg-accent-soft text-accent' : 'bg-sunken border border-line text-ink-muted'}`}>
                        <Icon name={cmd.icon} />
                      </div>
                      <span className="text-[13px] font-medium">{cmd.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-line flex items-center gap-4 text-[11px] text-ink-muted">
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['ESC', 'Close']].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-line font-mono">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
