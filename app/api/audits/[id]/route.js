import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/audits/{id}:
 *   get:
 *     summary: Get audit by ID
 *     description: Retrieve a specific audit by its ID
 *     tags: [Audits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit ID
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Audit not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM audits WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/audits/{id}:
 *   put:
 *     summary: Update audit
 *     description: Update an existing audit by ID
 *     tags: [Audits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audit_type:
 *                 type: string
 *               audit_date:
 *                 type: string
 *                 format: date-time
 *               auditor_name:
 *                 type: string
 *               area_audited:
 *                 type: string
 *               audit_status:
 *                 type: string
 *               non_compliance_issues:
 *                 type: string
 *               corrective_actions:
 *                 type: string
 *               report_submission_date:
 *                 type: string
 *                 format: date-time
 *               follow_up_date:
 *                 type: string
 *                 format: date-time
 *               audit_summary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audit updated successfully
 *       404:
 *         description: Audit not found
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
      `UPDATE audits SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/audits/{id}:
 *   delete:
 *     summary: Delete audit
 *     description: Delete an audit by ID
 *     tags: [Audits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit ID
 *     responses:
 *       200:
 *         description: Audit deleted successfully
 *       404:
 *         description: Audit not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM audits WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Audit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}