'use client'

import React, { useState } from 'react'
import { CartItem } from '@/types/product'
import { User } from '@/types/user'

interface OrderFormProps {
  items: CartItem[]
  user: User
  total: number
  shippingCost: number
  onClose: () => void
}

const paymentMethods = ['Cash', 'PayPal', 'Credit Card', 'Debit Card']

export function OrderForm({ items, user, total, shippingCost, onClose }: OrderFormProps) {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const orderData = {
      customer_id: user.Customer_ID,
      total_amount: total,
      payment_method: selectedPaymentMethod,
      items: items.map(item => ({
        variant_id: item.Variant_ID,
        bundle_id: item.Bundle_ID || 'BN01',
        quantity: item.quantity,
        price: parseFloat(item.Price)
      })),
      shipping_address: user.Customer_Address
    }

    try {
      console.log('Sending order data:', JSON.stringify(orderData, null, 2))

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || 'Failed to place order')
        }
        setOrderId(result.order_id)
      } else {
        const text = await response.text()
        console.error('Received non-JSON response:', text)
        throw new Error('Server error: Received unexpected response. Check server logs for details.')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      if (error instanceof Error) {
        setError(`Failed to place order: ${error.message}`)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" aria-modal="true" role="dialog">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Confirm Order</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {!orderId ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p><strong>Customer:</strong> {user.Customer_Name}</p>
              <p><strong>Email:</strong> {user.Customer_Email}</p>
              <p><strong>Shipping Address:</strong> {user.Customer_Address}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">Order Summary</h4>
              <ul>
                {items.map((item, index) => (
                  <li key={index} className="text-gray-700">{item.Product_Name} - ${parseFloat(item.Price).toFixed(2)} x {item.quantity}</li>
                ))}
              </ul>
              <p className="mt-2 text-gray-700">Subtotal: ${(total - shippingCost).toFixed(2)}</p>
              <p className="text-gray-700">Shipping: ${shippingCost.toFixed(2)}</p>
              <p className="font-bold mt-2 text-gray-900">Total: ${total.toFixed(2)}</p>
            </div>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-4 text-green-600">Order placed successfully! Order ID: {orderId}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

