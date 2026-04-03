import { auth } from './firebase'

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function getAIRecommendations(profile) {
  const headers = await getAuthHeader()
  const res = await fetch('/api/rag/recommend', {
    method: 'POST',
    headers,
    body: JSON.stringify({ profile }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to get recommendations')
  }
  return res.json()
}

export async function sendChatMessage(message, history = [], profile = {}) {
  const headers = await getAuthHeader()
  const res = await fetch('/api/rag/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history, profile }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to send message')
  }
  return res.json()
}

export async function searchSchemes(query, limit = 5) {
  const headers = await getAuthHeader()
  const res = await fetch(`/api/rag/search?q=${encodeURIComponent(query)}&limit=${limit}`, { headers })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}