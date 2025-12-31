import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/parts-orders:
 *   get:
 *     summary: Get all parts orders
 *     description: Retrieve a list of all parts orders with optional filtering and pagination
 *     tags: [Parts Orders]
 *     parameters:
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: string
 *         description: Filter by supplier
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of parts orders
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
    const order_status = searchParams.get('order_status');
    const payment_status = searchParams.get('payment_status');
    const supplier_id = searchParams.get('supplier_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT po.*, pi.part_name, pi.part_number, pi.part_category
      FROM parts_orders po
      LEFT JOIN parts_inventory pi ON po.part_id = pi.part_id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 0;

    if (order_status) {
      paramCount++;
      queryText += ` AND po.order_status = $${paramCount}`;
      queryParams.push(order_status);
    }

    if (payment_status) {
      paramCount++;
      queryText += ` AND po.payment_status = $${paramCount}`;
      queryParams.push(payment_status);
    }

    if (supplier_id) {
      paramCount++;
      queryText += ` AND po.supplier_id = $${paramCount}`;
      queryParams.push(supplier_id);
    }

    queryText += ` ORDER BY po.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM parts_orders WHERE 1=1';
    const countParams = [];
    let countParamIndex = 0;

    if (order_status) {
      countParamIndex++;
      countQuery += ` AND order_status = $${countParamIndex}`;
      countParams.push(order_status);
    }

    if (payment_status) {
      countParamIndex++;
      countQuery += ` AND payment_status = $${countParamIndex}`;
      countParams.push(payment_status);
    }

    if (supplier_id) {
      countParamIndex++;
      countQuery += ` AND supplier_id = $${countParamIndex}`;
      countParams.push(supplier_id);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching parts orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/parts-orders:
 *   post:
 *     summary: Create a new parts order
 *     description: Place a new order for parts
 *     tags: [Parts Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - part_id
 *               - quantity_ordered
 *               - supplier_id
 *               - unit_cost
 *               - order_status
 *               - payment_status
 *             properties:
 *               part_id:
 *                 type: string
 *               quantity_ordered:
 *                 type: integer
 *               supplier_id:
 *                 type: string
 *               expected_delivery:
 *                 type: string
 *                 format: date-time
 *               order_status:
 *                 type: string
 *               unit_cost:
 *                 type: integer
 *               payment_status:
 *                 type: string
 *               delivery_tracking_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parts order created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      part_id,
      quantity_ordered,
      supplier_id,
      expected_delivery,
      order_status,
      unit_cost,
      payment_status,
      delivery_tracking_id
    } = body;

    // Validation
    if (!part_id || quantity_ordered === undefined || !supplier_id || 
        unit_cost === undefined || !order_status || !payment_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify part exists
    const partCheck = await query(
      'SELECT * FROM parts_inventory WHERE part_id = $1',
      [part_id]
    );

    if (partCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Part not found in inventory' },
        { status: 404 }
      );
    }

    // Generate parts_order_id
    const parts_order_id = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total cost
    const total_cost = unit_cost * quantity_ordered;

    const result = await query(
      `INSERT INTO parts_orders 
       (parts_order_id, order_date, part_id, quantity_ordered, supplier_id, 
        expected_delivery, order_status, unit_cost, total_cost, payment_status, 
        delivery_tracking_id, created_at, updated_at)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        parts_order_id,
        part_id,
        quantity_ordered,
        supplier_id,
        expected_delivery || null,
        order_status,
        unit_cost,
        total_cost,
        payment_status,
        delivery_tracking_id || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating parts order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}