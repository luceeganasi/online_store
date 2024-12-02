import React from 'react'
import { Product } from '../types/product'

interface CartProps {
  items: Product[]
  removeFromCart: (index: number) => void
  placeOrder: () => void
}

export function Cart({ items, removeFromCart, placeOrder }: CartProps) {
  const total = items.reduce((sum, item) => sum + parseFloat(item.Price), 0)

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Shopping Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="text-gray-700">{item.Product_Name} - ${parseFloat(item.Price).toFixed(2)}</span>
              <button 
                onClick={() => removeFromCart(index)}
                className="text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                aria-label={`Remove ${item.Product_Name} from cart`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="font-semibold text-lg mb-4 text-gray-900">Total: ${total.toFixed(2)}</p>
        <button
          onClick={placeOrder}
          disabled={items.length === 0}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  )
}

