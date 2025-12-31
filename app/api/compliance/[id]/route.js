import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/compliance/{id}:
 *   get:
 *     summary: Get a single compliance record
 *     description: Retrieve a specific compliance record by ID
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Compliance record ID
 *     responses:
 *       200:
 *         description: Compliance record details
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM compliance WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance/{id}:
 *   put:
 *     summary: Update a compliance record
 *     description: Update an existing compliance record
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      compliance_type,
      applicable_regulation,
      effective_date,
      due_date,
      responsible_person,
      compliance_status,
      documentation_link,
      audit_trail_id,
      remarks,
      department
    } = body;

    const result = await query(
      `UPDATE compliance SET
        compliance_type = COALESCE($1, compliance_type),
        applicable_regulation = COALESCE($2, applicable_regulation),
        effective_date = COALESCE($3, effective_date),
        due_date = COALESCE($4, due_date),
        responsible_person = COALESCE($5, responsible_person),
        compliance_status = COALESCE($6, compliance_status),
        documentation_link = COALESCE($7, documentation_link),
        audit_trail_id = COALESCE($8, audit_trail_id),
        remarks = COALESCE($9, remarks),
        department = COALESCE($10, department),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        compliance_type,
        applicable_regulation,
        effective_date,
        due_date,
        responsible_person,
        compliance_status,
        documentation_link,
        audit_trail_id,
        remarks,
        department,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance/{id}:
 *   delete:
 *     summary: Delete a compliance record
 *     description: Delete a compliance record by ID
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM compliance WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Compliance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}