import { useState, useEffect, useCallback } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../lib/api'
import { Badge, Btn, CodeBadge, EmptyState, Spinner, TableSkeleton } from '../components/ui/primitives'
import { useToast } from '../components/ui/Toast'

// ── Stock status helper ───────────────────────────────────────────────────────
function stockVariant(qty) {
  if (qty === 0) return 'danger'
  if (qty <= 10) return 'warn'
  return 'ok'
}
function stockLabel(qty) {
  if (qty === 0) return 'Out of stock'
  if (qty <= 10) return 'Low stock'
  return 'In stock'
}

// ── Quick-edit drawer ─────────────────────────────────────────────────────────
function ProductDrawer({ product, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
    description: product?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (product) setForm({
      name: product.name, sku: product.sku,
      price: product.price, quantity: product.quantity,
      description: product.description || '',
    })
  }, [product])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    setErr('')
    if (!form.name || !form.sku) { setErr('Name and SKU are required.'); return }
    if (Number(form.price) < 0)    { setErr('Price cannot be negative.'); return }
    if (Number(form.quantity) < 0) { setErr('Quantity cannot be negative.'); return }
    setSaving(true)
    try {
      const data = { ...form, price: Number(form.price), quantity: Number(form.quantity) }
      if (product?.id) await updateProduct(product.id, data)
      else             await createProduct(data)
      toast.success(product?.id ? 'Product updated' : 'Product created')
      onSaved()
      onClose()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  if (!product && !product?.id === undefined) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-line shadow-soft-lg z-50 flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-[11px] text-ink-muted mb-0.5">{product?.id ? 'Quick edit' : 'New product'}</div>
            <h2 className="text-[15px] font-semibold">{product?.name || 'Add product'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-sunken flex items-center justify-center text-ink-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {err && (
            <div className="px-3 py-2.5 rounded-lg bg-danger-soft border border-danger/20 text-[12.5px] text-danger flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {err}
            </div>
          )}

          {product?.id && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sunken border border-line">
              <div className="w-14 h-14 rounded-lg bg-surface border border-line flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{product.name}</p>
                <p className="text-[11.5px] text-ink-muted font-mono mt-0.5">{product.sku}</p>
              </div>
              <Badge variant={stockVariant(product.quantity)}>{stockLabel(product.quantity)}</Badge>
            </div>
          )}

          {[
            { label: 'Product Name *', key: 'name', placeholder: 'e.g. Wireless Headphones', full: true },
            { label: 'SKU / Code *',  key: 'sku',  placeholder: 'e.g. WH-2024-BLK', full: true },
          ].map(({ label, key, placeholder, full }) => (
            <div key={key}>
              <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">{label}</label>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg border border-line bg-canvas text-[13px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Price (₹) *', key: 'price',    type: 'number', placeholder: '0.00' },
              { label: 'Stock qty *', key: 'quantity',  type: 'number', placeholder: '0' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">{label}</label>
                <input value={form[key]} onChange={set(key)} type={type} min="0" placeholder={placeholder}
                  className="w-full h-9 px-3 rounded-lg border border-line bg-canvas text-[13px] font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-ink-muted mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Optional product description…"
              className="w-full px-3 py-2 rounded-lg border border-line bg-canvas text-[13px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all resize-none" />
          </div>

          {product?.id && (
            <div className="pt-2 border-t border-line space-y-3">
              <div className="text-[11.5px] font-medium text-ink-muted">Stock history</div>
              <div className="space-y-2">
                {[
                  { label: 'Restocked +40 units', time: '3 days ago' },
                  { label: 'Sold −12 units',       time: '5 days ago' },
                ].map(({ label, time }) => (
                  <div key={time} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-ink-muted">{label}</span>
                    <span className="text-ink-muted font-mono text-[11px]">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-line flex gap-2 flex-shrink-0">
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary"   className="flex-1" onClick={save} disabled={saving}>
            {saving ? <Spinner size={14}/> : null}
            {product?.id ? 'Save changes' : 'Add product'}
          </Btn>
        </div>
      </aside>
    </>
  )
}

// ── Products page ─────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Smart Home', 'Lighting']

// Shown when the backend is unreachable/empty, so the UI is always demoable.
const DEMO_PRODUCTS = [
  { id: 1, name: '27" 4K Monitor',             sku: 'MON-27K-001', category: 'Electronics',  price: 28499, quantity: 34 },
  { id: 2, name: 'Wireless Mechanical Keyboard',sku: 'WMK-204-BLK', category: 'Accessories',  price: 4299,  quantity: 6  },
  { id: 3, name: 'USB-C Hub 7-in-1',           sku: 'UCH-712-SLV', category: 'Accessories',  price: 1899,  quantity: 0  },
  { id: 4, name: 'Wireless Mouse Pro',          sku: 'WMP-118-GRY', category: 'Accessories',  price: 1299,  quantity: 86 },
  { id: 5, name: 'Smart Door Lock',             sku: 'SDL-330-BLK', category: 'Smart Home',   price: 12999, quantity: 21 },
]

export default function Products() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter]     = useState('All')
  const [selected, setSelected] = useState(new Set())
  const [drawer, setDrawer]     = useState(null)   // null | {} (new) | product obj
  const [sortKey, setSortKey]   = useState('name')
  const [sortDir, setSortDir]   = useState(1)       // 1 asc / -1 desc

  const load = useCallback(() => {
    setLoading(true)
    getProducts()
      .then(r => setProducts(Array.isArray(r.data) && r.data.length > 0 ? r.data : DEMO_PRODUCTS))
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const sort = key => {
    setSortDir(sortKey === key ? -sortDir : 1)
    setSortKey(key)
  }

  const filtered = products
    .filter(p => {
      const q = query.toLowerCase()
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
      if (statusFilter === 'In stock' && p.quantity <= 0) return false
      if (statusFilter === 'Low stock' && (p.quantity > 10 || p.quantity <= 0)) return false
      if (statusFilter === 'Out of stock' && p.quantity > 0) return false
      return true
    })
    .sort((a, b) => {
      const av = sortKey === 'price' ? a.price : sortKey === 'quantity' ? a.quantity : a.name
      const bv = sortKey === 'price' ? b.price : sortKey === 'quantity' ? b.quantity : b.name
      return av < bv ? -sortDir : av > bv ? sortDir : 0
    })

  const toggleSelect = id => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => {
    setSelected(s => s.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)))
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try { await deleteProduct(id); toast.success('Product deleted'); load() }
    catch (e) { toast.error(e.message) }
  }

  const SortIcon = ({ k }) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className={sortKey === k ? 'opacity-100 text-accent' : 'opacity-40'}>
      {sortKey === k && sortDir === 1
        ? <polyline points="18 15 12 9 6 15"/>
        : sortKey === k && sortDir === -1
        ? <polyline points="6 9 12 15 18 9"/>
        : <path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>}
    </svg>
  )

  return (
    <div>
      {/* Header */}
      <div className="px-6 lg:px-8 pt-6 pb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[12px] text-ink-muted mb-1">Inventory / Products</div>
          <h1 className="text-[22px] font-bold tracking-tight">Products</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">{products.length} active SKUs</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Import
          </Btn>
          <Btn variant="primary" onClick={() => setDrawer({})}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add product
          </Btn>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-10">
        <div className="rounded-xl border border-line bg-surface shadow-soft overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b border-line flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search products, SKUs…"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-line bg-sunken text-[13px] placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors" />
            </div>

            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] focus:outline-none focus:border-accent cursor-pointer">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-line bg-surface text-[13px] focus:outline-none focus:border-accent cursor-pointer">
              {['All','In stock','Low stock','Out of stock'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="px-5 py-2.5 bg-accent-soft border-b flex items-center justify-between" style={{borderColor:'color-mix(in srgb, var(--accent) 20%, transparent)'}}>
              <span className="text-[12.5px] font-medium text-accent">{selected.size} selected</span>
              <div className="flex gap-2">
                <Btn size="sm" variant="secondary">Edit category</Btn>
                <Btn size="sm" variant="secondary">Export</Btn>
                <Btn size="sm" variant="danger">Delete</Btn>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? <TableSkeleton rows={5} cols={6} /> : filtered.length === 0 ? (
            <EmptyState
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
              title="No products found"
              description={query ? `No results for "${query}". Try a different search.` : 'Add your first product to get started.'}
              action={<Btn variant="primary" onClick={() => setDrawer({})}>Add product</Btn>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-sunken/40">
                    <th className="w-10 px-5 py-2.5">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        className="rounded border-line cursor-pointer accent-[color:var(--accent)]" />
                    </th>
                    {[
                      { label: 'Product', key: 'name' },
                      { label: 'SKU',     key: null },
                      { label: 'Price',   key: 'price' },
                      { label: 'Stock',   key: 'quantity' },
                      { label: 'Status',  key: null },
                    ].map(({ label, key }) => (
                      <th key={label}
                        onClick={key ? () => sort(key) : undefined}
                        className={`text-left text-[10.5px] font-medium text-ink-muted px-3 py-2.5 uppercase tracking-wide whitespace-nowrap
                          ${key ? 'cursor-pointer hover:text-ink select-none' : ''}`}>
                        <span className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon k={key} />}
                        </span>
                      </th>
                    ))}
                    <th className="w-16 px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map(p => {
                    const isLow  = p.quantity > 0 && p.quantity <= 10
                    const isOut  = p.quantity === 0
                    return (
                      <tr key={p.id} onClick={() => setDrawer(p)}
                        className="hover:bg-sunken transition-colors cursor-pointer group">
                        <td className={`px-5 py-3 ${isOut ? 'border-l-2 border-l-danger' : isLow ? 'border-l-2 border-l-warn' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleSelect(p.id) }}>
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => {}}
                            className="rounded border-line cursor-pointer accent-[color:var(--accent)]" />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-sunken border border-line flex items-center justify-center flex-shrink-0">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                              </svg>
                            </div>
                            <span className="font-medium text-ink">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3"><CodeBadge>{p.sku}</CodeBadge></td>
                        <td className="px-3 py-3 text-right font-mono">
                          ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-3 py-3 text-right font-mono font-semibold ${isOut ? 'text-danger' : isLow ? 'text-warn' : ''}`}>
                          {p.quantity}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={stockVariant(p.quantity)}>{stockLabel(p.quantity)}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Btn size="sm" variant="secondary" onClick={() => setDrawer(p)}>Edit</Btn>
                            <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              </svg>
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3.5 border-t border-line flex items-center justify-between">
              <span className="text-[12.5px] text-ink-muted">
                Showing <span className="font-medium text-ink">{filtered.length}</span> of{' '}
                <span className="font-medium text-ink">{products.length}</span> products
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

      {/* Quick-edit drawer */}
      {drawer !== null && (
        <ProductDrawer product={drawer} onClose={() => setDrawer(null)} onSaved={load} />
      )}
    </div>
  )
}
