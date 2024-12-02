import { NextResponse } from 'next/server'
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2'
import pool from '@/lib/db'

function generateId(prefix: string) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
    const orderId = generateId('OD');
    await connection.query(
      'INSERT INTO orders (Order_ID, Customer_ID, Order_Date, Total_Amount) VALUES (?, ?, NOW(), ?)',
      [orderId, customer_id, total_amount]
    )
    
    // Insert into order_items table and update inventory
    for (const item of items) {
      const orderItemId = generateId('OID');
      const bundle_id = item.bundle_id || 'BN01';
      
      // Insert order item
      await connection.query(
        'INSERT INTO order_items (OrderItem_ID, Order_ID, Bundle_ID, Variant_ID, Quantity, UnitPrice) VALUES (?, ?, ?, ?, ?, ?)',
        [orderItemId, orderId, bundle_id, item.variant_id, item.quantity, item.price]
      );

      // Update inventory
      const [variantResult] = await connection.query<RowDataPacket[]>(
        'SELECT Stock FROM product_variant WHERE Variant_ID = ?',
        [item.variant_id]
      );
      if (variantResult.length === 0) {
        throw new Error(`Variant ${item.variant_id} not found`);
      }
      const currentStock = variantResult[0].Stock;
      const newStock = currentStock - item.quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for variant ${item.variant_id}`);
      }

      await connection.query<OkPacket>(
        'UPDATE product_variant SET Stock = ? WHERE Variant_ID = ?',
        [newStock, item.variant_id]
      );
    }

    // Insert into payment_method table
    await connection.query(
      'INSERT INTO payment_method (PaymentMethod_ID, Order_ID, PaymentType, Amount) VALUES (?, ?, ?, ?)',
      [generateId('PM'), orderId, payment_method, total_amount]
    )

    // Insert into order_status table
    const statusId = generateId('ST');
    await connection.query(
      'INSERT INTO order_status (Status_ID, Order_ID, Status_Name, Timestamp) VALUES (?, ?, ?, NOW())',
      [statusId, orderId, 'Processing']
    )

    // Insert into order_history table
    await connection.query(
      'INSERT INTO order_history (History_ID, Order_ID, Status, Timestamp) VALUES (?, ?, ?, NOW())',
      [generateId('OH'), orderId, 'Order Placed']
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

