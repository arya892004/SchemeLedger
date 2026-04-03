import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { getRecommendations, chatWithAssistant, retrieveSchemes } from '../rag/ragEngine.js'

const router = express.Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: 'active',
    knowledgeBase: 'loaded',
    timestamp: new Date().toISOString(),
  })
})

// Get AI-powered scheme recommendations
router.post('/recommend', verifyToken, async (req, res) => {
  try {
    const { profile } = req.body
    if (!profile || Object.keys(profile).length === 0) {
      return res.status(400).json({ error: 'Profile is required' })
    }
    const result = await getRecommendations(profile)
    res.json(result)
  } catch (err) {
    console.error('RAG recommend error:', err)
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
})

// Chat with AI assistant
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, history = [], profile = {} } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }
    const result = await chatWithAssistant(message, history, profile)
    res.json(result)
  } catch (err) {
    console.error('RAG chat error:', err)
    res.status(500).json({ error: err.message || 'Failed to process message' })
  }
})

// Search schemes (no AI, pure retrieval)
router.get('/search', verifyToken, (req, res) => {
  try {
    const { q, limit = 5 } = req.query
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' })
    const results = retrieveSchemes(q, parseInt(limit))
    res.json({ results, total: results.length })
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

export default router