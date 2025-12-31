import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/order-management:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of all vehicle orders with pagination and filtering
 *     tags: [Order Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
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
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCounter = 1;

    if (status) {
      whereConditions.push(`order_status = $${paramCounter}`);
      params.push(status);
      paramCounter++;
    }

    if (paymentStatus) {
      whereConditions.push(`payment_status = $${paramCounter}`);
      params.push(paymentStatus);
      paramCounter++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT * FROM order_management ${whereClause} ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM order_management ${whereClause}`,
      params.slice(0, -2)
    );

    const total = parseInt(countResult.rows[0].total);

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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/order-management:
 *   post:
 *     summary: Create new order
 *     description: Create a new vehicle order
 *     tags: [Order Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - customer_id
 *               - vehicle_id
 *               - order_date
 *               - order_status
 *               - payment_status
 *               - order_value
 *             properties:
 *               order_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               vehicle_id:
 *                 type: string
 *               order_date:
 *                 type: string
 *                 format: date-time
 *               expected_delivery_date:
 *                 type: string
 *                 format: date-time
 *               order_status:
 *                 type: string
 *               salesperson_id:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               order_value:
 *                 type: number
 *               deposit_amount:
 *                 type: number
 *               trade_in_vehicle_id:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      customer_id,
      vehicle_id,
      order_date,
      expected_delivery_date,
      order_status,
      salesperson_id,
      payment_status,
      order_value,
      deposit_amount,
      trade_in_vehicle_id,
      notes
    } = body;

    // Validation
    if (!order_id || !customer_id || !vehicle_id || !order_date || !order_status || !payment_status || order_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO order_management (
        order_id, customer_id, vehicle_id, order_date, expected_delivery_date,
        order_status, salesperson_id, payment_status, order_value, deposit_amount,
        trade_in_vehicle_id, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        order_id, customer_id, vehicle_id, order_date, expected_delivery_date,
        order_status, salesperson_id, payment_status, order_value, deposit_amount,
        trade_in_vehicle_id, notes
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}