import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const app = express()
const origins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((s) => s.trim())
  : true

app.use(cors({ origin: origins }))
app.use(express.json())

// Serverless mein har request par naya connection na bane, isliye reuse hota hai
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  if (!global._mongoPromise) {
    global._mongoPromise = mongoose
      .connect(process.env.MONGO_URI, { bufferCommands: false })
      .catch((e) => {
        global._mongoPromise = null
        throw e
      })
  }
  await global._mongoPromise
}

app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (e) {
    next(e)
  }
})

app.get('/', (_req, res) => res.json({ ok: true, message: 'E-commerce API running' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' })
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

export default app
