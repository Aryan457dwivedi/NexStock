import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../lib/theme'
import { CommandPalette } from '../ui/CommandPalette'
import { NotificationBell } from '../ui/NotificationCenter'

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.6" ry="8.5"/>
    <path d="M3.8 9h16.4M3.8 15h16.4"/>
  </svg>
)

const navItems = [
  {
    section: 'Overview',
    links: [{ to: '/', label: 'Dashboard', end: true, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
        <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
      </svg>
    )}],
  },
  {
    section: 'Inventory',
    links: [{ to: '/products', label: 'Products', badge: '7', badgeVariant: 'warn', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    )}],
  },
  {
    section: 'Operations',
    links: [
      { to: '/customers', label: 'Customers', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )},
      { to: '/orders', label: 'Orders', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
      )},
    ],
  },
]

export function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()
  const location = useLocation()

  // Cmd+K global shortcut
  useEffect(() => {
    const h = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(true) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Page title from route
  const pageTitle = location.pathname === '/' ? 'Dashboard'
    : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2)

  // Breadcrumb
  const crumb = location.pathname === '/'
    ? 'Overview / Dashboard'
    : `Operations / ${pageTitle}`

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}
        flex-shrink-0 bg-surface border-r border-line flex flex-col transition-all duration-200 ease-in-out
        hidden md:flex
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-line flex-shrink-0">
          <div className="text-accent"><GlobeIcon /></div>
          <span className="font-bold text-[15px] tracking-tight">Stock</span>
          <span className="text-[9px] font-mono text-ink-muted ml-auto">IMS v2</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map(({ section, links }) => (
            <div key={section} className="mb-2">
              <div className="px-2.5 py-1.5 text-[10.5px] font-semibold text-ink-muted uppercase tracking-wider">{section}</div>
              {links.map(({ to, label, end, icon, badge, badgeVariant }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `
                    flex items-center justify-between h-9 px-2.5 rounded-lg text-[13.5px] font-medium mb-0.5 transition-colors
                    ${isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-muted hover:bg-sunken hover:text-ink'}
                  `}>
                  <span className="flex items-center gap-2.5">
                    {icon}
                    {label}
                  </span>
                  {badge && (
                    <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded
                      ${badgeVariant === 'warn' ? 'bg-warn-soft text-warn' : 'bg-sunken text-ink-muted'}`}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Reorder nudge */}
        <div className="p-3 border-t border-line">
          <div className="rounded-lg bg-sunken p-3">
            <div className="text-[12px] font-semibold mb-0.5">Reorder needed</div>
            <div className="text-[11.5px] text-ink-muted mb-2">3 products are out of stock</div>
            <NavLink to="/products" className="text-[12px] font-medium text-accent hover:underline">Review now →</NavLink>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 bg-surface border-b border-line flex items-center px-4 gap-3 z-30">
          <button onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sunken text-ink-muted transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="text-accent"><GlobeIcon /></div>
            <span className="font-bold text-[15px]">kSphere</span>
          </div>

          {/* Search / Command palette trigger */}
          <button onClick={() => setPaletteOpen(true)}
            className="flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-sunken text-ink-muted text-[13px] hover:border-ink-muted/40 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="hidden sm:inline">Search products, orders, customers…</span>
            <span className="sm:hidden">Search…</span>
            <span className="ml-auto hidden sm:flex items-center gap-0.5 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded border border-line bg-surface font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-line bg-surface font-mono">K</kbd>
            </span>
          </button>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sunken text-ink-muted transition-colors">
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          <div className="w-px h-6 bg-line" />

          {/* User profile */}
          <button className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-lg hover:bg-sunken transition-colors">
            <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-semibold">RP</div>
            <span className="text-[13px] font-medium hidden sm:block">Riya Patel</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb + page header area is handled by each page */}
          {children}
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
