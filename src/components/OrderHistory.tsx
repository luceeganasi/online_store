'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@/types/user'

interface Order {
  Order_ID: string;
  Order_Date: string;
  Total_Amount: number;
  Status_Name: string;
  Timestamp: string;
}

export function OrderHistory({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch(`/api/order-history?customerId=${user.Customer_ID}`)
        if (!response.ok) {
          throw new Error('Failed to fetch order history')
        }
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching order history:', error)
        setError('Failed to load order history. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderHistory()
  }, [user.Customer_ID])

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, customer_id: user.Customer_ID }),
      })

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to cancel order')
        }
        // Update the local state to reflect the cancellation
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.Order_ID === orderId
              ? { ...order, Status_Name: 'Cancelled' }
              : order
          )
        )
      } else {
        // Handle non-JSON response (likely HTML error page)
        const text = await response.text()
        console.error('Received non-JSON response:', text)
        throw new Error('Server error: Received unexpected response. Please try again later.')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    }
  }

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <div>Loading order history...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="mt-8 text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {currentOrders.map((order, index) => (
              <li key={`${order.Order_ID}-${index}`} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Order ID: {order.Order_ID}</p>
                    <p>Date: {new Date(order.Order_Date).toLocaleDateString()}</p>
                    <p>Total: ${order.Total_Amount.toFixed(2)}</p>
                    <p className={`font-medium ${
     order.Status_Name === 'Cancelled' ? 'text-red-600' :
     order.Status_Name === 'Processing' ? 'text-blue-600' :
     order.Status_Name === 'Shipped' ? 'text-green-600' :
     'text-gray-600'
   }`}>Status: {order.Status_Name}</p>
                  </div>
                  {order.Status_Name === 'Processing' && (
                    <button
                      onClick={() => handleCancelOrder(order.Order_ID)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      aria-label={`Cancel order ${order.Order_ID}`}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, i) => (
              <button
                key={`page-${i + 1}`}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

