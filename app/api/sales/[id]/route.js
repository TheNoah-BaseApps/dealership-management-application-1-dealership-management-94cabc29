/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const result = await query(
      `SELECT s.*,
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
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get sale error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const {
      sale_status,
      delivery_date,
      warranty_package,
    } = body;

    const result = await query(
      `UPDATE sales SET
        sale_status = COALESCE($1, sale_status),
        delivery_date = COALESCE($2, delivery_date),
        warranty_package = COALESCE($3, warranty_package),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [sale_status, delivery_date, warranty_package, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update sale error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const client = await getClient();
  
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await client.query('BEGIN');

    // Get sale to check vehicle
    const saleResult = await client.query(
      'SELECT vehicle_id FROM sales WHERE id = $1',
      [id]
    );

    if (saleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    const vehicleId = saleResult.rows[0].vehicle_id;

    // Delete sale
    await client.query('DELETE FROM sales WHERE id = $1', [id]);

    // Update vehicle status back to available
    if (vehicleId) {
      await client.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['available', vehicleId]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete sale error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}