import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/service-scheduling/{id}:
 *   get:
 *     summary: Get service appointment by ID
 *     description: Retrieve a specific service appointment by its ID
 *     tags: [Service Scheduling]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service appointment ID
 *     responses:
 *       200:
 *         description: Service appointment retrieved successfully
 *       404:
 *         description: Service appointment not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await query(
      'SELECT * FROM service_scheduling WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service appointment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-scheduling/{id}:
 *   put:
 *     summary: Update service appointment
 *     description: Update an existing service appointment
 *     tags: [Service Scheduling]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Service appointment updated successfully
 *       404:
 *         description: Service appointment not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updates = [];
    const values = [];
    let paramCounter = 1;

    const allowedFields = [
      'schedule_id', 'customer_id', 'vehicle_id', 'appointment_date', 'service_type',
      'preferred_time_slot', 'technician_id', 'booking_channel', 'confirmation_status',
      'remarks'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCounter}`);
        values.push(body[field]);
        paramCounter++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`last_modified_date = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE service_scheduling SET ${updates.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating service appointment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-scheduling/{id}:
 *   delete:
 *     summary: Delete service appointment
 *     description: Delete a service appointment by ID
 *     tags: [Service Scheduling]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service appointment ID
 *     responses:
 *       200:
 *         description: Service appointment deleted successfully
 *       404:
 *         description: Service appointment not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await query(
      'DELETE FROM service_scheduling WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service appointment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}