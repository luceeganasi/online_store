'use client'

import React, { useState, useEffect } from 'react'
import { Product } from '@/types/product'

interface OrderFormProps {
  items: Product[]
  onClose: () => void
}

export function OrderForm({ items, onClose }: OrderFormProps) {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, this would be an API call
    const mockPaymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer']
    setPaymentMethods(mockPaymentMethods)
    setSelectedPaymentMethod(mockPaymentMethods[0])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const total = items.reduce((sum, item) => sum + parseFloat(item.Price), 0)

    const orderData = {
      customer_id: 'CSTMR01', // In a real app, this would be the logged-in user's ID
      total_amount: total,
      items: items.map(item => ({
        variant_id: item.Product_ID,
        quantity: 1,
        price: parseFloat(item.Price)
      }))
    }

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      const result = await response.json()
      setOrderId(result.order_id)
    } catch (error) {
      console.error('Error placing order:', error)
      setError('Failed to place order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    // In a real application, this would be an API call to cancel the order
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" aria-modal="true" role="dialog">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Place Order</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!orderId ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                id="payment-method"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-4">Order placed successfully! Order ID: {orderId}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Order
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

