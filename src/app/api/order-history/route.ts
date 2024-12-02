import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
  }

  let connection;
  try {
    connection = await pool.getConnection()
    const [rows] = await connection.query(`
      SELECT o.Order_ID, o.Order_Date, o.Total_Amount, os.Status_Name, oh.Timestamp
      FROM orders o
      JOIN order_status os ON o.Order_ID = os.Order_ID
      JOIN order_history oh ON o.Order_ID = oh.Order_ID
      WHERE o.Customer_ID = ?
      ORDER BY o.Order_Date DESC
    `, [customerId])

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

