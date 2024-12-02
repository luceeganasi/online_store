import { NextResponse } from 'next/server'
import pool from '@/lib/db'

function generateOrderId() {
  return 'OD' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function generateOrderItemId() {
  return 'OID' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json()
    const { customer_id, total_amount, payment_method, items } = body

    if (!customer_id || !total_amount || !payment_method || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // Insert into orders table
    const orderId = generateOrderId();
    const [orderResult] = await connection.query(
      'INSERT INTO orders (Order_ID, Customer_ID, Order_Date, Total_Amount) VALUES (?, ?, NOW(), ?)',
      [orderId, customer_id, total_amount]
    )
    
    // Insert into order_items table
    for (const item of items) {
      const orderItemId = generateOrderItemId();
      const bundle_id = item.bundle_id || 'BN01'; // Use 'BN01' as default if bundle_id is not provided
      await connection.query(
        'INSERT INTO order_items (OrderItem_ID, Order_ID, Bundle_ID, Variant_ID, Quantity, UnitPrice) VALUES (?, ?, ?, ?, ?, ?)',
        [orderItemId, orderId, bundle_id, item.variant_id, item.quantity, item.price]
      );
    }

    // Insert into payment_method table
    await connection.query(
      'INSERT INTO payment_method (PaymentMethod_ID, Order_ID, PaymentType, Amount) VALUES (?, ?, ?, ?)',
      [`PM${orderId}`, orderId, payment_method, total_amount]
    )

    // Insert into order_status table
    await connection.query(
      'INSERT INTO order_status (Status_ID, Order_ID, Status_Name, Timestamp) VALUES (?, ?, ?, NOW())',
      [`ST${orderId}`, orderId, 'Processing']
    )

    await connection.commit()
    return NextResponse.json({ success: true, order_id: orderId })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('Error placing order:', error)
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

