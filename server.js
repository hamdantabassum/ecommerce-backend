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

app.get('/', (_req, res) => res.json({ ok: true, message: 'E-commerce API running' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' })
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 5000
    app.listen(port, () => console.log(`Server running on port ${port}`))
  })
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message)
    process.exit(1)
  })
