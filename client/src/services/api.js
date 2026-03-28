import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 8000,
})

// ── POIs ────────────────────────────────────────────────────
export const getPois = (params = {}) =>
  api.get('/pois', { params }).then((r) => r.data)

export const getPoiById = (id) =>
  api.get(`/pois/${id}`).then((r) => r.data)

// ── Route proxy (hides Google API key server-side) ──────────
export const getRoute = (origin, destination) =>
  api.post('/route', { origin, destination }).then((r) => r.data)

// ── Share ───────────────────────────────────────────────────
export const createShareLink = (payload) =>
  api.post('/share', payload).then((r) => r.data)

export default api