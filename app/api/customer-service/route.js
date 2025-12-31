import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/customer-service:
 *   get:
 *     summary: Get all customer service requests
 *     description: Retrieve all customer service requests with optional filtering
 *     tags: [Customer Service]
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: resolution_status
 *         schema:
 *           type: string
 *         description: Filter by resolution status
 *       - in: query
 *         name: priority_level
 *         schema:
 *           type: string
 *         description: Filter by priority level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (default 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip (default 0)
 *     responses:
 *       200:
 *         description: List of customer service requests
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
 *   post:
 *     summary: Create a new customer service request
 *     description: Create a new customer service request
 *     tags: [Customer Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - issue_type
 *               - issue_description
 *               - priority_level
 *               - communication_mode
 *             properties:
 *               customer_id:
 *                 type: string
 *               issue_type:
 *                 type: string
 *               issue_description:
 *                 type: string
 *               assigned_agent:
 *                 type: string
 *               priority_level:
 *                 type: string
 *               communication_mode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer service request created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const resolution_status = searchParams.get('resolution_status');
    const priority_level = searchParams.get('priority_level');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM customer_service WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (customer_id) {
      queryText += ` AND customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (resolution_status) {
      queryText += ` AND resolution_status = $${paramCount}`;
      params.push(resolution_status);
      paramCount++;
    }

    if (priority_level) {
      queryText += ` AND priority_level = $${paramCount}`;
      params.push(priority_level);
      paramCount++;
    }

    queryText += ` ORDER BY request_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM customer_service WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (customer_id) {
      countQuery += ` AND customer_id = $${countParamCount}`;
      countParams.push(customer_id);
      countParamCount++;
    }

    if (resolution_status) {
      countQuery += ` AND resolution_status = $${countParamCount}`;
      countParams.push(resolution_status);
      countParamCount++;
    }

    if (priority_level) {
      countQuery += ` AND priority_level = $${countParamCount}`;
      countParams.push(priority_level);
      countParamCount++;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total
    });
  } catch (error) {
    console.error('Error fetching customer service requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      issue_type,
      issue_description,
      assigned_agent,
      priority_level,
      communication_mode
    } = body;

    // Validation
    if (!customer_id || !issue_type || !issue_description || !priority_level || !communication_mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate service_request_id
    const service_request_id = `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await query(
      `INSERT INTO customer_service (
        service_request_id, customer_id, request_date, issue_type, 
        issue_description, assigned_agent, priority_level, 
        resolution_status, communication_mode
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        service_request_id,
        customer_id,
        issue_type,
        issue_description,
        assigned_agent || null,
        priority_level,
        'Open',
        communication_mode
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer service request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}