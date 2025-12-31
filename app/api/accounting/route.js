import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/accounting:
 *   get:
 *     summary: Get all accounting transactions
 *     description: Retrieve all accounting transactions with optional filtering and pagination
 *     tags: [Accounting]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: transaction_status
 *         schema:
 *           type: string
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: List of accounting transactions
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('transaction_status');

    let sql = 'SELECT * FROM accounting';
    const params = [];
    
    if (status) {
      sql += ' WHERE transaction_status = $1';
      params.push(status);
      sql += ' ORDER BY transaction_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY transaction_date DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching accounting transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounting:
 *   post:
 *     summary: Create a new accounting transaction
 *     description: Create a new accounting transaction record
 *     tags: [Accounting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accounting_id
 *               - transaction_date
 *               - transaction_type
 *               - account_name
 *               - payment_method
 *               - transaction_status
 *             properties:
 *               accounting_id:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date-time
 *               transaction_type:
 *                 type: string
 *               account_name:
 *                 type: string
 *               debit_amount:
 *                 type: number
 *               credit_amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               reference_id:
 *                 type: string
 *               description:
 *                 type: string
 *               transaction_status:
 *                 type: string
 *               processed_by:
 *                 type: string
 *               approval_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      accounting_id,
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

    // Validation
    if (!accounting_id || !transaction_date || !transaction_type || !account_name || !payment_method || !transaction_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO accounting (
        accounting_id, transaction_date, transaction_type, account_name,
        debit_amount, credit_amount, payment_method, reference_id,
        description, transaction_status, processed_by, approval_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        accounting_id,
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
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating accounting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}