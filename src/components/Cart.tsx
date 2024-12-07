import React, { useState, useEffect } from 'react'
import { CartItem } from '../types/product'
import { ShippingForm } from './ShippingForm'

interface CartProps {
  items: CartItem[]
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, newQuantity: number) => void
  onShowOrderForm: () => void
  setShippingCost: (cost: number) => void
}

export function Cart({ items, removeFromCart, updateQuantity, onShowOrderForm, setShippingCost }: CartProps) {
  const [error, setError] = useState<string | null>(null)

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.Price) * item.quantity, 0)

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(variantId, newQuantity)
    }
  }

  const handleContinue = () => {
    if (items.length > 0) {
      onShowOrderForm()
    } else {
      setError('Your cart is empty. Please add items before proceeding.')
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Shopping Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <>
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2">Product</th>
                <th className="text-center pb-2">Quantity</th>
                <th className="text-right pb-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.Variant_ID} className="border-b">
                  <td className="py-2">
                    <div className="flex items-center">
                      <span className="text-gray-700">{item.Product_Name}</span>
                      <button 
                        onClick={() => removeFromCart(item.Variant_ID)}
                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                        aria-label={`Remove ${item.Product_Name} from cart`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.Variant_ID, parseInt(e.target.value))}
                      className="w-16 text-center border rounded-md"
                    />
                  </td>
                  <td className="py-2 text-right">${(parseFloat(item.Price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <ShippingForm 
              setShippingCost={setShippingCost} 
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleContinue}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => {
              items.forEach(item => removeFromCart(item.Variant_ID))
            }}
            className="mt-2 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  )
}

