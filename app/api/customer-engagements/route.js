import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/customer-engagements:
 *   get:
 *     summary: Get all customer engagements
 *     description: Retrieve a list of all customer engagements with optional filtering
 *     tags: [Customer Engagements]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: engagement_type
 *         schema:
 *           type: string
 *         description: Filter by engagement type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved customer engagements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const engagement_type = searchParams.get('engagement_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM customer_engagements WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (customer_id) {
      sql += ` AND customer_id = $${paramIndex}`;
      params.push(customer_id);
      paramIndex++;
    }

    if (engagement_type) {
      sql += ` AND engagement_type = $${paramIndex}`;
      params.push(engagement_type);
      paramIndex++;
    }

    sql += ` ORDER BY engagement_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query('SELECT COUNT(*) FROM customer_engagements WHERE 1=1');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total
    });
  } catch (error) {
    console.error('Error fetching customer engagements:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/customer-engagements:
 *   post:
 *     summary: Create a new customer engagement
 *     description: Create a new customer engagement record
 *     tags: [Customer Engagements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - engagement_id
 *               - customer_id
 *               - engagement_type
 *               - engagement_date
 *               - communication_method
 *             properties:
 *               engagement_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               engagement_type:
 *                 type: string
 *               engagement_date:
 *                 type: string
 *                 format: date-time
 *               campaign_id:
 *                 type: string
 *               response_received:
 *                 type: boolean
 *               reward_points:
 *                 type: integer
 *               communication_method:
 *                 type: string
 *               engagement_outcome:
 *                 type: string
 *               follow_up_needed:
 *                 type: boolean
 *               next_engagement_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Customer engagement created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      engagement_id,
      customer_id,
      engagement_type,
      engagement_date,
      campaign_id,
      response_received = false,
      reward_points,
      communication_method,
      engagement_outcome,
      follow_up_needed = false,
      next_engagement_date
    } = body;

    if (!engagement_id || !customer_id || !engagement_type || !engagement_date || !communication_method) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO customer_engagements (
        engagement_id, customer_id, engagement_type, engagement_date,
        campaign_id, response_received, reward_points, communication_method,
        engagement_outcome, follow_up_needed, next_engagement_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      engagement_id,
      customer_id,
      engagement_type,
      engagement_date,
      campaign_id,
      response_received,
      reward_points,
      communication_method,
      engagement_outcome,
      follow_up_needed,
      next_engagement_date
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer engagement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}