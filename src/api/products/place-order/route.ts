import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, total_amount, items } = body

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Insert into orders table
      const [orderResult] = await connection.query(
        'INSERT INTO orders (Customer_ID, Order_Date, Total_Amount) VALUES (?, NOW(), ?)',
        [customer_id, total_amount]
      )
      const orderId = (orderResult as any).insertId

      // Insert into order_items table
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (Order_ID, Variant_ID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)',
          [orderId, item.variant_id, item.quantity, item.price]
        )
      }

      await connection.commit()
      connection.release()

      return NextResponse.json({ success: true, order_id: orderId })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Error placing order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

