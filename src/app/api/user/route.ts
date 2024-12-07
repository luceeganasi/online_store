import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection()
    
    // For this example, we'll just fetch the first user
    const [rows] = await connection.query('SELECT * FROM customer LIMIT 1')
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    if (connection) connection.release()
  }
}

