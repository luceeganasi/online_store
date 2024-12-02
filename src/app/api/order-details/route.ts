import { NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  let connection;
  try {
    connection = await pool.getConnection()
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT o.Order_ID, o.Order_Date, o.Total_Amount, os.Status_Name
      FROM orders o
      JOIN order_status os ON o.Order_ID = os.Order_ID
      WHERE o.Order_ID = ?
    `, [orderId])

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

