import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/parts-inventory:
 *   get:
 *     summary: Get all parts inventory
 *     description: Retrieve a list of all parts in inventory with optional filtering and pagination
 *     tags: [Parts Inventory]
 *     parameters:
 *       - in: query
 *         name: part_category
 *         schema:
 *           type: string
 *         description: Filter by part category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by storage location
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter parts below reorder level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of parts inventory
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
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const part_category = searchParams.get('part_category');
    const location = searchParams.get('location');
    const low_stock = searchParams.get('low_stock');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM parts_inventory WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (part_category) {
      paramCount++;
      queryText += ` AND part_category = $${paramCount}`;
      queryParams.push(part_category);
    }

    if (location) {
      paramCount++;
      queryText += ` AND location = $${paramCount}`;
      queryParams.push(location);
    }

    if (low_stock === 'true') {
      queryText += ` AND quantity_available <= reorder_level`;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM parts_inventory WHERE 1=1';
    const countParams = [];
    let countParamIndex = 0;

    if (part_category) {
      countParamIndex++;
      countQuery += ` AND part_category = $${countParamIndex}`;
      countParams.push(part_category);
    }

    if (location) {
      countParamIndex++;
      countQuery += ` AND location = $${countParamIndex}`;
      countParams.push(location);
    }

    if (low_stock === 'true') {
      countQuery += ` AND quantity_available <= reorder_level`;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching parts inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/parts-inventory:
 *   post:
 *     summary: Create a new parts inventory item
 *     description: Add a new part to the inventory
 *     tags: [Parts Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - part_name
 *               - part_number
 *               - quantity_available
 *               - reorder_level
 *               - location
 *               - supplier_name
 *               - unit_price
 *               - part_category
 *             properties:
 *               part_name:
 *                 type: string
 *               part_number:
 *                 type: string
 *               quantity_available:
 *                 type: integer
 *               reorder_level:
 *                 type: integer
 *               location:
 *                 type: string
 *               supplier_name:
 *                 type: string
 *               unit_price:
 *                 type: integer
 *               part_category:
 *                 type: string
 *               compatibility_info:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parts inventory item created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      part_name,
      part_number,
      quantity_available,
      reorder_level,
      location,
      supplier_name,
      unit_price,
      part_category,
      compatibility_info
    } = body;

    // Validation
    if (!part_name || !part_number || quantity_available === undefined || 
        reorder_level === undefined || !location || !supplier_name || 
        unit_price === undefined || !part_category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate part_id
    const part_id = `PART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = await query(
      `INSERT INTO parts_inventory 
       (part_id, part_name, part_number, quantity_available, reorder_level, 
        location, supplier_name, unit_price, part_category, compatibility_info, 
        last_restocked_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        part_id,
        part_name,
        part_number,
        quantity_available,
        reorder_level,
        location,
        supplier_name,
        unit_price,
        part_category,
        compatibility_info || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating parts inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}