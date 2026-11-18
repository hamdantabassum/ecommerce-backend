import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { wrap, protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Customer: order place karna (price server par DB se calculate hoti hai)
router.post('/', protect, wrap(async (req, res) => {
  const { items, address } = req.body
  if (!Array.isArray(items) || !items.length)
    return res.status(400).json({ message: 'Cart is empty' })
  const products = await Product.find({ _id: { $in: items.map((i) => i.product) } })
  const lines = []
  for (const i of items) {
    const p = products.find((x) => String(x._id) === String(i.product))
    const qty = Math.max(1, parseInt(i.qty) || 1)
    if (!p) return res.status(400).json({ message: 'A product in your cart no longer exists' })
    if (p.stock < qty) return res.status(400).json({ message: `${p.name} is out of stock` })
    lines.push({ product: p._id, name: p.name, price: p.price, image: p.image, qty })
  }
  for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { stock: -l.qty } })
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
  res.status(201).json(await Order.create({ user: req.user._id, items: lines, total, address }))
}))

router.get('/mine', protect, wrap(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'))
}))

// Admin
router.get('/stats', protect, adminOnly, wrap(async (_req, res) => {
  const [products, orders, users, rev] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])
  res.json({ products, orders, users, revenue: rev[0]?.total || 0 })
}))

router.get('/', protect, adminOnly, wrap(async (_req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort('-createdAt'))
}))

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
  if (!o) return res.status(404).json({ message: 'Order not found' })
  res.json(o)
}))

export default router
