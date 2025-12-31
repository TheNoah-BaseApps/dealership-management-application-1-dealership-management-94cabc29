import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/compliance:
 *   get:
 *     summary: Get all compliance records
 *     description: Retrieve all compliance records with optional filtering and pagination
 *     tags: [Compliance]
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
 *         name: compliance_status
 *         schema:
 *           type: string
 *         description: Filter by compliance status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: List of compliance records
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
    const status = searchParams.get('compliance_status');
    const department = searchParams.get('department');

    let sql = 'SELECT * FROM compliance WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (status) {
      sql += ` AND compliance_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (department) {
      sql += ` AND department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }
    
    sql += ` ORDER BY due_date ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance:
 *   post:
 *     summary: Create a new compliance record
 *     description: Create a new compliance tracking record
 *     tags: [Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - compliance_id
 *               - compliance_type
 *               - applicable_regulation
 *               - effective_date
 *               - due_date
 *               - responsible_person
 *               - compliance_status
 *               - department
 *             properties:
 *               compliance_id:
 *                 type: string
 *               compliance_type:
 *                 type: string
 *               applicable_regulation:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               responsible_person:
 *                 type: string
 *               compliance_status:
 *                 type: string
 *               documentation_link:
 *                 type: string
 *               audit_trail_id:
 *                 type: string
 *               remarks:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compliance record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      compliance_id,
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

    // Validation
    if (!compliance_id || !compliance_type || !applicable_regulation || !effective_date || !due_date || !responsible_person || !compliance_status || !department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO compliance (
        compliance_id, compliance_type, applicable_regulation, effective_date,
        due_date, responsible_person, compliance_status, documentation_link,
        audit_trail_id, remarks, department, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        compliance_id,
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
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}