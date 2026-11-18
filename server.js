// Sirf local development ke liye (npm run dev / npm start). Vercel api/index.js use karta hai.
import app, { connectDB } from './app.js'

const port = process.env.PORT || 5000

connectDB()
  .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message)
    process.exit(1)
  })
