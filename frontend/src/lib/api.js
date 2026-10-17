const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

// Item photos are served by the backend, which may be on another domain.
export function assetUrl(path) {
  return `${API_URL}${path}`
}

export function fetchItems() {
  return request('/api/items')
}

export function scoreDrawing({ itemId, drawing }) {
  return request('/api/score', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId, drawing }),
  })
}
