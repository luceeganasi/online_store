// File: order-history/route.ts

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  // Extract the customerId from the URL search parameters
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  // Validate that a customerId is provided
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
  }

  let connection;
  try {
    // Acquire a database connection from the connection pool
    connection = await pool.getConnection()

    // Execute a SQL query to fetch order history
    // This query joins the orders, order_status, and order_history tables
    // to get comprehensive order information for the specified customer
    const [rows] = await connection.query(`
      SELECT o.Order_ID, o.Order_Date, o.Total_Amount, os.Status_Name, oh.Timestamp
      FROM orders o
      JOIN order_status os ON o.Order_ID = os.Order_ID
      JOIN order_history oh ON o.Order_ID = oh.Order_ID
      WHERE o.Customer_ID = ?
      ORDER BY o.Order_Date DESC
    `, [customerId])

    // Return the query results as a JSON response
    return NextResponse.json(rows)
  } catch (error) {
    // Log any errors that occur during the database operation
    console.error('Error fetching order history:', error)
    // Return a 500 Internal Server Error response if an error occurs
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  } finally {
    // Always release the database connection back to the pool, even if an error occurred
    if (connection) connection.release()
  }
}