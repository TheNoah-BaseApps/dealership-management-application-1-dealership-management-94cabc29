import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/accounting/{id}:
 *   get:
 *     summary: Get a single accounting transaction
 *     description: Retrieve a specific accounting transaction by ID
 *     tags: [Accounting]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM accounting WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching accounting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounting/{id}:
 *   put:
 *     summary: Update an accounting transaction
 *     description: Update an existing accounting transaction
 *     tags: [Accounting]
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
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      transaction_date,
      transaction_type,
      account_name,
      debit_amount,
      credit_amount,
      payment_method,
      reference_id,
      description,
      transaction_status,
      processed_by,
      approval_date
    } = body;

    const result = await query(
      `UPDATE accounting SET
        transaction_date = COALESCE($1, transaction_date),
        transaction_type = COALESCE($2, transaction_type),
        account_name = COALESCE($3, account_name),
        debit_amount = COALESCE($4, debit_amount),
        credit_amount = COALESCE($5, credit_amount),
        payment_method = COALESCE($6, payment_method),
        reference_id = COALESCE($7, reference_id),
        description = COALESCE($8, description),
        transaction_status = COALESCE($9, transaction_status),
        processed_by = COALESCE($10, processed_by),
        approval_date = COALESCE($11, approval_date),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        transaction_date,
        transaction_type,
        account_name,
        debit_amount,
        credit_amount,
        payment_method,
        reference_id,
        description,
        transaction_status,
        processed_by,
        approval_date,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating accounting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounting/{id}:
 *   delete:
 *     summary: Delete an accounting transaction
 *     description: Delete an accounting transaction by ID
 *     tags: [Accounting]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM accounting WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accounting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}