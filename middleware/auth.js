import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// async errors ko Express error handler tak pohanchata hai
export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export const protect = wrap(async (req, res, next) => {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please login first' })
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(id).select('-password')
  } catch {
    return res.status(401).json({ message: 'Session expired, login again' })
  }
  if (!req.user) return res.status(401).json({ message: 'User not found' })
  next()
})

export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access only' })
