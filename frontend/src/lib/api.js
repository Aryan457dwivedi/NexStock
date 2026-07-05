import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Guard against a misconfigured/unreachable backend: when VITE_API_URL is
// empty and no backend is running, relative API paths can fall through to
// the frontend's own SPA index.html (a "successful" 200 text/html response).
// Without this check, that HTML string gets treated as valid JSON data and
// crashes every page that calls .map()/.filter() on it.
api.interceptors.response.use(
  res => {
    const isHtml = typeof res.data === 'string' && res.data.trim().startsWith('<!doctype')
    if (isHtml) {
      return Promise.reject(new Error(
        'No response from API. Is the backend running and is VITE_API_URL set correctly?'
      ))
    }
    return res
  },
  err => Promise.reject(new Error(err.response?.data?.detail || err.message || 'Request failed'))
)

export const getProducts     = ()         => api.get('/products/')
export const getProduct      = id         => api.get(`/products/${id}`)
export const createProduct   = data       => api.post('/products/', data)
export const updateProduct   = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct   = id         => api.delete(`/products/${id}`)

export const getCustomers    = ()         => api.get('/customers/')
export const createCustomer  = data       => api.post('/customers/', data)
export const deleteCustomer  = id         => api.delete(`/customers/${id}`)

export const getOrders       = ()         => api.get('/orders/')
export const getOrder        = id         => api.get(`/orders/${id}`)
export const createOrder     = data       => api.post('/orders/', data)
export const deleteOrder     = id         => api.delete(`/orders/${id}`)

export const getDashboard    = ()         => api.get('/dashboard/stats')
