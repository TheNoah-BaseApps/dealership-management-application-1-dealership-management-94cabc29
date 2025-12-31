/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    let sqlQuery = `
      SELECT s.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        v.year || ' ' || v.make || ' ' || v.model as vehicle_info,
        v.vin as vehicle_vin,
        u.name as salesperson_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      LEFT JOIN users u ON s.salesperson_id = u.id
    `;
    let params = [];

    if (customerId) {
      sqlQuery += ' WHERE s.customer_id = $1';
      params = [customerId];
    }

    sqlQuery += ' ORDER BY s.created_at DESC';

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get sales error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const client = await getClient();
  
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customer_id,
      vehicle_id,
      sale_price,
      financing_type,
      trade_in_value,
      warranty_package,
      delivery_date,
    } = body;

    if (!customer_id || !vehicle_id || !sale_price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Create sale
    const saleResult = await client.query(
      `INSERT INTO sales (
        customer_id, vehicle_id, sale_date, sale_price, financing_type,
        salesperson_id, trade_in_value, delivery_date, warranty_package,
        sale_status, created_at, updated_at
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        customer_id,
        vehicle_id,
        sale_price,
        financing_type || 'cash',
        user.userId,
        trade_in_value || null,
        delivery_date || null,
        warranty_package || null,
        'pending',
      ]
    );

    // Update vehicle status to reserved
    await client.query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['reserved', vehicle_id]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, data: saleResult.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create sale error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}