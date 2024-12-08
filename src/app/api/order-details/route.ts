import { NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'

export async function GET(request: Request) {
  // Extract the orderId from the URL search parameters
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  // Validate that an orderId is provided
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  let connection;
  try {
    // Acquire a database connection from the connection pool
    connection = await pool.getConnection()

    // Execute a SQL query to fetch order details
    // This query joins the orders and order_status tables to get comprehensive order information
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT o.Order_ID, o.Order_Date, o.Total_Amount, os.Status_Name
      FROM orders o
      JOIN order_status os ON o.Order_ID = os.Order_ID
      WHERE o.Order_ID = ?
    `, [orderId])


    // Check if the order exists
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }


    // Return the first (and only) row of the query result
    return NextResponse.json(rows[0])
  } catch (error) {

    // Log any errors that occur during the database operation
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

