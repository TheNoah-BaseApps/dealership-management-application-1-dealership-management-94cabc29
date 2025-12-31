import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/parts-inventory/{id}:
 *   get:
 *     summary: Get a specific parts inventory item
 *     description: Retrieve details of a specific part by ID
 *     tags: [Parts Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID or Part Number
 *     responses:
 *       200:
 *         description: Parts inventory item details
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM parts_inventory WHERE part_id = $1 OR part_number = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching parts inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/parts-inventory/{id}:
 *   put:
 *     summary: Update a parts inventory item
 *     description: Update details of a specific part
 *     tags: [Parts Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Part updated successfully
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'part_name', 'part_number', 'quantity_available', 'reorder_level',
      'location', 'supplier_name', 'unit_price', 'part_category',
      'compatibility_info', 'last_restocked_date'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE parts_inventory 
       SET ${updateFields.join(', ')}
       WHERE part_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating parts inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/parts-inventory/{id}:
 *   delete:
 *     summary: Delete a parts inventory item
 *     description: Remove a part from inventory
 *     tags: [Parts Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     responses:
 *       200:
 *         description: Part deleted successfully
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if part is referenced in parts_orders
    const ordersCheck = await query(
      'SELECT COUNT(*) as count FROM parts_orders WHERE part_id = $1',
      [id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete part with existing orders' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM parts_inventory WHERE part_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Part deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parts inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}