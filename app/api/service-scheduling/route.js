import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/service-scheduling:
 *   get:
 *     summary: Get all service appointments
 *     description: Retrieve a list of all service appointments with pagination and filtering
 *     tags: [Service Scheduling]
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
 *         description: Filter by confirmation status
 *       - in: query
 *         name: service_type
 *         schema:
 *           type: string
 *         description: Filter by service type
 *     responses:
 *       200:
 *         description: List of service appointments retrieved successfully
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
    const serviceType = searchParams.get('service_type');
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCounter = 1;

    if (status) {
      whereConditions.push(`confirmation_status = $${paramCounter}`);
      params.push(status);
      paramCounter++;
    }

    if (serviceType) {
      whereConditions.push(`service_type = $${paramCounter}`);
      params.push(serviceType);
      paramCounter++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT * FROM service_scheduling ${whereClause} ORDER BY appointment_date DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM service_scheduling ${whereClause}`,
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
    console.error('Error fetching service appointments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-scheduling:
 *   post:
 *     summary: Create new service appointment
 *     description: Schedule a new service appointment
 *     tags: [Service Scheduling]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule_id
 *               - customer_id
 *               - vehicle_id
 *               - appointment_date
 *               - service_type
 *               - preferred_time_slot
 *               - booking_channel
 *               - confirmation_status
 *             properties:
 *               schedule_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               vehicle_id:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *               service_type:
 *                 type: string
 *               preferred_time_slot:
 *                 type: string
 *               technician_id:
 *                 type: string
 *               booking_channel:
 *                 type: string
 *               confirmation_status:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service appointment created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      schedule_id,
      customer_id,
      vehicle_id,
      appointment_date,
      service_type,
      preferred_time_slot,
      technician_id,
      booking_channel,
      confirmation_status,
      remarks
    } = body;

    // Validation
    if (!schedule_id || !customer_id || !vehicle_id || !appointment_date || !service_type || !preferred_time_slot || !booking_channel || !confirmation_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO service_scheduling (
        schedule_id, customer_id, vehicle_id, appointment_date, service_type,
        preferred_time_slot, technician_id, booking_channel, confirmation_status,
        remarks, created_date, last_modified_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        schedule_id, customer_id, vehicle_id, appointment_date, service_type,
        preferred_time_slot, technician_id, booking_channel, confirmation_status,
        remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service appointment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}