import { NextResponse } from 'next/server';
import { RowDataPacket, OkPacket } from 'mysql2';
import pool from '@/lib/db';


// Helper function to generate unique IDs
function generateId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    console.log('Received order data:', JSON.stringify(body, null, 2));

    const { customer_id, total_amount, payment_method, items, shipping_address } = body;


    // Validate input data
    if (!customer_id || !total_amount || !payment_method || !items || items.length === 0 || !shipping_address) {
      console.error('Invalid order data:', { customer_id, total_amount, payment_method, items, shipping_address });
      return NextResponse.json({ error: 'Invalid order data. Please check all required fields are provided.' }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const orderId = generateId('OD');

    // Insert into orders table
    await connection.query<OkPacket>(
      'INSERT INTO orders (Order_ID, Customer_ID, Order_Date, Total_Amount) VALUES (?, ?, NOW(), ?)',
      [orderId, customer_id, total_amount]
    );

    // Insert into order_items table and update inventory
    for (const item of items) {
      const orderItemId = generateId('OID');
      const bundle_id = item.bundle_id || 'BN01';
      
      await connection.query<OkPacket>(
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
    await connection.query<OkPacket>(
      'INSERT INTO payment_method (PaymentMethod_ID, Order_ID, PaymentType, Amount) VALUES (?, ?, ?, ?)',
      [generateId('PM'), orderId, payment_method, total_amount]
    );

    // Insert into order_status table
    const statusId = generateId('ST');
    await connection.query<OkPacket>(
      'INSERT INTO order_status (Status_ID, Order_ID, Status_Name, Timestamp) VALUES (?, ?, ?, NOW())',
      [statusId, orderId, 'Processing']
    );

    // Insert into order_history table
    await connection.query<OkPacket>(
      'INSERT INTO order_history (History_ID, Order_ID, Status, Timestamp) VALUES (?, ?, ?, NOW())',
      [generateId('OH'), orderId, 'Order Placed']
    );

    // Insert into shipping_cost table
    const shippingCostId = generateId('SC');
    const orderSize = items.length <= 2 ? 'Small' : items.length <= 5 ? 'Medium' : 'Large';
    const shippingWeight = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    const shippingCost = 5.99; // Default shipping cost, you may want to calculate this based on weight, destination, etc.

    await connection.query<OkPacket>(
      'INSERT INTO shipping_cost (ShippingCost_ID, Order_ID, OrderSize, ShippingWeight, Destination, ShippingCost) VALUES (?, ?, ?, ?, ?, ?)',
      [shippingCostId, orderId, orderSize, shippingWeight, shipping_address, shippingCost]
    );

    // Insert into shipping_info table
    const shippingId = generateId('SH');
    await connection.query<OkPacket>(
      'INSERT INTO shipping_info (Shipping_ID, Order_ID, Shipping_Address, ShippingCost_ID) VALUES (?, ?, ?, ?)',
      [shippingId, orderId, shipping_address, shippingCostId]
    );

    await connection.commit();
    console.log('Order placed successfully. Order ID:', orderId);
    return NextResponse.json({ success: true, order_id: orderId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error placing order:', error);
    let errorMessage = 'Failed to place order. Please try again.';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

