import { useState, useEffect, useCallback } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../lib/api'
import { Avatar, Badge, Btn, EmptyState, Spinner, Skeleton } from '../components/ui/primitives'
import { useToast } from '../components/ui/Toast'

// Demo enrichment merged onto real customer records so the page always shows
// meaningful spend/segment/purchase data even when the backend only has
// bare name/email/phone fields.
const ENRICH = [
  { segment: 'VIP',      city: 'Bengaluru', spent: 84250,  orders: 12, recent: '27" 4K Monitor',        recentTime: 'Today' },
  { segment: 'Repeat',   city: 'Mumbai',    spent: 21640,  orders: 5,  recent: 'USB-C Hub 7-in-1',       recentTime: 'Today' },
  { segment: 'New',      city: 'Delhi',     spent: 890,    orders: 1,  recent: 'Bluetooth Speaker Mini', recentTime: 'Yesterday' },
  { segment: 'At risk',  city: 'Pune',      spent: 14250,  orders: 1,  recent: null, lastActive: '94 days ago — no repeat order' },
  { segment: 'Repeat',   city: 'Chennai',   spent: 38920,  orders: 9,  recent: 'Smart Door Lock',        recentTime: '3 days ago' },
  { segment: 'VIP',      city: 'Hyderabad', spent: 112400, orders: 18, recent: 'Wireless Mouse Pro ×3',  recentTime: '1 week ago' },
]

const SEGMENT_VARIANT = { VIP: 'accent', Repeat: 'ok', New: 'accent', 'At risk': 'warn' }

// Shown when the backend is unreachable/empty, so the UI is always demoable.
const DEMO_CUSTOMERS = [
  { id: 1, full_name: 'Ananya Verma', email: 'ananya.verma@email.com' },
  { id: 2, full_name: 'Karan Mehta',  email: 'karan.mehta@email.com'  },
  { id: 3, full_name: 'Priya Singh',  email: 'priya.singh@email.com'  },
  { id: 4, full_name: 'Rohan Shah',   email: 'rohan.shah@email.com'   },
  { id: 5, full_name: 'Neha Kapoor',  email: 'neha.kapoor@email.com'  },
  { id: 6, full_name: 'Vikram Joshi', email: 'vikram.joshi@email.com' },
]

