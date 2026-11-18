import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Product from './models/Product.js'

await mongoose.connect(process.env.MONGO_URI)

const email = (process.env.ADMIN_EMAIL || 'admin@shopease.com').toLowerCase()
if (!(await User.findOne({ email }))) {
  await User.create({
    name: 'Admin',
    email,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10),
    role: 'admin',
  })
  console.log('Admin created:', email)
} else {
  console.log('Admin already exists')
}

if ((await Product.countDocuments()) === 0) {
  const img = (s) => `https://picsum.photos/seed/${s}/600/600`
  await Product.insertMany([
    { name: 'Classic White Tee', category: 'Clothing', price: 1499, stock: 40, image: img('tee'), description: 'Soft cotton t-shirt for everyday wear.' },
    { name: 'Denim Jacket', category: 'Clothing', price: 5999, stock: 15, image: img('jacket'), description: 'Durable denim jacket with a relaxed fit.' },
    { name: 'Running Shoes', category: 'Shoes', price: 7499, stock: 25, image: img('shoes'), description: 'Lightweight shoes built for daily runs.' },
    { name: 'Wireless Earbuds', category: 'Electronics', price: 4999, stock: 30, image: img('earbuds'), description: 'Bluetooth earbuds with 20 hours of battery.' },
    { name: 'Smart Watch', category: 'Electronics', price: 8999, stock: 12, image: img('watch'), description: 'Track steps, sleep and notifications.' },
    { name: 'Leather Wallet', category: 'Accessories', price: 1999, stock: 50, image: img('wallet'), description: 'Slim genuine leather wallet.' },
  ])
  console.log('Sample products added')
}

await mongoose.disconnect()
console.log('Seed done')
