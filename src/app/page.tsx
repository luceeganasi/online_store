'use client'

import React, { useState, useEffect } from 'react'
import { ProductList } from '../components/ProductList'
import { Cart } from '../components/Cart'
import { OrderForm } from '../components/OrderForm'
import { OrderHistory } from '../components/OrderHistory'
import { Product, CartItem } from '../types/product'
import { User } from '../types/user'

export default function Home() {
  // State for managing cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // State for controlling the visibility of the order form
  const [showOrderForm, setShowOrderForm] = useState(false)

  // State for storing user information
  const [user, setUser] = useState<User | null>(null)

  // State for shipping cost
  const [shippingCost, setShippingCost] = useState(5.99)

  // Fetch user data when the component mounts
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

  /**
   * Add a product to the cart
   * If the product is already in the cart, increase its quantity
   * Otherwise, add it as a new item with quantity 1
   */
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.Variant_ID === product.Variant_ID)
      if (existingItem) {
        return prevItems.map(item =>
          item.Variant_ID === product.Variant_ID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }


  /**
   * Remove an item from the cart based on its variant ID
   */
  const removeFromCart = (variantId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.Variant_ID !== variantId))
  }


  /**
   * Update the quantity of an item in the cart
   */
  const updateQuantity = (variantId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.Variant_ID === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }


  /**
   * Show the order form
   */
  const handleShowOrderForm = () => {
    setShowOrderForm(true)
  }


  /**
   * Close the order form
   */
  const handleCloseOrderForm = () => {
    setShowOrderForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-blue-600 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Online Store</h1>
          <div className="flex items-center space-x-4">            
          </div>
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
              <Cart
                items={cartItems}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                onShowOrderForm={handleShowOrderForm}
                setShippingCost={setShippingCost}
              />
            </div>
          </div>
        </div>
      </main>
      {showOrderForm && user && (
        <OrderForm
          items={cartItems}
          user={user}
          total={cartItems.reduce((sum, item) => sum + parseFloat(item.Price) * item.quantity, 0) + shippingCost}
          shippingCost={shippingCost}
          onClose={handleCloseOrderForm}
        />
      )}
    </div>
  )
}

