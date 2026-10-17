const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export function checkHealth() {
  return request('/api/health')
}

export function scoreDrawing({ itemId, itemImageUrl, drawing }) {
  return request('/api/score', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId, item_image_url: itemImageUrl, drawing }),
  })
}
