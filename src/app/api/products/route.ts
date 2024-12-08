import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection()

    // Query to fetch products with their variants
    const [rows] = await connection.query(`
      SELECT 
        p.Product_ID, 
        p.Product_Name, 
        pv.Prize as Price, 
        pv.Size, 
        pv.Stock, 
        pv.Color,
        pv.Variant_ID
      FROM 
        products p
      JOIN 
        product_variant pv ON p.Product_ID = pv.Product_ID
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

