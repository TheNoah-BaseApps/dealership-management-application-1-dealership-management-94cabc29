/**
 * @swagger
 * /api/leads/{id}/convert:
 *   post:
 *     summary: Convert lead to customer and sale
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getClient } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
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

    // Get lead details
    const leadResult = await client.query(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );

    if (leadResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leadResult.rows[0];

    // Create customer
    const customerResult = await client.query(
      `INSERT INTO customers (name, email, phone, lead_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [lead.contact_name, lead.contact_email, lead.contact_phone, lead.id]
    );

    const customerId = customerResult.rows[0].id;

    // Create sale record (pending status)
    const saleResult = await client.query(
      `INSERT INTO sales (
        customer_id, sale_status, salesperson_id, created_at, updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id`,
      [customerId, 'pending', user.userId]
    );

    const saleId = saleResult.rows[0].id;

    // Update lead status
    await client.query(
      `UPDATE leads SET lead_status = $1, updated_at = NOW() WHERE id = $2`,
      ['won', id]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: {
        customerId,
        saleId,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Convert lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}