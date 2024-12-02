'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductList } from '../components/ProductList'
import { Cart } from '../components/Cart'
import { OrderForm } from '../components/OrderForm'
import { OrderHistory } from '../components/OrderHistory'
import { Product } from '../types/product'
import { User } from '../types/user'

export default function Home() {
  const [cartItems, setCartItems] = useState<Product[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product])
  }

  const removeFromCart = (index: number) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)
  }

  const placeOrder = () => {
    setShowOrderForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-blue-600 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Online Store</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ProductList addToCart={addToCart} />
              {user && <OrderHistory user={user} />}
            </div>
            <div>
              <Cart items={cartItems} removeFromCart={removeFromCart} placeOrder={placeOrder} />
            </div>
          </div>
        </div>
      </main>
      {showOrderForm && (
        <OrderForm items={cartItems} onClose={() => setShowOrderForm(false)} />
      )}
    </div>
  )
}

