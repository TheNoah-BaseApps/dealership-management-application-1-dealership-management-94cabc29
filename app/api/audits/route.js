import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/audits:
 *   get:
 *     summary: Get all audits
 *     description: Retrieve a list of all dealership audits with pagination and filtering
 *     tags: [Audits]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: audit_status
 *         schema:
 *           type: string
 *         description: Filter by audit status
 *       - in: query
 *         name: audit_type
 *         schema:
 *           type: string
 *         description: Filter by audit type
 *     responses:
 *       200:
 *         description: Successful response with list of audits
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const auditStatus = searchParams.get('audit_status');
    const auditType = searchParams.get('audit_type');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM audits WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (auditStatus) {
      queryText += ` AND audit_status = $${paramCount}`;
      queryParams.push(auditStatus);
      paramCount++;
    }

    if (auditType) {
      queryText += ` AND audit_type = $${paramCount}`;
      queryParams.push(auditType);
      paramCount++;
    }

    queryText += ` ORDER BY audit_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    const countResult = await query('SELECT COUNT(*) FROM audits WHERE 1=1' + 
      (auditStatus ? ' AND audit_status = $1' : '') + 
      (auditType ? ` AND audit_type = $${auditStatus ? 2 : 1}` : ''),
      [auditStatus, auditType].filter(Boolean)
    );

    const total = parseInt(countResult.rows[0].count);

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
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/audits:
 *   post:
 *     summary: Create a new audit
 *     description: Create a new dealership audit record
 *     tags: [Audits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audit_id
 *               - audit_type
 *               - audit_date
 *               - auditor_name
 *               - area_audited
 *               - audit_status
 *             properties:
 *               audit_id:
 *                 type: string
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
 *       201:
 *         description: Audit created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      audit_id,
      audit_type,
      audit_date,
      auditor_name,
      area_audited,
      audit_status,
      non_compliance_issues,
      corrective_actions,
      report_submission_date,
      follow_up_date,
      audit_summary
    } = body;

    if (!audit_id || !audit_type || !audit_date || !auditor_name || !area_audited || !audit_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO audits (
        audit_id, audit_type, audit_date, auditor_name, area_audited, audit_status,
        non_compliance_issues, corrective_actions, report_submission_date, follow_up_date,
        audit_summary, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
      [
        audit_id,
        audit_type,
        audit_date,
        auditor_name,
        area_audited,
        audit_status,
        non_compliance_issues || null,
        corrective_actions || null,
        report_submission_date || null,
        follow_up_date || null,
        audit_summary || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}