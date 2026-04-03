import express from 'express'
import { db } from '../config/firebase.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get()
    if (!doc.exists) return res.status(404).json({ error: 'User not found' })
    res.json({ id: doc.id, ...doc.data() })
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

router.patch('/me', verifyToken, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'state', 'occupation', 'income', 'dateOfBirth']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    updates.updatedAt = new Date()
    await db.collection('users').doc(req.user.uid).update(updates)
    res.json({ message: 'Profile updated successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
