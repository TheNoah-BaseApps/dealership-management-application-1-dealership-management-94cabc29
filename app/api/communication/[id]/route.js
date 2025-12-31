import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/communication/{id}:
 *   get:
 *     summary: Get communication record by ID
 *     description: Retrieve a specific communication record by its ID
 *     tags: [Communication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Communication ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Communication record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM communication WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Communication record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching communication record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/communication/{id}:
 *   put:
 *     summary: Update communication record
 *     description: Update an existing communication record by ID
 *     tags: [Communication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Communication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               communication_type:
 *                 type: string
 *               subject:
 *                 type: string
 *               message_content:
 *                 type: string
 *               response_status:
 *                 type: string
 *               follow_up_required:
 *                 type: boolean
 *               follow_up_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Communication record updated successfully
 *       404:
 *         description: Communication record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE communication SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Communication record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating communication record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/communication/{id}:
 *   delete:
 *     summary: Delete communication record
 *     description: Delete a communication record by ID
 *     tags: [Communication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Communication ID
 *     responses:
 *       200:
 *         description: Communication record deleted successfully
 *       404:
 *         description: Communication record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM communication WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Communication record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Communication record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting communication record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}