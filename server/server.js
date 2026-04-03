import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import schemesRouter from './routes/schemes.js'
import applicationsRouter from './routes/applications.js'
import usersRouter from './routes/users.js'
import ragRouter from './routes/rag.js'



dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/schemes', schemesRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/users', usersRouter)
app.use('/api/rag', ragRouter)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})