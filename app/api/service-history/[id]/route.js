import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/service-history/{id}:
 *   get:
 *     summary: Get a service history record by ID
 *     description: Retrieve a single service history record by its ID
 *     tags: [Service History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service history record retrieved successfully
 *       404:
 *         description: Service history record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM service_history WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching service history record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-history/{id}:
 *   put:
 *     summary: Update a service history record
 *     description: Update an existing service history record by ID
 *     tags: [Service History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *     responses:
 *       200:
 *         description: Service history record updated successfully
 *       404:
 *         description: Service history record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(body).forEach(key => {
      if (body[key] !== undefined && key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${++paramCount}`);
        values.push(body[key]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = $${++paramCount}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE service_history SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating service history record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/service-history/{id}:
 *   delete:
 *     summary: Delete a service history record
 *     description: Delete a service history record by ID
 *     tags: [Service History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service history record deleted successfully
 *       404:
 *         description: Service history record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM service_history WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Service history record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting service history record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}