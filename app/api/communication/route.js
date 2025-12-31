import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/communication:
 *   get:
 *     summary: Get all communication records
 *     description: Retrieve a list of all dealership communication records with pagination and filtering
 *     tags: [Communication]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: response_status
 *         schema:
 *           type: string
 *         description: Filter by response status
 *     responses:
 *       200:
 *         description: Successful response with list of communication records
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const customerId = searchParams.get('customer_id');
    const responseStatus = searchParams.get('response_status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM communication WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (customerId) {
      queryText += ` AND customer_id = $${paramCount}`;
      queryParams.push(customerId);
      paramCount++;
    }

    if (responseStatus) {
      queryText += ` AND response_status = $${paramCount}`;
      queryParams.push(responseStatus);
      paramCount++;
    }

    queryText += ` ORDER BY communication_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    const countResult = await query('SELECT COUNT(*) FROM communication WHERE 1=1' + 
      (customerId ? ' AND customer_id = $1' : '') + 
      (responseStatus ? ` AND response_status = $${customerId ? 2 : 1}` : ''),
      [customerId, responseStatus].filter(Boolean)
    );

    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching communication records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/communication:
 *   post:
 *     summary: Create a new communication record
 *     description: Create a new dealership communication record
 *     tags: [Communication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - communication_id
 *               - customer_id
 *               - communication_date
 *               - communication_type
 *               - subject
 *               - message_content
 *               - sent_by
 *               - response_status
 *               - follow_up_required
 *               - channel_used
 *             properties:
 *               communication_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               communication_date:
 *                 type: string
 *                 format: date-time
 *               communication_type:
 *                 type: string
 *               subject:
 *                 type: string
 *               message_content:
 *                 type: string
 *               sent_by:
 *                 type: string
 *               response_status:
 *                 type: string
 *               follow_up_required:
 *                 type: boolean
 *               follow_up_date:
 *                 type: string
 *                 format: date-time
 *               channel_used:
 *                 type: string
 *     responses:
 *       201:
 *         description: Communication record created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      communication_id,
      customer_id,
      communication_date,
      communication_type,
      subject,
      message_content,
      sent_by,
      response_status,
      follow_up_required,
      follow_up_date,
      channel_used
    } = body;

    if (!communication_id || !customer_id || !communication_date || !communication_type || 
        !subject || !message_content || !sent_by || !response_status || 
        follow_up_required === undefined || !channel_used) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO communication (
        communication_id, customer_id, communication_date, communication_type, subject,
        message_content, sent_by, response_status, follow_up_required, follow_up_date,
        channel_used, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
      [
        communication_id,
        customer_id,
        communication_date,
        communication_type,
        subject,
        message_content,
        sent_by,
        response_status,
        follow_up_required,
        follow_up_date || null,
        channel_used
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating communication record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}