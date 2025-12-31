import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/repair-orders:
 *   get:
 *     summary: Get all repair orders
 *     description: Retrieve a list of all repair orders with pagination and filtering
 *     tags: [Repair Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by repair status (Pending, In Progress, Completed, Cancelled)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of repair orders retrieved successfully
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
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM repair_orders';
    const params = [];
    let paramCount = 0;

    if (status) {
      sql += ' WHERE repair_status = $' + (++paramCount);
      params.push(status);
    }

    sql += ' ORDER BY repair_date DESC, created_at DESC LIMIT $' + (++paramCount) + ' OFFSET $' + (++paramCount);
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching repair orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/repair-orders:
 *   post:
 *     summary: Create a new repair order
 *     description: Create a new repair order record
 *     tags: [Repair Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repair_order_id
 *               - customer_id
 *               - vehicle_id
 *               - issue_reported
 *               - repair_date
 *               - repair_cost
 *               - repair_status
 *             properties:
 *               repair_order_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               vehicle_id:
 *                 type: string
 *               issue_reported:
 *                 type: string
 *               diagnosis_summary:
 *                 type: string
 *               repair_date:
 *                 type: string
 *                 format: date-time
 *               parts_replaced:
 *                 type: string
 *               labor_hours:
 *                 type: integer
 *               repair_cost:
 *                 type: integer
 *               warranty_details:
 *                 type: string
 *               technician_id:
 *                 type: string
 *                 format: uuid
 *               repair_status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, Cancelled]
 *     responses:
 *       201:
 *         description: Repair order created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      repair_order_id,
      customer_id,
      vehicle_id,
      issue_reported,
      diagnosis_summary,
      repair_date,
      parts_replaced,
      labor_hours,
      repair_cost,
      warranty_details,
      technician_id,
      repair_status
    } = body;

    // Validation
    if (!repair_order_id || !customer_id || !vehicle_id || !issue_reported || !repair_date || !repair_cost || !repair_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO repair_orders (
        repair_order_id, customer_id, vehicle_id, issue_reported, diagnosis_summary,
        repair_date, parts_replaced, labor_hours, repair_cost, warranty_details,
        technician_id, repair_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        repair_order_id, customer_id, vehicle_id, issue_reported, diagnosis_summary,
        repair_date, parts_replaced, labor_hours || null, repair_cost, warranty_details,
        technician_id, repair_status
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating repair order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}