/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get sales by salesperson
    const salesResult = await query(
      `SELECT u.name, COUNT(s.id) as count, COALESCE(SUM(s.sale_price), 0) as total_sales
       FROM users u
       LEFT JOIN sales s ON u.id = s.salesperson_id
       WHERE u.role IN ('salesperson', 'manager')
       GROUP BY u.id, u.name
       ORDER BY total_sales DESC`,
      []
    );

    return NextResponse.json({
      success: true,
      data: {
        salespersons: salesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}