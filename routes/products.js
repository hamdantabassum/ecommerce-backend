import { Router } from 'express'
import Product from '../models/Product.js'
import { wrap, protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/', wrap(async (req, res) => {
  const { q, category } = req.query
  const filter = {}
  if (q) filter.name = { $regex: q, $options: 'i' }
  if (category) filter.category = category
  res.json(await Product.find(filter).sort('-createdAt'))
}))

router.get('/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id)
  if (!p) return res.status(404).json({ message: 'Product not found' })
  res.json(p)
}))

router.post('/', protect, adminOnly, wrap(async (req, res) => {
  res.status(201).json(await Product.create(req.body))
}))

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!p) return res.status(404).json({ message: 'Product not found' })
  res.json(p)
}))

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
}))

export default router
