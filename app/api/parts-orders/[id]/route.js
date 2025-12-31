import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/parts-orders/{id}:
 *   get:
 *     summary: Get a specific parts order
 *     description: Retrieve details of a specific parts order by ID
 *     tags: [Parts Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parts Order ID
 *     responses:
 *       200:
 *         description: Parts order details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT po.*, pi.part_name, pi.part_number, pi.part_category
       FROM parts_orders po
       LEFT JOIN parts_inventory pi ON po.part_id = pi.part_id
       WHERE po.parts_order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Parts order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching parts order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/parts-orders/{id}:
 *   put:
 *     summary: Update a parts order
 *     description: Update details of a specific parts order
 *     tags: [Parts Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parts Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Parts order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  const client = await getClient();
  
  try {
    const { id } = params;
    const body = await request.json();

    await client.query('BEGIN');

    // Check if order_status is being changed to 'Delivered'
    if (body.order_status === 'Delivered') {
      // Get the order details
      const orderResult = await client.query(
        'SELECT part_id, quantity_ordered FROM parts_orders WHERE parts_order_id = $1',
        [id]
      );

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Parts order not found' },
          { status: 404 }
        );
      }

      const { part_id, quantity_ordered } = orderResult.rows[0];

      // Update parts inventory quantity
      await client.query(
        `UPDATE parts_inventory 
         SET quantity_available = quantity_available + $1,
             last_restocked_date = NOW(),
             updated_at = NOW()
         WHERE part_id = $2`,
        [quantity_ordered, part_id]
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'quantity_ordered', 'supplier_id', 'expected_delivery', 'order_status',
      'unit_cost', 'payment_status', 'delivery_tracking_id'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    // Recalculate total_cost if quantity or unit_cost changed
    if (body.quantity_ordered !== undefined || body.unit_cost !== undefined) {
      const currentOrder = await client.query(
        'SELECT quantity_ordered, unit_cost FROM parts_orders WHERE parts_order_id = $1',
        [id]
      );
      
      if (currentOrder.rows.length > 0) {
        const quantity = body.quantity_ordered || currentOrder.rows[0].quantity_ordered;
        const unit_cost = body.unit_cost || currentOrder.rows[0].unit_cost;
        updateFields.push(`total_cost = $${paramCount}`);
        values.push(quantity * unit_cost);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await client.query(
      `UPDATE parts_orders 
       SET ${updateFields.join(', ')}
       WHERE parts_order_id = $${paramCount}
       RETURNING *`,
      values
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Parts order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating parts order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * @swagger
 * /api/parts-orders/{id}:
 *   delete:
 *     summary: Delete a parts order
 *     description: Cancel/remove a parts order
 *     tags: [Parts Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parts Order ID
 *     responses:
 *       200:
 *         description: Parts order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if order is already delivered (shouldn't delete delivered orders)
    const orderCheck = await query(
      'SELECT order_status FROM parts_orders WHERE parts_order_id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Parts order not found' },
        { status: 404 }
      );
    }

    if (orderCheck.rows[0].order_status === 'Delivered') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete delivered orders' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM parts_orders WHERE parts_order_id = $1 RETURNING *',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Parts order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parts order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}