import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/service-history:
 *   get:
 *     summary: Get all service history records
 *     description: Retrieve a list of all service history records with pagination and filtering
 *     tags: [Service History]
 *     parameters:
 *       - in: query
 *         name: vehicle_id
 *         schema:
 *           type: string
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by customer ID
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
 *         description: Service history records retrieved successfully
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
    const vehicle_id = searchParams.get('vehicle_id');
    const customer_id = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM service_history';
    const params = [];
    const conditions = [];
    let paramCount = 0;

    if (vehicle_id) {
      conditions.push('vehicle_id = $' + (++paramCount));
      params.push(vehicle_id);
    }

    if (customer_id) {
      conditions.push('customer_id = $' + (++paramCount));
      params.push(customer_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY service_date DESC, created_at DESC LIMIT $' + (++paramCount) + ' OFFSET $' + (++paramCount);
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching service history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-history:
 *   post:
 *     summary: Create a new service history record
 *     description: Create a new service history entry
 *     tags: [Service History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_history_id
 *               - vehicle_id
 *               - customer_id
 *               - service_date
 *               - service_type
 *               - service_center
 *               - total_cost
 *               - mileage_at_service
 *               - warranty_claim
 *             properties:
 *               service_history_id:
 *                 type: string
 *               vehicle_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               service_date:
 *                 type: string
 *                 format: date-time
 *               service_type:
 *                 type: string
 *               service_details:
 *                 type: string
 *               technician_name:
 *                 type: string
 *               service_center:
 *                 type: string
 *               total_cost:
 *                 type: integer
 *               mileage_at_service:
 *                 type: integer
 *               warranty_claim:
 *                 type: boolean
 *               service_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Service history record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      service_history_id,
      vehicle_id,
      customer_id,
      service_date,
      service_type,
      service_details,
      technician_name,
      service_center,
      total_cost,
      mileage_at_service,
      warranty_claim,
      service_rating
    } = body;

    // Validation
    if (!service_history_id || !vehicle_id || !customer_id || !service_date || !service_type || !service_center || total_cost === undefined || !mileage_at_service || warranty_claim === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO service_history (
        service_history_id, vehicle_id, customer_id, service_date, service_type,
        service_details, technician_name, service_center, total_cost, mileage_at_service,
        warranty_claim, service_rating, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        service_history_id, vehicle_id, customer_id, service_date, service_type,
        service_details, technician_name, service_center, total_cost, mileage_at_service,
        warranty_claim, service_rating || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service history record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}