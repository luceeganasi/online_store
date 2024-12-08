import { NextResponse } from 'next/server'
import { RowDataPacket, OkPacket } from 'mysql2'
import pool from '@/lib/db'

export async function POST(request: Request) {
  let connection;
  try {
    // Extract order_id and customer_id from the request body
    const { order_id, customer_id } = await request.json()

    // Acquire a database connection from the connection pool
    connection = await pool.getConnection()
    
    // Start transaction
    await connection.beginTransaction()

    // Check if the order belongs to the customer and is cancellable
    const [orderResult] = await connection.query<RowDataPacket[]>(
      'SELECT o.Order_ID, os.Status_Name FROM orders o JOIN order_status os ON o.Order_ID = os.Order_ID WHERE o.Order_ID = ? AND o.Customer_ID = ?',
      [order_id, customer_id]
    );

    // If no order is found, rollback the transaction and return an error
    if (orderResult.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Order not found or does not belong to the customer' }, { status: 404 })
    }

    // If the order is not in 'Processing' state, it can't be cancelled
    if (orderResult[0].Status_Name !== 'Processing') {
      await connection.rollback()
      return NextResponse.json({ error: 'Order cannot be cancelled in its current state' }, { status: 400 })
    }

    // Restore inventory for the cancelled items
    const [orderItems] = await connection.query<RowDataPacket[]>(
      'SELECT Variant_ID, Quantity FROM order_items WHERE Order_ID = ?',
      [order_id]
    );

    for (const item of orderItems) {
      await connection.query<OkPacket>(
        'UPDATE product_variant SET Stock = Stock + ? WHERE Variant_ID = ?',
        [item.Quantity, item.Variant_ID]
      );
    }

    // Update the order status to 'Cancelled'
    await connection.query<OkPacket>(
      'UPDATE order_status SET Status_Name = ?, Timestamp = NOW() WHERE Order_ID = ?',
      ['Cancelled', order_id]
    );

    // Add cancellation to order history
    await connection.query<OkPacket>(
      'INSERT INTO order_history (History_ID, Order_ID, Status, Timestamp) VALUES (UUID(), ?, ?, NOW())',
      [order_id, 'Cancelled']
    );

    // Fetch the total amount of the order for refund processing
    const [orderDetails] = await connection.query<RowDataPacket[]>(
      'SELECT Total_Amount FROM orders WHERE Order_ID = ?',
      [order_id]
    );

    // Create an entry in the cancel_orders table for refund processing
    await connection.query<OkPacket>(
      'INSERT INTO cancel_orders (CancelOrder_ID, Order_ID, Cancel_Date, Refund_Amount, Refund_Status) VALUES (?, ?, NOW(), ?, ?)',
      [`CO${Date.now()}`, order_id, orderDetails[0].Total_Amount, 'Pending']
    );

    // Commit transaction
    await connection.commit()

    return NextResponse.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    console.error('Error in cancel-order API:', error)
    if (connection) await connection.rollback()
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