function CustomerCard({ customer, enrichment, onDelete }) {
  const e = enrichment
  return (
    <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden hover:shadow-soft-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={customer.full_name} size="lg" />
            <div>
              <p className="text-[13.5px] font-semibold">{customer.full_name}</p>
              <p className="text-[11.5px] text-ink-muted mt-0.5">{customer.email}</p>
            </div>
          </div>
          <button onClick={() => onDelete(customer.id)}
            className="w-7 h-7 rounded-md hover:bg-danger-soft hover:text-danger flex items-center justify-center text-ink-muted flex-shrink-0 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-1.5 mb-4">
          <Badge variant={SEGMENT_VARIANT[e.segment] || 'neutral'} className="!rounded-full">{e.segment}</Badge>
          <Badge variant="neutral" className="!rounded-full">{e.city}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-line">
          <div>
            <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-1">Total spent</p>
            <p className="text-[16px] font-bold font-mono">₹{e.spent.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-1">Orders</p>
            <p className="text-[16px] font-bold font-mono">{e.orders}</p>
          </div>
        </div>

        <div className="pt-3.5">
          {e.recent ? (
            <>
              <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-2">Recent purchase</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-sunken border border-line flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
                </div>
                <span className="text-[12px] truncate flex-1">{e.recent}</span>
                <span className="text-[11px] text-ink-muted flex-shrink-0">{e.recentTime}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10.5px] text-ink-muted uppercase tracking-wide mb-2">Last active</p>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[12px] text-warn font-medium">{e.lastActive}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add customer modal ────────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setErr('')
    if (!form.full_name || !form.email || !form.phone) return setErr('All fields are required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr('Enter a valid email address.')
    setSaving(true)
    try {
      await createCustomer(form)
      onCreated(); onClose()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-soft-lg">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">New customer</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-sunken flex items-center justify-center text-ink-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {err && <div className="px-3 py-2.5 rounded-lg bg-danger-soft text-[12.5px] text-danger">{err}</div>}
          {[
            { label: 'Full Name *',    key: 'full_name', placeholder: 'e.g. Rahul Sharma' },
            { label: 'Email Address *', key: 'email',    placeholder: 'rahul@example.com', type: 'email' },
            { label: 'Phone Number *',  key: 'phone',    placeholder: '+91 98765 43210', type: 'tel' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">{label}</label>
              <input type={type || 'text'} value={form[key]} onChange={set(key)} placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg border border-line bg-canvas text-[13px] focus:outline-none focus:border-accent" />
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-line flex gap-2">
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" className="flex-1" onClick={submit} disabled={saving}>
            {saving ? <Spinner size={14}/> : null} Add customer
          </Btn>
        </div>
      </div>
    </div>
  )
}

export default function Customers() {
  const toast = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getCustomers()
      .then(r => setCustomers(Array.isArray(r.data) && r.data.length > 0 ? r.data : DEMO_CUSTOMERS))
      .catch(() => setCustomers(DEMO_CUSTOMERS))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Merge enrichment data onto real customers by index (demo purposes)
  const enriched = customers.map((c, i) => ({ customer: c, e: ENRICH[i % ENRICH.length] }))

  const filtered = enriched.filter(({ customer, e }) => {
    const q = query.toLowerCase()
    if (q && !customer.full_name.toLowerCase().includes(q) && !customer.email.toLowerCase().includes(q)) return false
    if (segmentFilter !== 'All' && e.segment !== segmentFilter) return false
    return true
  })

  const handleDelete = async id => {
    if (!window.confirm('Delete this customer? This cannot be undone.')) return
    try { await deleteCustomer(id); toast.success('Customer deleted'); load() }
    catch (e) { toast.error(e.message) }
  }

  const avgLTV = customers.length ? Math.round(ENRICH.reduce((s,e)=>s+e.spent,0) / ENRICH.length) : 0

  return (
    <div>
      <div className="px-6 lg:px-8 pt-6 pb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[12px] text-ink-muted mb-1">Operations / Customers</div>
          <h1 className="text-[22px] font-bold tracking-tight">Customers</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">{customers.length} total customers</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </Btn>
          <Btn variant="primary" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add customer
          </Btn>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-10 space-y-5">

        {/* Purchase analytics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-line bg-surface shadow-soft divide-x divide-line overflow-hidden">
          {[
            { label: 'Avg. lifetime value',    val: `₹${avgLTV.toLocaleString('en-IN')}` },
            { label: 'Repeat purchase rate',   val: '42%' },
            { label: 'New this month',         val: '+86', cls: 'text-ok' },
            { label: 'At-risk accounts',       val: '14',  cls: 'text-warn' },
          ].map(({ label, val, cls }) => (
            <div key={label} className="px-5 py-4">
              <div className="text-[11.5px] text-ink-muted mb-1.5">{label}</div>
              <div className={`text-[19px] font-bold font-mono ${cls || ''}`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customers…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-line bg-surface text-[13px] placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors shadow-soft" />
          </div>
          <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] shadow-soft focus:outline-none focus:border-accent cursor-pointer">
            {['All','VIP','Repeat','New','At risk'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-5 space-y-4">
                <div className="flex items-center gap-3"><Skeleton className="w-11 h-11 rounded-full"/><div className="space-y-2 flex-1"><Skeleton className="h-3 w-24"/><Skeleton className="h-3 w-32"/></div></div>
                <Skeleton className="h-16 w-full"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface shadow-soft">
            <EmptyState
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
              title="No customers found"
              description={query ? `No results for "${query}".` : 'Add your first customer to get started.'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(({ customer, e }) => (
              <CustomerCard key={customer.id} customer={customer} enrichment={e} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[12.5px] text-ink-muted">
              Showing <span className="font-medium text-ink">{filtered.length}</span> of <span className="font-medium text-ink">{customers.length}</span> customers
            </span>
            <div className="flex items-center gap-1.5">
              <Btn size="sm" variant="secondary" disabled>Previous</Btn>
              <button className="h-8 w-8 rounded-md bg-accent text-white text-[12.5px] font-medium">1</button>
              <Btn size="sm" variant="secondary">Next</Btn>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <AddCustomerModal onClose={() => setModalOpen(false)} onCreated={load} />
      )}
    </div>
  )
}
