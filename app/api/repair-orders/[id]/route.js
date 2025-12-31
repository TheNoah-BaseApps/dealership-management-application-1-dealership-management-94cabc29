import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/repair-orders/{id}:
 *   get:
 *     summary: Get a repair order by ID
 *     description: Retrieve a single repair order by its ID
 *     tags: [Repair Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Repair order retrieved successfully
 *       404:
 *         description: Repair order not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM repair_orders WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching repair order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/repair-orders/{id}:
 *   put:
 *     summary: Update a repair order
 *     description: Update an existing repair order by ID
 *     tags: [Repair Orders]
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
 *     responses:
 *       200:
 *         description: Repair order updated successfully
 *       404:
 *         description: Repair order not found
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
      `UPDATE repair_orders SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating repair order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/repair-orders/{id}:
 *   delete:
 *     summary: Delete a repair order
 *     description: Delete a repair order by ID
 *     tags: [Repair Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Repair order deleted successfully
 *       404:
 *         description: Repair order not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM repair_orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Repair order deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting repair order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}