import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { wrap, protect } from '../middleware/auth.js'

const router = Router()
const out = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role },
})

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and password (min 6 characters) required' })
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(400).json({ message: 'Email already registered' })
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  res.status(201).json(out(user))
}))

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: (email || '').toLowerCase() })
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(400).json({ message: 'Wrong email or password' })
  res.json(out(user))
}))

router.get('/me', protect, (req, res) => res.json(req.user))

export default router
