import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../lib/api'
import { Skeleton, TableSkeleton } from '../components/ui/primitives'

// Revenue chart (SVG inline — no external chart lib needed for this scope)
function RevenueChart() {
  const pts = [140,130,135,100,110,85,95,60,75,50,65,40,55,30,45]
  const w = 560, h = 180, pad = 8
  const xs = pts.map((_, i) => pad + (i / (pts.length - 1)) * (w - pad * 2))
  const ys = pts.map(v => pad + (v / 150) * (h - pad * 2))
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const area = `${line} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`
  const labels = ['Jun 17','Jun 20','Jun 23','Jun 26','Jun 30']

  return (
    <div className="p-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[20,70,120,170].map(y => <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="var(--line)" strokeWidth="1"/>)}
        <path d={area} fill="url(#rev-fill)"/>
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3.5" fill="var(--accent)"/>
      </svg>
      <div className="flex items-center justify-between mt-1 text-[10.5px] text-ink-muted px-1">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  )
}

function HealthBar({ healthy = 203, low = 37, out = 8 }) {
  const total = healthy + low + out
  return (
    <div className="h-2 rounded-full overflow-hidden flex w-full mb-4">
      <div className="bg-ok transition-all" style={{width: `${(healthy/total)*100}%`}}/>
      <div className="bg-warn transition-all" style={{width: `${(low/total)*100}%`}}/>
      <div className="bg-danger transition-all" style={{width: `${(out/total)*100}%`}}/>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const lowStock = stats?.low_stock_products || []

  return (
    <div>
      {/* Page header */}
      <div className="px-6 lg:px-8 pt-6 pb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[12px] text-ink-muted mb-1">Overview / Dashboard</div>
          <h1 className="text-[22px] font-bold tracking-tight">Good morning, Riya</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">Here's what needs your attention today.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] font-medium hover:bg-sunken transition-colors flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <Link to="/orders" className="h-9 px-3 rounded-lg bg-accent text-white text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New order
          </Link>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-10 space-y-6">

        {/* Row 1: Inventory Health + Today's Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Inventory Health */}
          <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <div>
                <h2 className="text-[13.5px] font-semibold">Inventory health</h2>
                <p className="text-[11.5px] text-ink-muted mt-0.5">
                  {loading ? '—' : `${stats?.total_products ?? 248} active SKUs`}
                </p>
              </div>
              <Link to="/products" className="text-[12px] font-medium text-accent hover:underline">View all →</Link>
            </div>
            <div className="px-5 py-4">
              {loading ? <Skeleton className="h-2 w-full mb-4" /> : <HealthBar />}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { dot: 'bg-ok',     label: 'Healthy',      val: 203 },
                  { dot: 'bg-warn',   label: 'Low stock',    val: lowStock.filter(p => p.quantity > 0).length || 37 },
                  { dot: 'bg-danger', label: 'Out of stock', val: lowStock.filter(p => p.quantity === 0).length || stats?.low_stock_products?.length || 8 },
                ].map(({ dot, label, val }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${dot}`}/>
                      <span className="text-[11.5px] text-ink-muted">{label}</span>
                    </div>
                    {loading ? <Skeleton className="h-7 w-12" /> : (
                      <div className="text-[20px] font-bold font-mono">{val}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 bg-sunken border-t border-line flex items-center justify-between">
              <span className="text-[12px] text-ink-muted">
                <span className="font-semibold text-ink">12 products</span> need reordering this week
              </span>
              <button className="text-[12px] font-medium text-accent hover:underline">Create PO →</button>
            </div>
          </div>

          {/* Today's Operations */}
          <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="text-[13.5px] font-semibold">Today's operations</h2>
              <p className="text-[11.5px] text-ink-muted mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-line">
              {[
                { label: 'Orders received',  val: stats?.total_orders ?? 18,    suffix: '', trend: '+12%', up: true },
                { label: 'Orders shipped',   val: 14,  suffix: '4 pending',      trend: null },
                { label: 'Revenue today',    val: '₹84.2K', suffix: '',         trend: '+8%', up: true },
                { label: 'New customers',    val: stats?.total_customers ? 5 : 5, suffix: '', trend: null },
              ].map(({ label, val, suffix, trend, up }) => (
                <div key={label} className="px-5 py-4">
                  <div className="text-[11.5px] text-ink-muted mb-1.5">{label}</div>
                  <div className="flex items-baseline gap-2">
                    {loading ? <Skeleton className="h-7 w-16" /> : (
                      <span className="text-[22px] font-bold font-mono">{val}</span>
                    )}
                    {trend && !loading && (
                      <span className={`text-[11px] font-medium flex items-center gap-0.5 ${up ? 'text-ok' : 'text-danger'}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points={up ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}/>
                        </svg>
                        {trend}
                      </span>
                    )}
                    {suffix && !loading && <span className="text-[11px] text-ink-muted">{suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Revenue chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <div>
                <h2 className="text-[13.5px] font-semibold">Revenue & sales trend</h2>
                <p className="text-[11.5px] text-ink-muted mt-0.5">Last 14 days</p>
              </div>
              <div className="flex rounded-lg border border-line p-0.5 text-[12px]">
                {['14D','30D','90D'].map((l,i) => (
                  <button key={l} className={`px-2.5 py-1 rounded-md ${i===0?'bg-sunken font-medium text-ink':'text-ink-muted'}`}>{l}</button>
                ))}
              </div>
            </div>
            <RevenueChart />
          </div>

          {/* Activity timeline */}
          <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="text-[13.5px] font-semibold">Recent activity</h2>
            </div>
            <div className="px-5 py-4 flex-1">
              <div className="relative pl-5">
                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line"/>
                {[
                  { dot: 'bg-ok',       text: <><span className="font-medium">Order #4821</span> shipped to Ananya Verma</>, time: '8 minutes ago' },
                  { dot: 'bg-warn',     text: <><span className="font-medium">USB-C Hub 7-in-1</span> hit low stock threshold</>, time: '42 minutes ago' },
                  { dot: 'bg-accent',   text: <>New customer <span className="font-medium">Karan Mehta</span> registered</>, time: '1 hour ago' },
                  { dot: 'bg-ink-muted',text: <><span className="font-medium">27" 4K Monitor</span> restocked — 40 units</>, time: '3 hours ago' },
                ].map((item, i) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    <div className={`absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full ${item.dot} border-2 border-surface`}/>
                    <p className="text-[12.5px] leading-snug">{item.text}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-line">
              <button className="text-[12px] font-medium text-accent hover:underline">View all activity →</button>
            </div>
          </div>
        </div>

        {/* Row 3: Low stock + Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Low stock alerts */}
          <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold">Low stock alerts</h2>
              <span className="text-[11px] font-mono bg-warn-soft text-warn px-2 py-0.5 rounded-full font-semibold">
                {lowStock.length || 7} items
              </span>
            </div>
            <div className="divide-y divide-line">
              {(lowStock.length > 0 ? lowStock.slice(0, 3) : [
                { name: 'Wireless Mechanical Keyboard', sku: 'WMK-204-BLK', quantity: 6 },
                { name: 'USB-C Hub 7-in-1',            sku: 'UCH-712-SLV', quantity: 0 },
                { name: 'Bluetooth Speaker Mini',       sku: 'BSM-090-RED', quantity: 4 },
              ]).map(p => (
                <div key={p.name} className="px-5 py-3 flex items-center gap-3 hover:bg-sunken transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-sunken border border-line flex items-center justify-center flex-shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-muted font-mono">{p.sku}</p>
                  </div>
                  <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded flex-shrink-0
                    ${p.quantity === 0 ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn'}`}>
                    {p.quantity === 0 ? 'Out' : `${p.quantity} left`}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-sunken border-t border-line">
              <Link to="/products" className="text-[12px] font-medium text-accent hover:underline">View all low stock →</Link>
            </div>
          </div>

          {/* Recent orders */}
          <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold">Recent orders</h2>
              <Link to="/orders" className="text-[12px] font-medium text-accent hover:underline">View all →</Link>
            </div>
            {loading ? <TableSkeleton rows={3} cols={4}/> : (
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line">
                    {['Order','Customer','Total','Status'].map(h => (
                      <th key={h} className="text-left font-medium text-ink-muted px-5 py-2 text-[10.5px] uppercase tracking-wide first:pl-5 last:pl-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    { id: '#4821', name: 'Ananya Verma',  total: '₹6,499',  status: 'shipped' },
                    { id: '#4820', name: 'Karan Mehta',   total: '₹2,150',  status: 'processing' },
                    { id: '#4819', name: 'Priya Singh',   total: '₹890',    status: 'pending' },
                  ].map(o => (
                    <tr key={o.id} className="hover:bg-sunken transition-colors">
                      <td className="px-5 py-2.5 font-mono text-ink-muted">{o.id}</td>
                      <td className="px-3 py-2.5 font-medium">{o.name}</td>
                      <td className="px-3 py-2.5 font-mono font-medium">{o.total}</td>
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium
                          ${o.status==='shipped'?'text-ok':o.status==='processing'?'text-accent':'text-warn'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full
                            ${o.status==='shipped'?'bg-ok':o.status==='processing'?'bg-accent':'bg-warn'}`}/>
                          {o.status.charAt(0).toUpperCase()+o.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Row 4: Top-selling products */}
        <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="text-[13.5px] font-semibold">Top-selling products</h2>
              <p className="text-[11.5px] text-ink-muted mt-0.5">By units sold, last 30 days</p>
            </div>
            <button className="text-[12px] font-medium text-accent hover:underline">View full report →</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-line">
            {[
              { name: '27" 4K Monitor',          sku: 'MON-27K-001', units: 142, pct: 92 },
              { name: 'Wireless Mouse Pro',       sku: 'WMP-118-GRY', units: 118, pct: 76 },
              { name: 'USB-C Hub 7-in-1',         sku: 'UCH-712-SLV', units: 96,  pct: 62 },
              { name: 'Mechanical Keyboard',      sku: 'WMK-204-BLK', units: 74,  pct: 48 },
            ].map(p => (
              <div key={p.sku} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-sunken border border-line flex items-center justify-center flex-shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-muted font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[18px] font-bold font-mono">{p.units}</span>
                  <span className="text-[11px] text-ink-muted">units</span>
                </div>
                <div className="h-1 rounded-full bg-sunken overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{width: `${p.pct}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
