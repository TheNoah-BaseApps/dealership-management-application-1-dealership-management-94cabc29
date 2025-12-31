/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lead created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';
import { canAccessLeads } from '@/lib/permissions';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canAccessLeads(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    let sqlQuery = `
      SELECT l.*, u.name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      ORDER BY l.created_at DESC
    `;
    let params = [];

    // Salespersons can only see their own leads
    if (user.role === 'salesperson') {
      sqlQuery = `
        SELECT l.*, u.name as assigned_to_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.assigned_to = $1
        ORDER BY l.created_at DESC
      `;
      params = [user.userId];
    }

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!canAccessLeads(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      lead_source,
      lead_status,
      contact_name,
      contact_phone,
      contact_email,
      vehicle_interested,
      inquiry_date,
      follow_up_date,
      estimated_value,
      notes,
    } = body;

    // Validate required fields
    if (!lead_source || !contact_name || !contact_email || !contact_phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert lead
    const result = await query(
      `INSERT INTO leads (
        lead_source, lead_status, contact_name, contact_phone, contact_email,
        vehicle_interested, inquiry_date, follow_up_date, assigned_to,
        estimated_value, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        lead_source,
        lead_status || 'new',
        contact_name,
        contact_phone,
        contact_email,
        vehicle_interested || null,
        inquiry_date || new Date().toISOString(),
        follow_up_date || null,
        user.userId, // Auto-assign to creator
        estimated_value || null,
        notes || null,
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}