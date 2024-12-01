import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query('SELECT * FROM products')
    connection.release()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

