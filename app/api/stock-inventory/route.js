import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/stock-inventory:
 *   get:
 *     summary: Get all stock inventory
 *     description: Retrieve a list of all vehicle stock inventory with optional filtering
 *     tags: [Stock Inventory]
 *     parameters:
 *       - in: query
 *         name: stock_status
 *         schema:
 *           type: string
 *         description: Filter by stock status
 *       - in: query
 *         name: make
 *         schema:
 *           type: string
 *         description: Filter by vehicle make
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by vehicle model
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
 *     responses:
 *       200:
 *         description: Successfully retrieved stock inventory
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
    const stock_status = searchParams.get('stock_status');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM stock_inventory WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (stock_status) {
      sql += ` AND stock_status = $${paramIndex}`;
      params.push(stock_status);
      paramIndex++;
    }

    if (make) {
      sql += ` AND make ILIKE $${paramIndex}`;
      params.push(`%${make}%`);
      paramIndex++;
    }

    if (model) {
      sql += ` AND model ILIKE $${paramIndex}`;
      params.push(`%${model}%`);
      paramIndex++;
    }

    sql += ` ORDER BY purchase_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query('SELECT COUNT(*) FROM stock_inventory WHERE 1=1');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total
    });
  } catch (error) {
    console.error('Error fetching stock inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/stock-inventory:
 *   post:
 *     summary: Create a new stock inventory item
 *     description: Add a new vehicle to stock inventory
 *     tags: [Stock Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - vin_number
 *               - make
 *               - model
 *               - year
 *               - purchase_date
 *               - stock_status
 *               - purchase_price
 *               - location
 *               - mileage
 *               - color
 *             properties:
 *               vehicle_id:
 *                 type: string
 *               vin_number:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               purchase_date:
 *                 type: string
 *                 format: date-time
 *               stock_status:
 *                 type: string
 *               purchase_price:
 *                 type: integer
 *               location:
 *                 type: string
 *               mileage:
 *                 type: integer
 *               color:
 *                 type: string
 *               last_inspection_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Stock inventory item created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      vehicle_id,
      vin_number,
      make,
      model,
      year,
      purchase_date,
      stock_status,
      purchase_price,
      location,
      mileage,
      color,
      last_inspection_date
    } = body;

    if (!vehicle_id || !vin_number || !make || !model || !year || !purchase_date || 
        !stock_status || !purchase_price || !location || mileage === undefined || !color) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO stock_inventory (
        vehicle_id, vin_number, make, model, year, purchase_date,
        stock_status, purchase_price, location, mileage, color,
        last_inspection_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const result = await query(sql, [
      vehicle_id,
      vin_number,
      make,
      model,
      year,
      purchase_date,
      stock_status,
      purchase_price,
      location,
      mileage,
      color,
      last_inspection_date
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stock inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}