import { NextResponse } from 'next/server'
import { OkPacket } from 'mysql2'
import pool from '@/lib/db'

export async function POST(request: Request) {
  let connection;
  try {
    const { destination, address, orderId, orderSize, shippingWeight } = await request.json()

    if (!destination || !address || !orderId || !orderSize || !shippingWeight) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const shippingCostId = `SC${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const shippingId = `SH${Date.now()}${Math.floor(Math.random() * 1000)}`;

    connection = await pool.getConnection()
    
    // Start transaction
    await connection.beginTransaction()

    // Insert into shipping_cost table
    await connection.query<OkPacket>(
      'INSERT INTO shipping_cost (ShippingCost_ID, Order_ID, OrderSize, ShippingWeight, Destination, ShippingCost) VALUES (?, ?, ?, ?, ?, ?)',
      [shippingCostId, orderId, orderSize, shippingWeight, destination, 5.99]
    );

    // Insert into shipping_info table
    await connection.query<OkPacket>(
      'INSERT INTO shipping_info (Shipping_ID, Order_ID, Shipping_Address, ShippingCost_ID) VALUES (?, ?, ?, ?)',
      [shippingId, orderId, address, shippingCostId]
    );

    // Commit transaction
    await connection.commit()

    return NextResponse.json({ message: 'Shipping information recorded successfully' })
  } catch (error) {
    console.error('Error in record-shipping API:', error)
    if (connection) await connection.rollback()
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

