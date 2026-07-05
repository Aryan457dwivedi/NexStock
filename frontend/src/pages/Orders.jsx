import { useState, useEffect, useCallback } from 'react'
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../lib/api'
import { Avatar, Badge, Btn, EmptyState, Spinner, TableSkeleton } from '../components/ui/primitives'
import { useToast } from '../components/ui/Toast'

const STATUS_VARIANT = {
  shipped: 'ok', processing: 'accent', pending: 'warn', delivered: 'neutral', cancelled: 'danger',
}

// Demo fallback data shown alongside/underneath real API orders so the page
// always demonstrates the full breadth of states (shipped/processing/pending/
// delivered/cancelled) even on a fresh database with few real orders.
const DEMO_ORDERS = [
  { id: '4821', customer_name: 'Ananya Verma', total_amount: 6499,  status: 'shipped',    created_at: '2026-06-30', items: [] },
  { id: '4820', customer_name: 'Karan Mehta',  total_amount: 2150,  status: 'processing', created_at: '2026-06-30', items: [] },
  { id: '4819', customer_name: 'Priya Singh',  total_amount: 890,   status: 'pending',    created_at: '2026-06-29', items: [] },
  { id: '4818', customer_name: 'Rohan Shah',   total_amount: 14250, status: 'delivered',  created_at: '2026-06-29', items: [] },
  { id: '4817', customer_name: 'Vikram Joshi', total_amount: 3200,  status: 'cancelled',  created_at: '2026-06-28', items: [] },
]

function OrderTimeline({ status }) {
  const steps = ['Order placed', 'Processing', 'Shipped', 'Delivered']
  const activeIdx = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: 1 }[status] ?? 0
  return (
    <div className="relative pl-5">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
      {steps.slice(0, activeIdx + 1).map((step, i) => ({ step, hour: 9 + i })).reverse().map(({ step, hour }) => (
        <div key={step} className="relative pb-4 last:pb-0">
          <div className={`absolute -left-5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${status === 'cancelled' ? 'bg-danger' : 'bg-ok'}`} />
          <p className="text-[12.5px] font-medium">{step}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">Jun 30, {hour}:00 AM</p>
        </div>
      ))}
    </div>
  )
}

function OrderRow({ order, expanded, onToggle, onDelete }) {
  const status = (order.status || 'pending').toLowerCase()
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer hover:bg-sunken transition-colors">
        <td className="px-3 py-3 text-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`text-ink-muted inline-block transition-transform ${expanded ? 'rotate-90' : ''}`}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </td>
        <td className="px-3 py-3 font-mono font-medium">#{order.id}</td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Avatar name={order.customer_name || 'Customer'} />
            {order.customer_name || `Customer #${order.customer_id}`}
          </div>
        </td>
        <td className="px-3 py-3 text-ink-muted">
          {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className={`px-3 py-3 text-right font-mono font-medium ${status === 'cancelled' ? 'line-through text-ink-muted' : ''}`}>
          ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
        <td className="px-3 py-3">
          <Badge variant={STATUS_VARIANT[status] || 'neutral'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </td>
        <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
          <Btn size="sm" variant="danger" onClick={() => onDelete(order.id)}>Cancel</Btn>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-sunken/60">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wide mb-3">Order timeline</div>
                <OrderTimeline status={status} />
              </div>
              <div>
                <div className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wide mb-3">Items</div>
                <div className="space-y-2.5">
                  {(order.items && order.items.length > 0) ? order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-surface border border-line flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium truncate">{item.product_name || `Product #${item.product_id}`}</p>
                        <p className="text-[11px] text-ink-muted font-mono">×{item.quantity} · ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )) : <p className="text-[12.5px] text-ink-muted">No item details available</p>}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] font-semibold text-ink-muted uppercase tracking-wide mb-3">Customer</div>
                <p className="text-[12.5px] font-medium">{order.customer_name || 'Customer'}</p>
                <p className="text-[12.5px] text-ink-muted mt-2">{order.customer_email || '—'}</p>
                <Btn size="sm" variant="secondary" className="mt-3">View full order</Btn>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── New order modal ───────────────────────────────────────────────────────────
function NewOrderModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts]   = useState([])
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([c, p]) => {
        setCustomers(Array.isArray(c.data) ? c.data : [])
        setProducts(Array.isArray(p.data) ? p.data : [])
      })
      .catch(() => {})
  }, [])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const rmItem  = idx => setItems(i => i.filter((_, n) => n !== idx))
  const setItem = (idx, k, v) => setItems(i => i.map((it, n) => n === idx ? { ...it, [k]: v } : it))

  const total = items.reduce((sum, it) => {
    const p = products.find(p => String(p.id) === String(it.product_id))
    return sum + (p ? p.price * Number(it.quantity || 0) : 0)
  }, 0)

  const submit = async () => {
    setErr('')
    if (!customerId) return setErr('Select a customer.')
    if (items.some(i => !i.product_id || !i.quantity || i.quantity < 1)) return setErr('All items need a product and quantity ≥ 1.')
    setSaving(true)
    try {
      await createOrder({
        customer_id: Number(customerId),
        notes,
        items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
      })
      onCreated(); onClose()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[8vh] px-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-surface border border-line rounded-xl shadow-soft-lg max-h-[84vh] flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between flex-shrink-0">
          <h2 className="text-[15px] font-semibold">New order</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-sunken flex items-center justify-center text-ink-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {err && <div className="px-3 py-2.5 rounded-lg bg-danger-soft text-[12.5px] text-danger">{err}</div>}

          <div>
            <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">Customer *</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-line bg-canvas text-[13px] focus:outline-none focus:border-accent">
              <option value="">— Select customer —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11.5px] font-medium text-ink-muted">Order items *</label>
              <button onClick={addItem} className="text-[12px] font-medium text-accent hover:underline">+ Add item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr,80px,auto] gap-2 items-center bg-sunken p-2.5 rounded-lg border border-line">
                  <select value={item.product_id} onChange={e => setItem(idx, 'product_id', e.target.value)}
                    className="h-9 px-2.5 rounded-md border border-line bg-surface text-[12.5px] focus:outline-none focus:border-accent">
                    <option value="">— Product —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)}
                    className="h-9 px-2.5 rounded-md border border-line bg-surface text-[12.5px] focus:outline-none focus:border-accent" />
                  {items.length > 1 && (
                    <button onClick={() => rmItem(idx)} className="w-9 h-9 rounded-md text-danger hover:bg-danger-soft flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-line bg-canvas text-[13px] focus:outline-none focus:border-accent resize-none" />
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-sunken border border-line">
              <span className="text-[13px] text-ink-muted">Estimated total</span>
              <span className="text-[18px] font-bold font-mono text-accent">₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-line flex gap-2 flex-shrink-0">
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" className="flex-1" onClick={submit} disabled={saving}>
            {saving ? <Spinner size={14}/> : null} Place order
          </Btn>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getOrders()
      .then(r => setOrders(Array.isArray(r.data) && r.data.length > 0 ? r.data : DEMO_ORDERS))
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o => {
    const q = query.toLowerCase()
    if (q && !String(o.id).includes(q) && !(o.customer_name || '').toLowerCase().includes(q)) return false
    if (statusFilter !== 'All' && (o.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false
    return true
  })

  const handleDelete = async id => {
    if (!window.confirm(`Cancel order #${id}? Stock will be restored.`)) return
    try { await deleteOrder(id); toast.success('Order cancelled'); load() }
    catch (e) { toast.error(e.message) }
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0)
  const avgOrder = orders.length ? totalRevenue / orders.length : 0
  const pending = orders.filter(o => ['pending','processing'].includes((o.status||'').toLowerCase())).length
  const cancelled = orders.filter(o => (o.status||'').toLowerCase() === 'cancelled').length

  return (
    <div>
      <div className="px-6 lg:px-8 pt-6 pb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[12px] text-ink-muted mb-1">Operations / Orders</div>
          <h1 className="text-[22px] font-bold tracking-tight">Orders</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">{orders.length} orders this month</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </Btn>
          <Btn variant="primary" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New order
          </Btn>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-10 space-y-5">

        {/* Revenue summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-line bg-surface shadow-soft divide-x divide-line overflow-hidden">
          {[
            { label: 'Total revenue',        val: `₹${totalRevenue.toLocaleString('en-IN')}` },
            { label: 'Avg. order value',     val: `₹${avgOrder.toLocaleString('en-IN', {maximumFractionDigits:0})}` },
            { label: 'Pending fulfillment',  val: pending, cls: 'text-warn' },
            { label: 'Cancelled',            val: cancelled, cls: 'text-ink-muted' },
          ].map(({ label, val, cls }) => (
            <div key={label} className="px-5 py-4">
              <div className="text-[11.5px] text-ink-muted mb-1.5">{label}</div>
              <div className={`text-[19px] font-bold font-mono ${cls || ''}`}>{val}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b border-line flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search order # or customer…"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-line bg-sunken text-[13px] placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] focus:outline-none focus:border-accent cursor-pointer">
              {['All','Pending','Processing','Shipped','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] font-medium flex items-center gap-1.5 hover:bg-sunken transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Date range
            </button>
          </div>

          {loading ? <TableSkeleton rows={5} cols={6} /> : filtered.length === 0 ? (
            <EmptyState
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
              title="No orders found"
              description={query ? `No results for "${query}".` : 'Orders will appear here once created.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-sunken/40">
                    <th className="w-8 px-3 py-2.5" />
                    {['Order','Customer','Date','Total','Status'].map((h,i) => (
                      <th key={h} className={`text-[10.5px] font-medium text-ink-muted px-3 py-2.5 uppercase tracking-wide ${i===3?'text-right':'text-left'}`}>{h}</th>
                    ))}
                    <th className="w-20 px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map(o => (
                    <OrderRow key={o.id} order={o}
                      expanded={expandedId === o.id}
                      onToggle={() => setExpandedId(id => id === o.id ? null : o.id)}
                      onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3.5 border-t border-line flex items-center justify-between">
              <span className="text-[12.5px] text-ink-muted">
                Showing <span className="font-medium text-ink">{filtered.length}</span> of <span className="font-medium text-ink">{orders.length}</span> orders
              </span>
              <div className="flex items-center gap-1.5">
                <Btn size="sm" variant="secondary" disabled>Previous</Btn>
                <button className="h-8 w-8 rounded-md bg-accent text-white text-[12.5px] font-medium">1</button>
                <Btn size="sm" variant="secondary">Next</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <NewOrderModal onClose={() => setModalOpen(false)} onCreated={load} />
      )}
    </div>
  )
}
